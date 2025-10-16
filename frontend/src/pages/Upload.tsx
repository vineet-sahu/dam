import React, { useState } from "react";
import { toast } from "react-toastify";

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("assets", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("Files uploaded successfully!");
      setFiles([]);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Upload Assets</h1>

      <div className="border-dashed border-2 border-gray-300 p-8 rounded-lg text-center mb-6">
        <input
          type="file"
          multiple
          onChange={handleFilesChange}
          className="mb-4"
        />
        <p className="text-gray-500">
          Drag and drop files here or click to select
        </p>
      </div>

      {files.length > 0 && (
        <div className="mb-4">
          <h2 className="font-medium mb-2">Selected files:</h2>
          <ul className="list-disc list-inside">
            {files.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default UploadPage;
