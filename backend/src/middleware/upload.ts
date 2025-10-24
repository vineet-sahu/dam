/* eslint-disable no-undef */
import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import minioService from "../services/minioService";
import logger from "../utils/logger";

const ALLOWED_IMAGE_TYPES = (
  process.env.ALLOWED_IMAGE_TYPES || "image/jpeg,image/png,image/gif,image/webp"
).split(",");

const ALLOWED_VIDEO_TYPES = (
  process.env.ALLOWED_VIDEO_TYPES ||
  "video/mp4,video/mpeg,video/quicktime,video/x-msvideo"
).split(",");

const ALLOWED_DOCUMENT_TYPES = (
  process.env.ALLOWED_DOCUMENT_TYPES ||
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
).split(",");

const ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
];

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "524288000", 10);

const fileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
      ),
    );
  }
};

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
  fileFilter,
});

export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 10);

const getBucketForFileType = (mimetype: string): string => {
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) {
    return minioService.buckets.ORIGINALS;
  }
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    return minioService.buckets.ORIGINALS;
  }
  return minioService.buckets.ORIGINALS;
};

export const processMinioUploadSingle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const bucket = getBucketForFileType(req.file.mimetype);

    const result = await minioService.uploadFile(
      bucket,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    (req as any).minioFile = {
      ...result,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
    };

    logger.info(`File uploaded successfully: ${result.objectName}`);
    next();
    return;
  } catch (error) {
    logger.error("MinIO upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload file to storage",
    });
  }
};

export const processMinioUploadMultiple = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const uploadPromises = files.map(async (file) => {
      const bucket = getBucketForFileType(file.mimetype);

      const result = await minioService.uploadFile(
        bucket,
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      return {
        ...result,
        originalName: file.originalname,
        mimetype: file.mimetype,
      };
    });

    const results = await Promise.all(uploadPromises);

    (req as any).minioFiles = results;

    logger.info(`${results.length} files uploaded successfully`);
    next();
    return;
  } catch (error) {
    logger.error("MinIO multiple upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload files to storage",
    });
  }
};

export const handleUploadError = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum: 10 files per request",
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  next();
  return;
};

export const cleanupTempFiles = (
  _: Request,
  _res: Response,
  next: NextFunction,
) => {
  next();
};
