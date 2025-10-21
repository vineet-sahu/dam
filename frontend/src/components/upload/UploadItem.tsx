import {
  // Upload,
  X,
  File,
  Image,
  Video,
  FileText,
  Music,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

interface UploadItemData {
  file: File;
  progress: number;
  status: UploadStatus;
  name: string;
  description: string;
  tags: string[];
  visibility: "private" | "team" | "public";
  error?: string;
}

type UploadStatus = "pending" | "uploading" | "completed" | "error";

export const UploadItem = ({
  item,
  onUpdate,
  onRemove,
}: {
  item: UploadItemData;
  onUpdate: (updates: Partial<UploadItemData>) => void;
  onRemove: () => void;
}) => {
  const [tagInput, setTagInput] = useState("");

  const getFileIcon = () => {
    if (item.file.type.startsWith("image/"))
      return <Image size={20} className="text-blue-500" />;
    if (item.file.type.startsWith("video/"))
      return <Video size={20} className="text-purple-500" />;
    if (item.file.type.startsWith("audio/"))
      return <Music size={20} className="text-green-500" />;
    return <FileText size={20} className="text-gray-500" />;
  };

  const getStatusColor = () => {
    switch (item.status) {
      case "uploading":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !item.tags.includes(tagInput.trim())) {
      onUpdate({ tags: [...item.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    onUpdate({ tags: item.tags.filter((t) => t !== tag) });
  };

  const isUploading = item.status === "uploading";

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">{getFileIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {item.file.name}
              </p>
              <p className="text-sm text-gray-500">
                {(item.file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                {item.file.type || "Unknown type"}
              </p>
            </div>
            {!isUploading && (
              <button
                onClick={onRemove}
                className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {item.status === "uploading" && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-600">{item.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getStatusColor()}`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}

          {item.status === "completed" && (
            <div className="mb-4 flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span className="text-sm font-medium">Upload Complete</span>
            </div>
          )}

          {item.status === "error" && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">Upload Failed</span>
              </div>
              {item.error && (
                <p className="text-sm text-red-500 ml-7">{item.error}</p>
              )}
            </div>
          )}

          {item.status !== "completed" && (
            <div
              className={isUploading ? "opacity-50 pointer-events-none" : ""}
            >
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Name *
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a readable name for this asset"
                  disabled={isUploading}
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={item.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a description (optional)"
                  disabled={isUploading}
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add tags (press Enter)"
                    disabled={isUploading}
                  />
                  <button
                    onClick={addTag}
                    disabled={isUploading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        {!isUploading && (
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-900"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  value={item.visibility}
                  onChange={(e) =>
                    onUpdate({
                      visibility: e.target.value as
                        | "private"
                        | "team"
                        | "public",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUploading}
                >
                  <option value="private">Private - Only you can access</option>
                  <option value="team">Team - Team members can access</option>
                  <option value="public">Public - Anyone can access</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
