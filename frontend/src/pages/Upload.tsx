import { useState } from "react";
import { UploadDropzone } from "../components/upload/UploadDropZone";
import { UploadItem } from "../components/upload/UploadItem";
import { UploadItemData } from "../types/Asset";
import { useUploadAsset } from "../hooks/useAsset";

export default function UploadPage() {
  const [uploads, setUploads] = useState<UploadItemData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = useUploadAsset();

  const handleFilesSelected = (files: File[]) => {
    const newUploads: UploadItemData[] = files.map((file) => ({
      file,
      progress: 0,
      status: "pending",
      name: file.name.replace(/\.[^/.]+$/, ""),
      description: "",
      tags: [],
      visibility: "private",
    }));
    setUploads((prev) => [...prev, ...newUploads]);
  };

  const uploadSingleFile = async (upload: UploadItemData) => {
    try {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === upload.file ? { ...u, status: "uploading" } : u,
        ),
      );

      const formData = new FormData();
      formData.append("file", upload.file);
      formData.append("name", upload.name);
      formData.append("description", upload.description || "");
      formData.append("tags", JSON.stringify(upload.tags));
      formData.append("visibility", upload.visibility);

      const response = await uploadMutation.mutateAsync({
        formData,
        onProgress: (percent: number) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === upload.file ? { ...u, progress: percent } : u,
            ),
          );
        },
      });

      setUploads((prev) =>
        prev.map((u) =>
          u.file === upload.file
            ? { ...u, status: "completed", progress: 100 }
            : u,
        ),
      );

      return response;
    } catch (error: any) {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === upload.file
            ? {
                ...u,
                status: "error",
                error:
                  error?.response?.data?.message ||
                  error?.message ||
                  "Upload failed. Please try again.",
              }
            : u,
        ),
      );
      throw error;
    }
  };

  const handleSubmit = async () => {
    const pendingUploads = uploads.filter((u) => u.status === "pending");

    if (pendingUploads.length === 0) return;

    setIsUploading(true);

    try {
      for (const upload of pendingUploads) {
        try {
          await uploadSingleFile(upload);
        } catch (err) {
          console.error("Upload failed for", upload.file.name, err);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const updateUpload = (file: File, updates: Partial<UploadItemData>) => {
    setUploads((prev) =>
      prev.map((u) => (u.file === file ? { ...u, ...updates } : u)),
    );
  };

  const removeUpload = (file: File) => {
    setUploads((prev) => prev.filter((u) => u.file !== file));
  };

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status !== "completed"));
  };

  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const completedCount = uploads.filter((u) => u.status === "completed").length;
  const errorCount = uploads.filter((u) => u.status === "error").length;
  const canSubmit =
    pendingCount > 0 &&
    uploads
      .filter((u) => u.status === "pending")
      .every((u) => u.name.trim() !== "") &&
    !isUploading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Assets
          </h1>
          <p className="text-gray-600">
            Select files, fill in the details, and submit to upload
          </p>
        </div>

        {uploads.length === 0 && (
          <UploadDropzone onFilesSelected={handleFilesSelected} />
        )}

        {uploads.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="ml-2 text-gray-900">{uploads.length}</span>
                  </div>
                  {pendingCount > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Pending:
                      </span>
                      <span className="ml-2 text-blue-600">{pendingCount}</span>
                    </div>
                  )}
                  {completedCount > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Completed:
                      </span>
                      <span className="ml-2 text-green-600">
                        {completedCount}
                      </span>
                    </div>
                  )}
                  {errorCount > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Failed:</span>
                      <span className="ml-2 text-red-600">{errorCount}</span>
                    </div>
                  )}
                </div>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleFilesSelected(files);
                      e.target.value = "";
                    }
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => document.getElementById("file-input")?.click()}
                  disabled={isUploading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  + Add More Files
                </button>
              </div>
            </div>

            <div className="mb-6">
              {uploads.map((upload, idx) => (
                <UploadItem
                  key={`${upload.file.name}-${idx}`}
                  item={upload}
                  onUpdate={(updates) => updateUpload(upload.file, updates)}
                  onRemove={() => removeUpload(upload.file)}
                />
              ))}
            </div>

            <div className="flex justify-between items-center gap-3">
              <div className="flex gap-3">
                {completedCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    disabled={isUploading}
                    className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Completed
                  </button>
                )}
                <button
                  onClick={() => setUploads([])}
                  disabled={isUploading}
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  canSubmit
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isUploading
                  ? "Uploading..."
                  : `Upload ${pendingCount} ${pendingCount === 1 ? "Asset" : "Assets"}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
