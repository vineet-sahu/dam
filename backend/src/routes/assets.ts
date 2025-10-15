import { Router } from "express";
import {
  createAsset,
  deleteAsset,
  getAllAssets,
  getAssetById,
  getAssetsByType,
  getAssetsByUser,
  updateAsset,
} from "../controllers/assetController";
import authenticate from "../middleware/authMiddleware";
import authorize from "../middleware/authorizeMiddleware";
import { handleUploadError, uploadMultiple } from "../middleware/upload";

const router = Router();

router.post("/", uploadMultiple, handleUploadError, createAsset);

router.use(authenticate);

router.post("/", createAsset);

router.get("/", authorize("admin", "editor"), getAllAssets);

router.get("/my-assets", getAssetsByUser);

router.get("/type/:type", getAssetsByType);

router.get("/:id", getAssetById);

router.put("/:id", authorize("admin", "editor"), updateAsset);

router.delete("/:id", authorize("admin"), deleteAsset);

export default router;
