import multer from "multer";
import type { Request } from "express";

const ALLOWED_IMAGE_TYPES = (
  process.env.ALLOWED_IMAGE_TYPES || "image/jpeg,image/png,image/gif,image/webp"
).split(",");

const ALLOWED_VIDEO_TYPES = (
  process.env.ALLOWED_VIDEO_TYPES ||
  "video/mp4,video/mpeg,video/quicktime,video/x-msvideo"
).split(",");

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "524288000");

const storage = multer.memoryStorage();

const fileFilter = (_: Request, file: any, cb: multer.FileFilterCallback) => {
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

export const handleUploadError = (err: any, _: any, res: any, next: any) => {
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
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next(err);
};
