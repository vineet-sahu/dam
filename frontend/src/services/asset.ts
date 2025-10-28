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

  downloadAsset: async (
    id: string,
    type: "original" | "thumbnail" | "transcode" = "original",
    quality?: string,
  ): Promise<void> => {
    try {
      let endpoint = "";

      switch (type) {
        case "original":
          endpoint = `/assets/${id}/download`;
          break;
        case "thumbnail":
          endpoint = `/assets/${id}/download/thumbnail`;
          break;
        case "transcode":
          if (!quality)
            throw new Error(
              "Quality parameter required for transcode download",
            );
          endpoint = `/assets/${id}/download/transcode/${quality}`;
          break;
        default:
          throw new Error("Invalid download type");
      }

      // Request the file as binary data
      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      const contentDisposition = response.headers["content-disposition"];
      let filename = "downloaded_file";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Asset download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  },
};

export default assetApi;
