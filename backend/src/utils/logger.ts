import winston, { Logger } from "winston";

const logger: Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: "dam-api" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, service, stack }) => {
            if (stack) {
              return `${timestamp} [${service}] ${level}: ${message}\n${stack}`;
            }
            return `${timestamp} [${service}] ${level}: ${message}`;
          },
        ),
      ),
    }),
  );
}

export default logger;
