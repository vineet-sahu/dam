import { Queue } from "bullmq";
import Redis from "ioredis";
import logger from "../utils/logger";

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

const imageQueue = new Queue("image-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

const videoQueue = new Queue("video-processing", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 10000,
    },
    removeOnComplete: 50,
    removeOnFail: 25,
  },
});

interface AssetJobData {
  assetId: string;
  bucketName: string;
  objectName: string;
  mimeType: string;
  type: "image" | "video" | "document";
}

class QueueService {
  async addImageProcessingJob(data: AssetJobData) {
    try {
      const job = await imageQueue.add("process-image", data, {
        priority: 1,
      });

      logger.info(
        `Image processing job added: ${job.id} for asset: ${data.assetId}`,
      );
      return job;
    } catch (error) {
      logger.error("Error adding image processing job:", error);
      throw error;
    }
  }

  async addVideoProcessingJob(data: AssetJobData) {
    try {
      const job = await videoQueue.add("process-video", data, {
        priority: 2,
      });

      logger.info(
        `Video processing job added: ${job.id} for asset: ${data.assetId}`,
      );
      return job;
    } catch (error) {
      logger.error("Error adding video processing job:", error);
      throw error;
    }
  }

  async addAssetProcessingJob(data: AssetJobData) {
    if (data.type === "image") {
      return this.addImageProcessingJob(data);
    } else if (data.type === "video") {
      return this.addVideoProcessingJob(data);
    } else {
      logger.info(`No processing needed for asset type: ${data.type}`);
      return null;
    }
  }

  async getJobStatus(jobId: string, type: "image" | "video") {
    try {
      const queue = type === "image" ? imageQueue : videoQueue;
      const job = await queue.getJob(jobId);

      if (!job) {
        return null;
      }

      const state = await job.getState();
      const progress = job.progress;
      const failedReason = job.failedReason;

      return {
        id: job.id,
        state,
        progress,
        failedReason,
        data: job.data,
      };
    } catch (error) {
      logger.error("Error getting job status:", error);
      throw error;
    }
  }

  async getQueueStats() {
    try {
      const [imageStats, videoStats] = await Promise.all([
        imageQueue.getJobCounts(),
        videoQueue.getJobCounts(),
      ]);

      return {
        image: imageStats,
        video: videoStats,
      };
    } catch (error) {
      logger.error("Error getting queue stats:", error);
      throw error;
    }
  }

  async pauseQueue(type: "image" | "video") {
    const queue = type === "image" ? imageQueue : videoQueue;
    await queue.pause();
    logger.info(`${type} queue paused`);
  }

  async resumeQueue(type: "image" | "video") {
    const queue = type === "image" ? imageQueue : videoQueue;
    await queue.resume();
    logger.info(`${type} queue resumed`);
  }

  async cleanQueue(type: "image" | "video", grace: number = 3600000) {
    const queue = type === "image" ? imageQueue : videoQueue;

    await queue.clean(grace, 100, "completed");
    await queue.clean(grace, 50, "failed");

    logger.info(`${type} queue cleaned`);
  }

  async retryFailedJob(jobId: string, type: "image" | "video") {
    try {
      const queue = type === "image" ? imageQueue : videoQueue;
      const job = await queue.getJob(jobId);

      if (!job) {
        throw new Error("Job not found");
      }

      await job.retry();
      logger.info(`Job ${jobId} retried`);

      return job;
    } catch (error) {
      logger.error("Error retrying job:", error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      await connection.ping();
      return true;
    } catch (error) {
      logger.error("Queue health check failed:", error);
      return false;
    }
  }
}

export default new QueueService();
