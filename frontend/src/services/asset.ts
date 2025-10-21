import { Asset, UploadAssetParams } from "../types/Asset";
import api from "./api";

export interface GetAssetsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  visibility?: string;
  sortBy?: string;
  tags?: string[];
}

export interface GetAssetsResponse {
  assets: Asset[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const assetApi = {
  getAssets: async (params: GetAssetsParams): Promise<GetAssetsResponse> => {
    const { data } = await api.get("/assets/my-assets", { params });
    return data;
  },

  getAsset: async (id: string): Promise<Asset> => {
    const { data } = await api.get(`/assets/${id}`);
    return data.asset;
  },

  uploadAsset: async (params: UploadAssetParams): Promise<Asset> => {
    const { formData, onProgress } = params;
    const { data } = await api.post("/assets", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });
    return data.asset;
  },

  updateAsset: async (id: string, updates: Partial<Asset>): Promise<Asset> => {
    const { data } = await api.put(`/assets/${id}`, updates);
    return data.asset;
  },

  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },

  downloadAsset: async (id: string): Promise<string> => {
    const { data } = await api.get(`/assets/${id}/download`);
    return data.url;
  },
};

export default assetApi;
