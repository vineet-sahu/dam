import { Request, Response } from "express";
import { Op } from "sequelize";
import Asset from "../models/Asset";
import minioService from "../services/minioService";
import logger from "../utils/logger";
import queueService from "../services/queueService";
import { createAssetSchema } from "../validation/assetValidation";
import { ZodIssue } from "zod";

export const createAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId: string | undefined = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const minioFile = (req as any).minioFile;
    if (!minioFile) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const parseResult = createAssetSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue: ZodIssue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const { name, description, metadata, visibility, tags } = parseResult.data;

    logger.info("MinIO file uploaded:", minioFile);
    logger.info("Additional form data:", req.body);

    let assetType = "document";
    if (minioFile.mimetype.startsWith("image/")) {
      assetType = "image";
    } else if (minioFile.mimetype.startsWith("video/")) {
      assetType = "video";
    } else if (minioFile.mimetype.startsWith("audio/")) {
      assetType = "audio";
    }
    const storagePath = `${minioFile.bucketName}/${minioFile.objectName}`;
    const directUrl = `${process.env.MINIO_PUBLIC_URL}/${storagePath}`;

    const newAssetData = {
      name: name || minioFile.originalName,
      originalName: minioFile.originalName,
      filename: minioFile.objectName,
      type: assetType,
      mimeType: minioFile.mimetype,
      url: directUrl,
      size: minioFile.size,
      storagePath: storagePath,
      description: description || null,
      metadata: metadata || {},
      owner_id: userId,
      visibility: visibility || "private",
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      status:
        assetType === "image" || assetType === "video"
          ? "processing"
          : "completed",
    };

    logger.info("New asset data to be created:", newAssetData);

    const newAsset = await Asset.create(newAssetData);

    logger.info("New asset created:", newAsset.id);

    let job = null;
    if (assetType === "image" || assetType === "video") {
      job = await queueService.addAssetProcessingJob({
        assetId: newAsset.id,
        bucketName: minioFile.bucketName,
        objectName: minioFile.objectName,
        mimeType: minioFile.mimetype,
        type: assetType as "image" | "video",
      });

      logger.info(
        `Processing job created: ${job?.id} for asset: ${newAsset.id}`,
      );
    }

    return res.status(201).json({
      message: "Asset created successfully",
      asset: newAsset,
      processingJobId: job?.id || null,
    });
  } catch (error) {
    logger.error("Error creating asset:", error);
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
      visibility,
    } = req.query as {
      page?: string;
      limit?: string;
      type?: string;
      search?: string;
      visibility?: string;
    };

    const offset: number = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (type) where.type = type;
    if (visibility) where.visibility = visibility;

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Asset.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    const decoratedAssets = await Promise.all(
      rows.map(async (asset) => {
        let signedUrl = asset.url;

        if (asset.visibility === "private") {
          const [bucketName, ...objectPathParts] = asset.storagePath.split("/");
          const objectName = objectPathParts.join("/");

          signedUrl = await minioService.getPresignedUrl(
            bucketName,
            objectName,
            60 * 60,
          );
        }

        return {
          ...asset.toJSON(),
          url: signedUrl,
        };
      }),
    );

    return res.status(200).json({
      message: "Assets retrieved successfully",
      assets: decoratedAssets,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Error fetching assets:", error);
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

    const [bucketName, objectName] = asset.storagePath.split("/");
    const freshUrl = await minioService.getPresignedUrl(
      bucketName,
      objectName,
      3600,
    );

    return res.status(200).json({
      message: "Asset retrieved successfully",
      asset: {
        ...asset.toJSON(),
        url: freshUrl,
      },
    });
  } catch (error) {
    logger.error("Error fetching asset by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const expirySeconds = parseInt(req.query.expiry as string) || 3600;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const [bucketName, objectName] = asset.storagePath.split("/");

    const downloadUrl = await minioService.getPresignedUrl(
      bucketName,
      objectName,
      expirySeconds,
    );

    await asset.update({ downloadCount: asset.downloadCount + 1 });

    return res.status(200).json({
      message: "Download URL generated successfully",
      url: downloadUrl,
      expiresIn: expirySeconds,
      asset: {
        id: asset.id,
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType,
      },
    });
  } catch (error) {
    logger.error("Error generating download URL:", error);
    return res.status(500).json({ message: "Failed to generate download URL" });
  }
};

export const streamAsset = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      res.status(404).json({ message: "Asset not found" });
      return;
    }

    const [bucketName, objectName] = asset.storagePath.split("/");

    const stats = await minioService.getFileStats(bucketName, objectName);
    const stream = await minioService.getFile(bucketName, objectName);

    res.setHeader("Content-Type", asset.mimeType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${asset.originalName}"`,
    );
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    stream.pipe(res);

    stream.on("error", (error) => {
      logger.error("Stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to stream file" });
      }
    });
  } catch (error) {
    logger.error("Error streaming asset:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to stream asset" });
    }
  }
};

