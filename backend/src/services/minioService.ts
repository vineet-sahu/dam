import * as Minio from "minio";
import logger from "../utils/logger";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { Readable } from "stream";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
});

const BUCKETS = {
  ORIGINALS: process.env.MINIO_BUCKET_ORIGINALS || "originals",
  THUMBNAILS: process.env.MINIO_BUCKET_THUMBNAILS || "thumbnails",
  TRANSCODED: process.env.MINIO_BUCKET_TRANSCODED || "transcoded",
} as const;

interface UploadResult {
  bucketName: string;
  objectName: string;
  size: number;
}

interface BucketConfig {
  ORIGINALS: string;
  THUMBNAILS: string;
  TRANSCODED: string;
}

class MinioService {
  private client: Minio.Client;
  public buckets: BucketConfig;

  constructor() {
    this.client = minioClient;
    this.buckets = BUCKETS;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.listBuckets();
      return true;
    } catch (error) {
      logger.error("MinIO health check failed:", error);
      return false;
    }
  }

  async uploadFile(
    bucketName: string,
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<UploadResult> {
    try {
      const objectName = `${uuidv4()}${path.extname(filename)}`;

      const metaData = {
        "Content-Type": mimeType,
        "X-Original-Name": filename,
      };

      await this.client.putObject(
        bucketName,
        objectName,
        fileBuffer,
        fileBuffer.length,
        metaData,
      );

      logger.info(`File uploaded to MinIO: ${bucketName}/${objectName}`);

      return {
        bucketName,
        objectName,
        size: fileBuffer.length,
      };
    } catch (error) {
      logger.error("Error uploading to MinIO:", error);
      throw new Error("Failed to upload file to storage");
    }
  }

  async getFile(bucketName: string, objectName: string): Promise<Readable> {
    try {
      const stream = await this.client.getObject(bucketName, objectName);
      return stream;
    } catch (error) {
      logger.error("Error getting file from MinIO:", error);
      throw new Error("Failed to retrieve file from storage");
    }
  }

  async getFileBuffer(bucketName: string, objectName: string): Promise<Buffer> {
    try {
      const chunks: Buffer[] = [];
      const stream = await this.getFile(bucketName, objectName);

      return new Promise((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      });
    } catch (error) {
      logger.error("Error getting file buffer from MinIO:", error);
      throw error;
    }
  }

  async getPresignedUrl(
    bucketName: string,
    objectName: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    try {
      const url = await this.client.presignedGetObject(
        bucketName,
        objectName,
        expirySeconds,
      );
      return url;
    } catch (error) {
      logger.error("Error generating presigned URL:", error);
      throw new Error("Failed to generate download URL");
    }
  }

  async deleteFile(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.client.removeObject(bucketName, objectName);
      logger.info(`File deleted from MinIO: ${bucketName}/${objectName}`);
      return true;
    } catch (error) {
      logger.error("Error deleting file from MinIO:", error);
      throw new Error("Failed to delete file from storage");
    }
  }

  async getFileStats(
    bucketName: string,
    objectName: string,
  ): Promise<Minio.BucketItemStat> {
    try {
      const stat = await this.client.statObject(bucketName, objectName);
      return stat;
    } catch (error) {
      logger.error("Error getting file stats:", error);
      throw new Error("Failed to get file information");
    }
  }
}

export default new MinioService();
