import "dotenv/config";
import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";
import os from "os";
// import { Readable } from "stream";
import logger from "../utils/logger";
import Asset from "../models/Asset";
import { minioClient } from "../services/minioService";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

interface AssetJobData {
  assetId: string;
  bucketName: string;
  objectName: string;
  mimeType: string;
  type: "image" | "video" | "audio" | "document";
}

class AssetProcessorService {
  private tempDir = path.join(os.tmpdir(), "asset-processing");

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Download file from MinIO to temp directory
   */
  async downloadFromMinIO(
    bucketName: string,
    objectName: string,
  ): Promise<string> {
    const tempFilePath = path.join(
      this.tempDir,
      `${Date.now()}-${path.basename(objectName)}`,
    );

    await minioClient.fGetObject(bucketName, objectName, tempFilePath);

    return tempFilePath;
  }

  /**
   * Upload file to MinIO
   */
  async uploadToMinIO(
    filePath: string,
    bucketName: string,
    objectName: string,
    contentType: string,
  ): Promise<string> {
    const metaData = {
      "Content-Type": contentType,
    };

    await minioClient.fPutObject(bucketName, objectName, filePath, metaData);

    return objectName;
  }

  /**
   * Get file size from MinIO
   */
  async getFileSize(bucketName: string, objectName: string): Promise<number> {
    const stat = await minioClient.statObject(bucketName, objectName);
    return stat.size;
  }

  /**
   * Generate image thumbnails
   */
  async processImage(job: Job<AssetJobData>): Promise<any> {
    const { assetId, bucketName, objectName } = job.data;

    logger.info(`Processing image: ${assetId}`);
    await job.updateProgress(10);

    const originalPath = await this.downloadFromMinIO(bucketName, objectName);
    await job.updateProgress(20);

    const metadata = await sharp(originalPath).metadata();
    await job.updateProgress(30);

    const thumbnails: any[] = [];
    const sizes = [
      { name: "small", width: 150, height: 150 },
      { name: "medium", width: 300, height: 300 },
      { name: "large", width: 600, height: 600 },
    ];

    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const thumbnailPath = path.join(
        this.tempDir,
        `${assetId}-${size.name}.jpg`,
      );

      await sharp(originalPath)
        .resize(size.width, size.height, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      const thumbnailObjectName = `thumbnails/${assetId}-${size.name}.jpg`;
      await this.uploadToMinIO(
        thumbnailPath,
        bucketName,
        thumbnailObjectName,
        "image/jpeg",
      );

      const thumbnailSize = fs.statSync(thumbnailPath).size;

      thumbnails.push({
        size: size.name,
        objectName: thumbnailObjectName,
        width: size.width,
        height: size.height,
        fileSize: thumbnailSize,
      });

      fs.unlinkSync(thumbnailPath);
      await job.updateProgress(30 + ((i + 1) / sizes.length) * 40);
    }

    await Asset.update(
      {
        metadata: {
          dimensions: {
            width: metadata.width,
            height: metadata.height,
          },
          format: metadata.format,
          space: metadata.space,
          channels: metadata.channels,
          hasAlpha: metadata.hasAlpha,
          thumbnails,
        },
        status: "completed",
      },
      { where: { id: assetId } },
    );

    fs.unlinkSync(originalPath);
    await job.updateProgress(100);

    logger.info(`Image processing completed: ${assetId}`);
    return { assetId, thumbnails, metadata };
  }

  /**
   * Process video - transcode and generate thumbnails
   */
  async processVideo(job: Job<AssetJobData>): Promise<any> {
    const { assetId, bucketName, objectName } = job.data;

    logger.info(`Processing video: ${assetId}`);
    await job.updateProgress(5);

    const originalPath = await this.downloadFromMinIO(bucketName, objectName);
    await job.updateProgress(10);

    const videoMetadata: any = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(originalPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });

    const videoStream = videoMetadata.streams.find(
      (s: any) => s.codec_type === "video",
    );
    const duration = videoMetadata.format.duration;
    const dimensions = {
      width: videoStream?.width || 0,
      height: videoStream?.height || 0,
    };

    await job.updateProgress(15);

