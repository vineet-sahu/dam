export interface IAssetAccessLog {
  id: string;
  asset_id: string;
  user_id: string;
  action: "view" | "download" | "edit";
  timestamp: Date;
}
