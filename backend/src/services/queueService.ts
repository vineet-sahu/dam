import { Queue } from 'bullmq';
import Redis from 'ioredis';
import logger from '../utils/logger';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

const imageQueue = new Queue('image-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

const videoQueue = new Queue('video-processing', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: 50,
    removeOnFail: 25,
  },
});

export const assetQueue = new Queue('asset-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export interface AssetJobData {
  assetId: string;
  userId?: string;
  bucketName: string;
  objectName: string;
  filePath?: string;
  filename?: string;
  mimeType: string;
  size?: number;
  type: 'image' | 'video' | 'document';
  processType?: 'thumbnail' | 'optimization' | 'conversion' | 'metadata';
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  };
}
class QueueService {
  async addImageProcessingJob(data: AssetJobData) {
    try {
      const job = await imageQueue.add('process-image', data, {
        priority: 1,
      });

      logger.info(`Image processing job added: ${job.id} for asset: ${data.assetId}`);
      return job;
    } catch (error) {
      logger.error('Error adding image processing job:', error);
      throw error;
    }
  }

  async addVideoProcessingJob(data: AssetJobData) {
    try {
      const job = await videoQueue.add('process-video', data, {
        priority: 2,
      });

      logger.info(`Video processing job added: ${job.id} for asset: ${data.assetId}`);
      return job;
    } catch (error) {
      logger.error('Error adding video processing job:', error);
      throw error;
    }
  }

  async addAssetProcessingJob(data: AssetJobData) {
    if (data.type === 'image') {
      return this.addImageProcessingJob(data);
    } else if (data.type === 'video') {
      return this.addVideoProcessingJob(data);
    } else {
      logger.info(`No processing needed for asset type: ${data.type}`);
      return null;
    }
  }

  async getJobStatus(jobId: string, type: 'image' | 'video') {
    try {
      const queue = type === 'image' ? imageQueue : videoQueue;
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
      logger.error('Error getting job status:', error);
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
      logger.error('Error getting queue stats:', error);
      throw error;
    }
  }

  async pauseQueue(type: 'image' | 'video') {
    const queue = type === 'image' ? imageQueue : videoQueue;
    await queue.pause();
    logger.info(`${type} queue paused`);
  }

  async resumeQueue(type: 'image' | 'video') {
    const queue = type === 'image' ? imageQueue : videoQueue;
    await queue.resume();
    logger.info(`${type} queue resumed`);
  }

  async cleanQueue(type: 'image' | 'video', grace: number = 3600000) {
    const queue = type === 'image' ? imageQueue : videoQueue;

    await queue.clean(grace, 100, 'completed');
    await queue.clean(grace, 50, 'failed');

    logger.info(`${type} queue cleaned`);
  }

