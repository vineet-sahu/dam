import { ReactNode } from "react";
import type { User } from "./User";

export interface AssetMetadata {
  width?: number;
  height?: number;
  duration?: number;
  resolution?: string;
  format?: string;
  codec?: string;
  bitrate?: number;
  [key: string]: any;
}

export type AssetStatus = "pending" | "processing" | "completed" | "failed";
export type AssetVisibility = "private" | "team" | "public";

export interface Asset {
  thumbnail: ReactNode;
  id: string;
  name: string;
  filename: string;
  originalName: string;
  type: string;
  mimeType: string;
  url: string;
  description?: string | null;
  size: string;
  storagePath: string;
  thumbnailPath?: string | null;
  thumbnailUrl?: string | null;
  transcodedPaths?: Record<string, string> | null;
  transcodedUrls?: Record<string, string>;
  tags: string[];
  metadata?: AssetMetadata | null;
  uploadDate: string;
  lastDownloadedAt?: string;
  downloadCount: number;
  status: AssetStatus;
  errorMessage?: string | null;
  visibility: AssetVisibility;
  owner_id: string;
  owner?: Pick<User, "id" | "name" | "email">;
  createdAt: string;
  updatedAt: string;
}

/**
 * For paginated asset API responses.
 */
export interface PaginatedAssets {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
}

export type UploadStatus = "pending" | "uploading" | "completed" | "error";

export interface UploadItemData {
  file: File;
  progress: number;
  status: UploadStatus;
  name: string;
  description: string;
  tags: string[];
  visibility: AssetVisibility;
  error?: string;
}

export interface UploadAssetParams {
  formData: FormData;
  onProgress?: (percent: number) => void;
}
