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
  id?: string;
  name?: string;
  filename?: string;
  originalName?: string;
  type?: string;
  mimeType?: string;
  url?: string;
  description?: string | null;
  size?: number;
  storagePath?: string;
  thumbnailPath?: string | null;
  transcodedPaths?: Record<string, string> | null;
  tags?: string[];
  metadata?: AssetMetadata | null;
  uploadDate?: Date;
  downloadCount?: number;
  status?: AssetStatus;
  errorMessage?: string | null;
  visibility?: AssetVisibility;
  owner_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

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

export type UploadStatus = "pending" | "uploading" | "completed" | "error";
