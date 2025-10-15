export interface IAssetVersion {
  id: string;
  asset_id: string;
  path: string;
  resolution?: string;
  type: "thumbnail" | "transcode";
  created_at: Date;
  updated_at: Date;
}
