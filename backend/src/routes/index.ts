import express from "express";
import authRoutes from "./authRoutes";
import assetRoutes from "./assetRoutes";
import shareRoutes from "./shareRoutes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/assets", assetRoutes);

router.use("/", shareRoutes);

export default router;
