// backend/src/dashboard.ts
import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import Redis from "ioredis";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.BULL_BOARD_PORT || 3001;

// Redis connection
const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

// Create queues for monitoring
const imageQueue = new Queue("image-processing", { connection });
const videoQueue = new Queue("video-processing", { connection });

// Setup Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/");

createBullBoard({
  queues: [new BullMQAdapter(imageQueue), new BullMQAdapter(videoQueue)],
  serverAdapter,
});

// Mount Bull Board UI
app.use("/", serverAdapter.getRouter());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "bull-board",
    timestamp: new Date().toISOString(),
  });
});

// Queue stats endpoint
app.get("/api/stats", async (req, res) => {
  try {
    const [imageJobCounts, videoJobCounts] = await Promise.all([
      imageQueue.getJobCounts(),
      videoQueue.getJobCounts(),
    ]);

    const [imageWorkers, videoWorkers] = await Promise.all([
      imageQueue.getWorkers(),
      videoQueue.getWorkers(),
    ]);

    res.json({
      queues: {
        image: {
          ...imageJobCounts,
          workers: imageWorkers.length,
        },
        video: {
          ...videoJobCounts,
          workers: videoWorkers.length,
        },
      },
      total: {
        waiting: imageJobCounts.waiting + videoJobCounts.waiting,
        active: imageJobCounts.active + videoJobCounts.active,
        completed: imageJobCounts.completed + videoJobCounts.completed,
        failed: imageJobCounts.failed + videoJobCounts.failed,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error fetching queue stats:", error);
    res.status(500).json({
      error: "Failed to fetch queue stats",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Queue management endpoints
app.post("/api/queue/:queueName/pause", async (req, res) => {
  try {
    const { queueName } = req.params;
    const queue = queueName === "image" ? imageQueue : videoQueue;

    await queue.pause();
    logger.info(`Queue ${queueName} paused`);

    res.json({
      success: true,
      message: `Queue ${queueName} paused`,
    });
  } catch (error) {
    logger.error("Error pausing queue:", error);
    res.status(500).json({ error: "Failed to pause queue" });
  }
});

app.post("/api/queue/:queueName/resume", async (req, res) => {
  try {
    const { queueName } = req.params;
    const queue = queueName === "image" ? imageQueue : videoQueue;

    await queue.resume();
    logger.info(`Queue ${queueName} resumed`);

    res.json({
      success: true,
      message: `Queue ${queueName} resumed`,
    });
  } catch (error) {
    logger.error("Error resuming queue:", error);
    res.status(500).json({ error: "Failed to resume queue" });
  }
});

app.post("/api/queue/:queueName/clean", async (req, res) => {
  try {
    const { queueName } = req.params;
    const { grace = 3600000, status = "completed" } = req.body;
    const queue = queueName === "image" ? imageQueue : videoQueue;

    await queue.clean(grace, 100, status as any);
    logger.info(
      `Queue ${queueName} cleaned (status: ${status}, grace: ${grace}ms)`,
    );

    res.json({
      success: true,
      message: `Queue ${queueName} cleaned`,
    });
  } catch (error) {
    logger.error("Error cleaning queue:", error);
    res.status(500).json({ error: "Failed to clean queue" });
  }
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _: express.NextFunction,
  ) => {
    logger.error("Dashboard error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  },
);

// Start server
app.listen(PORT, () => {
  logger.info(`🎯 Bull Board Dashboard running on http://localhost:${PORT}`);
  logger.info(`📊 Queue Stats API: http://localhost:${PORT}/api/stats`);
  logger.info(`📈 Monitoring ${imageQueue.name} and ${videoQueue.name} queues`);
});

// Graceful shutdown
const shutdown = async () => {
  logger.info("Shutting down Bull Board dashboard...");

  await Promise.all([
    imageQueue.close(),
    videoQueue.close(),
    connection.quit(),
  ]);

  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  shutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection at:", promise, "reason:", reason);
  shutdown();
});
