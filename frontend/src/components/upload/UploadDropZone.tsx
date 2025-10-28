import React, { useState } from "react";
import { Upload } from "lucide-react";

export const UploadDropzone = ({
  onFilesSelected,
}: {
  onFilesSelected: (files: File[]) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  };

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
      }`}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        multiple
        className="hidden"
        onChange={handleBrowse}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
      <p className="text-lg font-medium text-gray-700 mb-2">
        Drop files here or click to browse
      </p>
      <p className="text-sm text-gray-500">
        Supports images, videos, documents, and audio files
      </p>
    </div>
  );
};
