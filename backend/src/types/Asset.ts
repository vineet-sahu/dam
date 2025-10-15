export interface AssetMetadata {
  dimensions?: string;
  duration?: number;
  [key: string]: any;
}

export interface IAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  thumbnailPath?: string;
  transcodedPaths?: string[];
  tags: string[];
  metadata: AssetMetadata;
  uploadDate: Date;
  downloadCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  visibility: "private" | "team" | "public";
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}
