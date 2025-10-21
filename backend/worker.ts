import "dotenv/config";
import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import minioService from "./src/services/minioService";
import logger from "./src/utils/logger";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";
import Asset from "./src/models/Asset";
import sequelize from "./src/config/database.ts";

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

interface AssetProcessingJob {
  assetId: string;
  bucketName: string;
  objectName: string;
  mimeType: string;
  type: "image" | "video" | "document";
}

const workerConcurrency = parseInt(process.env.WORKER_CONCURRENCY || "5");

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

const imageWorker = new Worker<AssetProcessingJob>(
  "image-processing",
  async (job: Job<AssetProcessingJob>) => {
    const { assetId, bucketName, objectName } = job.data;

    logger.info(`Processing image: ${assetId}`);

    try {
      await Asset.update({ status: "processing" }, { where: { id: assetId } });

      const imageBuffer = await minioService.getFileBuffer(
        bucketName,
        objectName,
      );

      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(300, 300, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailResult = await minioService.uploadFile(
        minioService.buckets.THUMBNAILS,
        thumbnailBuffer,
        `thumb-${objectName}`,
        "image/jpeg",
      );

      const metadata = await sharp(imageBuffer).metadata();

      await Asset.update(
        {
          status: "completed",
          thumbnailPath: `${thumbnailResult.bucketName}/${thumbnailResult.objectName}`,
          metadata: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            space: metadata.space,
            hasAlpha: metadata.hasAlpha,
          },
        },
        { where: { id: assetId } },
      );

      logger.info(`Image processed successfully: ${assetId}`);
      return {
        success: true,
        assetId,
        thumbnailPath: thumbnailResult.objectName,
      };
    } catch (error) {
      logger.error(`Error processing image ${assetId}:`, error);

      await Asset.update(
        {
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
        { where: { id: assetId } },
      );

      throw error;
    }
  },
  {
    connection,
    concurrency: workerConcurrency,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
);

const videoWorker = new Worker<AssetProcessingJob>(
  "video-processing",
  async (job: Job<AssetProcessingJob>) => {
    const { assetId, bucketName, objectName } = job.data;

    logger.info(`Processing video: ${assetId}`);

    try {
      await Asset.update({ status: "processing" }, { where: { id: assetId } });

      const videoStream = await minioService.getFile(bucketName, objectName);
      const tempVideoPath = path.join("/tmp", `video-${assetId}-${objectName}`);
      const writeStream = fs.createWriteStream(tempVideoPath);

      await new Promise<void>((resolve, reject) => {
        videoStream.pipe(writeStream);
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      const thumbnailPath = path.join("/tmp", `thumb-${assetId}.jpg`);
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempVideoPath)
          .screenshots({
            count: 1,
            folder: "/tmp",
            filename: `thumb-${assetId}.jpg`,
            size: "300x?",
          })
          .on("end", () => resolve())
          .on("error", reject);
      });

      const thumbnailBuffer = fs.readFileSync(thumbnailPath);

      fs.unlinkSync(thumbnailPath);

      const thumbnailResult = await minioService.uploadFile(
        minioService.buckets.THUMBNAILS,
        thumbnailBuffer,
        `thumb-${objectName}.jpg`,
        "image/jpeg",
      );

      const metadata = await new Promise<any>((resolve, reject) => {
        ffmpeg.ffprobe(tempVideoPath, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      const videoStreamData = metadata.streams.find(
        (s: any) => s.codec_type === "video",
      );
      const duration = metadata.format.duration;

      const qualities = [
        { name: "720p", size: "1280x720", bitrate: "2500k" },
        { name: "480p", size: "854x480", bitrate: "1000k" },
      ];

      const transcodedPaths: Record<string, string> = {};

      for (const quality of qualities) {
        const transcodedPath = path.join(
          "/tmp",
          `${quality.name}-${assetId}-${objectName}`,
        );

        await new Promise<void>((resolve, reject) => {
          ffmpeg(tempVideoPath)
            .size(quality.size)
            .videoBitrate(quality.bitrate)
            .format("mp4")
            .output(transcodedPath)
            .on("end", () => resolve())
            .on("error", reject)
            .run();
        });

        const transcodedBuffer = fs.readFileSync(transcodedPath);

        fs.unlinkSync(transcodedPath);

        const transcodedResult = await minioService.uploadFile(
          minioService.buckets.TRANSCODED,
          transcodedBuffer,
          `${quality.name}-${objectName}`,
          "video/mp4",
        );

        transcodedPaths[quality.name] =
          `${transcodedResult.bucketName}/${transcodedResult.objectName}`;
      }

      fs.unlinkSync(tempVideoPath);

      await Asset.update(
        {
          status: "completed",
          thumbnailPath: `${thumbnailResult.bucketName}/${thumbnailResult.objectName}`,
          transcodedPaths,
          metadata: {
            duration,
            width: videoStreamData?.width,
            height: videoStreamData?.height,
            codec: videoStreamData?.codec_name,
            bitrate: metadata.format.bit_rate,
          },
        },
        { where: { id: assetId } },
      );

      logger.info(`Video processed successfully: ${assetId}`);
      return { success: true, assetId };
    } catch (error) {
      logger.error(`Error processing video ${assetId}:`, error);

      await Asset.update(
        {
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
        { where: { id: assetId } },
      );

      throw error;
    }
  },
  {
    connection,
    concurrency: Math.max(1, Math.floor(workerConcurrency / 2)),
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 25 },
  },
);

const workers = [imageWorker, videoWorker];

workers.forEach((worker) => {
  worker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
  });

  worker.on("error", (err) => {
    logger.error("Worker error:", err);
  });
});

async function initializeWorker() {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established");
    logger.info(`Workers started with concurrency: ${workerConcurrency}`);
    logger.info(`Image worker: ${workerConcurrency} concurrent jobs`);
    logger.info(
      `Video worker: ${Math.max(1, Math.floor(workerConcurrency / 2))} concurrent jobs`,
    );
  } catch (error) {
    logger.error("Unable to connect to database:", error);
    process.exit(1);
  }
}

async function shutdown() {
  logger.info("Shutting down workers gracefully...");
  try {
    await Promise.all(workers.map((w) => w.close()));
    await connection.quit();
    await sequelize.close();
    logger.info("Workers shut down successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

initializeWorker().catch((error) => {
  logger.error("Failed to initialize worker:", error);
  process.exit(1);
});
