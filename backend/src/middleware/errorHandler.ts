import express from "express";

class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (
  err: AppError,
  _: express.Request,
  res: express.Response,
  __: express.NextFunction,
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (err.isOperational) {
    res.status(statusCode).json({
      status: "error",
      message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } else {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

export default errorHandler;
