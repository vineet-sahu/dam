import "dotenv/config";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/";
import errorHandler from "./middleware/errorHandler";
import logger from "./utils/logger";
import { connectDatabase } from "./config/database";
import corsMiddleware from "./middleware/cors";

const app: Application = express();
const PORT = process.env.PORT || 3000;

connectDatabase().catch((error) => {
  logger.error("Failed to connect to database:", error);
  process.exit(1);
});

app.use(helmet());
app.use(corsMiddleware);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => {
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

const server = app.listen(PORT, () => {
  logger.info(`DAM API Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

export default app;
