import { AxiosProgressEvent } from "axios";
import api from "./api";

export async function uploadFile(
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<any> {
  const response = await api.post(
    `${import.meta.env.VITE_DAM_API_BASE_URL}/assets`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    },
  );

  return response.data;
}
