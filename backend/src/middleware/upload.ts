/* eslint-disable no-undef */
import multer from "multer";
import express from "express";
import minioService from "../services/minioService";
import logger from "../utils/logger";

interface MinioUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  bucketName: string;
  objectName: string;
  etag: string | undefined;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      minioFile?: MinioUploadedFile;
      minioFiles?: MinioUploadedFile[];
    }
  }
}

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
  _: express.Request,
  file: Express.Request["file"],
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_TYPES.includes(`${file?.mimetype}`)) {
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
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
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

    req.minioFile = {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bucketName: result.bucketName,
      objectName: result.objectName,
      etag: result.etag,
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
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    // FIXED: Changed from Express.Multer.File[] to proper type
    const files = req.files as Array<Express.Request["file"]>;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const uploadPromises = files.map(async (file) => {
      if (!file) return null;

      const bucket = getBucketForFileType(file.mimetype);

      const result = await minioService.uploadFile(
        bucket,
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      return {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        bucketName: result.bucketName,
        objectName: result.objectName,
        etag: result.etag,
      };
    });

    const results = await Promise.all(uploadPromises);
    req.minioFiles = results.filter((r): r is MinioUploadedFile => r !== null);

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
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction,
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
        message: "Too many files. Maximum: 10 files per express.request",
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
  _: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  next();
};
