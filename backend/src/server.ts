import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import routes from "./routes/";
import errorHandler from "./middleware/errorHandler";
import logger from "./utils/logger";
import { connectDatabase } from "./config/database";
import corsMiddleware from "./middleware/cors";
import { initializeMinIOBuckets } from "./utils/initMinio";

const app: express.Application = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

if (isProduction) {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use(corsMiddleware);

if (isProduction) {
  app.use(
    morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }),
  );
} else {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser(process.env.COOKIE_SECRET || "your-secret-key"));

app.use(hpp());

app.use(compression());

app.set("trust proxy", 1);
app.use(helmet.crossOriginResourcePolicy({ policy: "same-origin" }));
app.use(helmet.crossOriginOpenerPolicy({ policy: "same-origin" }));
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));

app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

app.use((req, res, next) => {
  const headerValue = req.headers["x-request-id"];
  const requestId =
    (Array.isArray(headerValue) ? headerValue[0] : headerValue) ||
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.id = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
});

app.get("/health", (_: express.Request, res: express.Response) => {
  const response: any = {
    status: "OK",
    timestamp: new Date().toISOString(),
  };

  if (!isProduction) {
    response.uptime = process.uptime();
    response.environment = process.env.NODE_ENV;
  }

  res.status(200).json(response);
});

app.use("/api", routes);

app.use((req: express.Request, res: express.Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
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

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    shutdown("unhandledRejection");
  });
};

const startServer = async () => {
  try {
    await connectDatabase();
    logger.info("Database connected successfully");

    await initializeMinIOBuckets();
    logger.info("MinIO buckets initialized");

    const server = app.listen(PORT, () => {
      logger.info(`DAM API Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);

      if (!isProduction) {
        logger.info(`Health check: http://localhost:${PORT}/health`);
        logger.info(`API: http://localhost:${PORT}/api`);
      }
    });

    server.on("connection", (socket) => {
      socket.setNoDelay(true);
    });

    setupGracefulShutdown(server);
  } catch (error) {
    logger.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

export default app;
