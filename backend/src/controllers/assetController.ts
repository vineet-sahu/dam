import { Request, Response } from "express";
import { Op } from "sequelize";
import Asset from "../models/Asset";

export const createAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {
      name,
      type,
      url,
      description,
      metadata,
    }: {
      name: string;
      type: string;
      url: string;
      description?: string;
      metadata?: object;
    } = req.body;

    const userId: string | undefined = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newAsset = await Asset.create({
      name,
      type,
      url,
      description,
      metadata,
      owner_id: userId,
    });

    return res.status(201).json({
      message: "Asset created successfully",
      asset: newAsset,
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllAssets = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      search,
    } = req.query as {
      page?: string;
      limit?: string;
      type?: string;
      search?: string;
    };

    const offset: number = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (type) where.type = type;

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Asset.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: "Assets retrieved successfully",
      assets: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAssetById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    return res.status(200).json({
      message: "Asset retrieved successfully",
      asset,
    });
  } catch (error) {
    console.error("Error fetching asset by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, type, url, description, metadata } = req.body;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (req.user?.id !== asset.owner_id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this asset" });
    }

    await asset.update({
      name: name ?? asset.name,
      type: type ?? asset.type,
      url: url ?? asset.url,
      description: description ?? asset.description,
      metadata: metadata ?? asset.metadata,
    });

    return res.status(200).json({
      message: "Asset updated successfully",
      asset,
    });
  } catch (error) {
    console.error("Error updating asset:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (req.user?.id !== asset.owner_id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this asset" });
    }

    await asset.destroy();

    return res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAssetsByUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const assets = await Asset.findAll({
      where: { owner_id: userId },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: "User assets retrieved successfully",
      assets,
    });
  } catch (error) {
    console.error("Error fetching user assets:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAssetsByType = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { type } = req.params;

    const assets = await Asset.findAll({
      where: { type },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: `Assets of type '${type}' retrieved successfully`,
      assets,
    });
  } catch (error) {
    console.error("Error fetching assets by type:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  createAsset,
  getAllAssets,
  getAssetsByType,
  getAssetsByUser,
  updateAsset,
};