  async retryFailedJob(jobId: string, type: 'image' | 'video') {
    try {
      const queue = type === 'image' ? imageQueue : videoQueue;
      const job = await queue.getJob(jobId);

      if (!job) {
        throw new Error('Job not found');
      }

      await job.retry();
      logger.info(`Job ${jobId} retried`);

      return job;
    } catch (error) {
      logger.error('Error retrying job:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      await connection.ping();
      return true;
    } catch (error) {
      logger.error('Queue health check failed:', error);
      return false;
    }
  }
}

export default new QueueService();

export const addAssetJob = async (data: AssetJobData, priority?: number): Promise<any> => {
  try {
    const job = await assetQueue.add(`process-${data.type}`, data, {
      priority: priority || 0,
      jobId: `${data.assetId}-${data.processType || 'processing'}-${Date.now()}`,
    });

    logger.info(`Asset job added to queue: ${job.id}`, {
      assetId: data.assetId,
      type: data.type,
      processType: data.processType,
    });

    return job;
  } catch (error) {
    logger.error('Error adding job to queue:', error);
    throw error;
  }
};

export const getWaitingCount = async (): Promise<number> => {
  return await assetQueue.getWaitingCount();
};

export const getActiveCount = async (): Promise<number> => {
  return await assetQueue.getActiveCount();
};

export const getCompletedCount = async (): Promise<number> => {
  return await assetQueue.getCompletedCount();
};

export const getFailedCount = async (): Promise<number> => {
  return await assetQueue.getFailedCount();
};

export const getDelayedCount = async (): Promise<number> => {
  return await assetQueue.getDelayedCount();
};

export const getPausedCount = async (): Promise<number> => {
  const jobCounts = await assetQueue.getJobCounts();
  return jobCounts.paused || 0;
};

export const getWaiting = async (start: number, end: number) => {
  return await assetQueue.getJobs(['waiting'], start, end);
};

export const getActive = async (start: number, end: number) => {
  return await assetQueue.getJobs(['active'], start, end);
};

export const getCompleted = async (start: number, end: number) => {
  return await assetQueue.getJobs(['completed'], start, end);
};

export const getFailed = async (start: number, end: number) => {
  return await assetQueue.getJobs(['failed'], start, end);
};

export const getDelayed = async (start: number, end: number) => {
  return await assetQueue.getJobs(['delayed'], start, end);
};

export const getJobs = async (types: string[], start: number, end: number) => {
  return await assetQueue.getJobs(types as any, start, end);
};

export const getJob = async (jobId: string) => {
  return await assetQueue.getJob(jobId);
};

export const clean = async (
  grace: number,
  limit: number,
  type: 'completed' | 'failed',
): Promise<string[]> => {
  return await assetQueue.clean(grace, limit, type);
};

export const pauseAssetQueue = async (): Promise<void> => {
  await assetQueue.pause();
  logger.info('Asset queue paused');
};

export const resumeAssetQueue = async (): Promise<void> => {
  await assetQueue.resume();
  logger.info('Asset queue resumed');
};

export const emptyQueue = async (): Promise<void> => {
  await assetQueue.drain();
  logger.info('Asset queue emptied');
};

export const getQueueStatistics = async () => {
  const jobCounts = await assetQueue.getJobCounts();

  return {
    waiting: jobCounts.waiting || 0,
    active: jobCounts.active || 0,
    completed: jobCounts.completed || 0,
    failed: jobCounts.failed || 0,
    delayed: jobCounts.delayed || 0,
    paused: jobCounts.paused || 0,
    total:
      (jobCounts.waiting || 0) +
      (jobCounts.active || 0) +
      (jobCounts.completed || 0) +
      (jobCounts.failed || 0) +
      (jobCounts.delayed || 0) +
      (jobCounts.paused || 0),
  };
};

export const getJobStatus = async (jobId: string) => {
  try {
    const job = await assetQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();

    return {
      id: job.id,
      name: job.name,
      state,
      progress: job.progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      timestamp: job.timestamp,
    };
  } catch (error) {
    logger.error('Error getting job status:', error);
    throw error;
  }
};

export const retryAllFailedJobs = async (): Promise<number> => {
  const failedJobs = await assetQueue.getJobs(['failed']);
  let retried = 0;

  for (const job of failedJobs) {
    try {
      await job.retry();
      retried++;
    } catch (error) {
      logger.error(`Failed to retry job ${job.id}:`, error);
    }
  }

  logger.info(`Retried ${retried} failed jobs`);
  return retried;
};

export const cleanOldJobs = async (grace: number = 24 * 3600 * 1000): Promise<void> => {
  const completed = await assetQueue.clean(grace, 1000, 'completed');
  const failed = await assetQueue.clean(grace, 1000, 'failed');
  logger.info(`Cleaned ${completed.length} completed and ${failed.length} failed jobs`);
};

export const removeJobById = async (jobId: string): Promise<void> => {
  const job = await assetQueue.getJob(jobId);
  if (job) {
    await job.remove();
    logger.info(`Job ${jobId} removed`);
  }
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    await connection.ping();
    return true;
  } catch (error) {
    logger.error('Queue health check failed:', error);
    return false;
  }
};

export const closeQueue = async (): Promise<void> => {
  logger.info('Closing all queues...');
  await Promise.all([assetQueue.close(), imageQueue.close(), videoQueue.close()]);
  await connection.quit();
  logger.info('All queues closed');
};

Object.assign(assetQueue, {
  getWaitingCount,
  getActiveCount,
  getCompletedCount,
  getFailedCount,
  getDelayedCount,
  getPausedCount,
  getWaiting,
  getActive,
  getCompleted,
  getFailed,
  getDelayed,
  getJobs,
  clean,
});

export { imageQueue, videoQueue, connection };