    const thumbnailPath = path.join(this.tempDir, `${assetId}-thumbnail.jpg`);
    await new Promise((resolve, reject) => {
      ffmpeg(originalPath)
        .screenshots({
          timestamps: [Math.floor(duration / 2)],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: "640x360",
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const thumbnailObjectName = `thumbnails/${assetId}-thumbnail.jpg`;
    await this.uploadToMinIO(
      thumbnailPath,
      bucketName,
      thumbnailObjectName,
      "image/jpeg",
    );

    const thumbnailSize = fs.statSync(thumbnailPath).size;
    fs.unlinkSync(thumbnailPath);

    await job.updateProgress(30);

    const resolutions = [
      { name: "1080p", width: 1920, height: 1080, bitrate: "5000k" },
      { name: "720p", width: 1280, height: 720, bitrate: "2500k" },
      { name: "480p", width: 854, height: 480, bitrate: "1000k" },
    ];

    const transcodedVersions: any[] = [];
    const progressPerResolution = 60 / resolutions.length;

    for (let i = 0; i < resolutions.length; i++) {
      const res = resolutions[i];

      if (dimensions.height < res.height) {
        logger.info(`Skipping ${res.name} - original resolution is smaller`);
        continue;
      }

      const outputPath = path.join(this.tempDir, `${assetId}-${res.name}.mp4`);

      await new Promise((resolve, reject) => {
        ffmpeg(originalPath)
          .size(`${res.width}x${res.height}`)
          .videoBitrate(res.bitrate)
          .videoCodec("libx264")
          .audioCodec("aac")
          .audioBitrate("128k")
          .format("mp4")
          .outputOptions(["-preset fast", "-movflags +faststart"])
          .on("progress", (progress) => {
            const currentProgress =
              30 +
              i * progressPerResolution +
              ((progress.percent || 0) / 100) * progressPerResolution;
            job.updateProgress(Math.floor(currentProgress));
          })
          .on("end", resolve)
          .on("error", reject)
          .save(outputPath);
      });

      const transcodedObjectName = `videos/${assetId}-${res.name}.mp4`;
      await this.uploadToMinIO(
        outputPath,
        bucketName,
        transcodedObjectName,
        "video/mp4",
      );

      const stats = fs.statSync(outputPath);
      transcodedVersions.push({
        resolution: res.name,
        objectName: transcodedObjectName,
        fileSize: stats.size,
        width: res.width,
        height: res.height,
        bitrate: res.bitrate,
      });

      fs.unlinkSync(outputPath);
    }

    await job.updateProgress(90);

    await Asset.update(
      {
        metadata: {
          dimensions,
          duration,
          format: videoMetadata.format.format_name,
          bitrate: videoMetadata.format.bit_rate,
          codec: videoStream?.codec_name,
          thumbnails: [
            {
              objectName: thumbnailObjectName,
              fileSize: thumbnailSize,
            },
          ],
          transcodedVersions,
        },
        status: "completed",
      },
      { where: { id: assetId } },
    );

    fs.unlinkSync(originalPath);
    await job.updateProgress(100);

    logger.info(`Video processing completed: ${assetId}`);
    return { assetId, thumbnails: [thumbnailObjectName], transcodedVersions };
  }

  /**
   * Extract metadata for documents
   */
  async processDocument(job: Job<AssetJobData>): Promise<any> {
    const { assetId, bucketName, objectName } = job.data;

    logger.info(`Processing document: ${assetId}`);
    await job.updateProgress(50);

    const stat = await minioClient.statObject(bucketName, objectName);

    await Asset.update(
      {
        metadata: {
          fileSize: stat.size,
          contentType: stat.metaData?.["content-type"],
          lastModified: stat.lastModified,
        },
        status: "completed",
      },
      { where: { id: assetId } },
    );

    await job.updateProgress(100);
    logger.info(`Document processing completed: ${assetId}`);

    return { assetId };
  }
}

const processor = new AssetProcessorService();

const imageWorker = new Worker(
  "image-processing",
  async (job) => {
    try {
      return await processor.processImage(job);
    } catch (error) {
      logger.error(`Image processing failed for job ${job.id}:`, error);

      await Asset.update(
        { status: "failed" },
        { where: { id: job.data.assetId } },
      );

      throw error;
    }
  },
  { connection, concurrency: 2 },
);

const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    try {
      return await processor.processVideo(job);
    } catch (error) {
      logger.error(`Video processing failed for job ${job.id}:`, error);

      await Asset.update(
        { status: "failed" },
        { where: { id: job.data.assetId } },
      );

      throw error;
    }
  },
  { connection, concurrency: 1 },
);

imageWorker.on("completed", (job) => {
  logger.info(`✓ Image job ${job.id} completed successfully`);
});

imageWorker.on("failed", (job, err) => {
  logger.error(`✗ Image job ${job?.id} failed:`, err.message);
});

videoWorker.on("completed", (job) => {
  logger.info(`✓ Video job ${job.id} completed successfully`);
});

videoWorker.on("failed", (job, err) => {
  logger.error(`✗ Video job ${job?.id} failed:`, err.message);
});

logger.info("🚀 Asset processing workers started");

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing workers...");
  await imageWorker.close();
  await videoWorker.close();
  process.exit(0);
});