export const updateAsset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, description, metadata, visibility, tags } = req.body;

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
      description: description ?? asset.description,
      metadata: metadata ?? asset.metadata,
      visibility: visibility ?? asset.visibility,
      tags: tags ?? asset.tags,
    });

    return res.status(200).json({
      message: "Asset updated successfully",
      asset,
    });
  } catch (error) {
    logger.error("Error updating asset:", error);
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

    const [bucketName, objectName] = asset.storagePath.split("/");

    try {
      await minioService.deleteFile(bucketName, objectName);
      logger.info(`Deleted file from MinIO: ${asset.storagePath}`);
    } catch (minioError) {
      logger.error("Error deleting from MinIO:", minioError);
    }

    if (asset.thumbnailPath) {
      try {
        const [thumbBucket, thumbObject] = asset.thumbnailPath.split("/");
        await minioService.deleteFile(thumbBucket, thumbObject);
        logger.info(`Deleted thumbnail: ${asset.thumbnailPath}`);
      } catch (thumbError) {
        logger.error("Error deleting thumbnail:", thumbError);
      }
    }

    await asset.destroy();

    return res.status(200).json({
      message: "Asset deleted successfully",
      deletedAssetId: id,
    });
  } catch (error) {
    logger.error("Error deleting asset:", error);
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

    const {
      page = 1,
      limit = 10,
      type,
      search,
      includePublic = "false",
      sortBy = "createdAt:desc",
    } = req.query as {
      page?: string;
      limit?: string;
      type?: string;
      search?: string;
      includePublic?: string;
      sortBy?: string;
    };

    const offset = (Number(page) - 1) * Number(limit);
    const filters: any[] = [];

    filters.push({ owner_id: userId });

    if (includePublic === "true") {
      filters.push({ visibility: "public" });
    }

    const searchConditions: any[] = [];
    if (search) {
      searchConditions.push(
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } },
        { metadata: { [Op.contains]: { search } } },
      );
    }

    const where: any = {};
    if (filters.length > 0 && searchConditions.length > 0) {
      where[Op.and] = [{ [Op.or]: filters }, { [Op.or]: searchConditions }];
    } else if (filters.length > 0) {
      where[Op.or] = filters;
    } else if (searchConditions.length > 0) {
      where[Op.or] = searchConditions;
    }

    if (type) {
      where.type = type;
    }

    const [sortField, sortOrder] = (sortBy as string).split(":");
    const validFields = ["createdAt", "name", "size"];
    const validOrders = ["asc", "desc"];
    const order: any = [];

    if (validFields.includes(sortField) && validOrders.includes(sortOrder)) {
      order.push([
        sortField === "createdAt" ? "created_at" : sortField,
        sortOrder.toUpperCase(),
      ]);
    } else {
      order.push(["created_at", "DESC"]);
    }

    const { count, rows } = await Asset.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order,
    });

    const decoratedAssets = await Promise.all(
      rows.map(async (asset) => {
        let url = asset.url || "";

        if (asset.visibility === "private") {
          try {
            const [bucketName, ...objectPathParts] =
              asset.storagePath.split("/");
            const objectName = objectPathParts.join("/");

            url = await minioService.getPresignedUrl(
              bucketName,
              objectName,
              60 * 60,
            );
          } catch (err) {
            console.error(
              `Failed to generate signed URL for asset ${asset.id}:`,
              err,
            );
          }
        }

        return {
          ...asset.toJSON(),
          url,
        };
      }),
    );

    return res.status(200).json({
      message: "User assets retrieved successfully",
      assets: decoratedAssets,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Error fetching user assets:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAssetsByType = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query as {
      page?: string;
      limit?: string;
    };

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Asset.findAndCountAll({
      where: { type },
      limit: Number(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: `Assets of type '${type}' retrieved successfully`,
      assets: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Error fetching assets by type:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  createAsset,
  getAllAssets,
  getAssetsByType,
  getAssetsByUser,
  getAssetById,
  updateAsset,
  deleteAsset,
  downloadAsset,
  streamAsset,
};
