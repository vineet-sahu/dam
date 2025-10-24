import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/";
import errorHandler from "./middleware/errorHandler";
import logger from "./utils/logger";
import { connectDatabase } from "./config/database";
import corsMiddleware from "./middleware/cors";
import { initializeMinIOBuckets } from "./utils/initMinio";

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(corsMiddleware);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.API_VERSION || "v1",
  });
});

app.use("/api", routes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

const setupGracefulShutdown = (server: any) => {
  const shutdown = (signal: string) => {
    logger.info(`${signal} signal received: closing HTTP server`);
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

const startServer = async () => {
  try {
    await connectDatabase();
    logger.info(" Database connected successfully");
    await initializeMinIOBuckets();

    const server = app.listen(PORT, () => {
      logger.info(`DAM API Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    setupGracefulShutdown(server);
  } catch (error) {
    logger.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

export default app;
