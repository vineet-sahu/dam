import express from "express";
import authRoutes from "./authRoutes";
import assetRoutes from "./assetRoutes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/assets", assetRoutes);

export default router;
