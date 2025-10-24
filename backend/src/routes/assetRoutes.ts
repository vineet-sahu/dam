import { Router } from "express";
import {
  createAsset,
  deleteAsset,
  getAllAssets,
  getAssetById,
  getAssetsByType,
  getAssetsByUser,
  updateAsset,
  downloadAsset,
  streamAsset,
} from "../controllers/assetController";
import authenticate from "../middleware/authMiddleware";
import authorize from "../middleware/authorizeMiddleware";
import {
  handleUploadError,
  uploadSingle,
  processMinioUploadSingle,
} from "../middleware/upload";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  uploadSingle,
  processMinioUploadSingle,
  handleUploadError,
  createAsset,
);

router.get("/", authorize("admin", "editor"), getAllAssets);

router.get("/my-assets", getAssetsByUser);

router.get("/type/:type", getAssetsByType);

router.get("/:id/download", downloadAsset);

router.get("/:id/stream", streamAsset);

router.get("/:id", getAssetById);

router.put("/:id", authorize("admin", "editor"), updateAsset);

// router.delete("/:id", authorize("admin"), deleteAsset);
router.delete("/:id", deleteAsset);

export default router;
