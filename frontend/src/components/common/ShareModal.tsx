import React, { useState } from "react";
import api from "../../services/api";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  assetName: string;
  assetType: string;
  thumbnailUrl?: string;
}

interface ShareLinkData {
  url: string;
  token: string;
  expiresAt?: string;
  allowDownload: boolean;
  maxDownloads?: number;
  requiresPassword: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  assetId,
  assetName,
  assetType,
  thumbnailUrl,
}) => {
  const [expiresIn, setExpiresIn] = useState<string>("24");
  const [password, setPassword] = useState("");
  const [enablePassword, setEnablePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [maxDownloads, setMaxDownloads] = useState("");
  const [enableMaxDownloads, setEnableMaxDownloads] = useState(false);
  const [shareLink, setShareLink] = useState<ShareLinkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreateLink = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post(`/assets/${assetId}/share`, {
        expiresIn: expiresIn === "never" ? null : Number(expiresIn),
        password: enablePassword ? password : undefined,
        allowDownload,
        maxDownloads: enableMaxDownloads ? Number(maxDownloads) : undefined,
        isPublic: true,
      });

      setShareLink(response.data.shareLink);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create share link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareLink(null);
    setPassword("");
    setShowPassword(false);
    setEnablePassword(false);
    setMaxDownloads("");
    setEnableMaxDownloads(false);
    setError("");
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Share Asset</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Asset Preview */}
          <div className="mb-6 flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={assetName}
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">
                {assetType === "video" && "🎥"}
                {assetType === "image" && "🖼️"}
                {assetType === "audio" && "🎵"}
                {assetType === "document" && "📄"}
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium truncate">{assetName}</p>
              <p className="text-sm text-gray-500 capitalize">{assetType}</p>
            </div>
          </div>

          {!shareLink ? (
            <>
              {/* Expiration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Expiration
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="1">1 Hour</option>
                  <option value="24">24 Hours</option>
                  <option value="168">7 Days</option>
                  <option value="720">30 Days</option>
                  <option value="never">Never Expires</option>
                </select>
              </div>

              {/* Password Protection */}
              <div className="mb-4">
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.checked)}
                    className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Password Protection
                  </span>
                </label>
                {enablePassword && (
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                )}
              </div>

              {/* Download Permission */}
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Allow Downloads
                  </span>
                </label>
              </div>

              {/* Max Downloads */}
              <div className="mb-6">
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={enableMaxDownloads}
                    onChange={(e) => setEnableMaxDownloads(e.target.checked)}
                    className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Limit Downloads
                  </span>
                </label>
                {enableMaxDownloads && (
                  <input
                    type="number"
                    value={maxDownloads}
                    onChange={(e) => setMaxDownloads(e.target.value)}
                    placeholder="Max number of downloads"
                    min="1"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Create Button */}
              <button
                onClick={handleCreateLink}
                disabled={isLoading || (enablePassword && !password)}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? "Creating Link..." : "Create Share Link"}
              </button>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium mb-2">
                  ✓ Share link created successfully!
                </p>
                <div className="text-sm text-green-600 space-y-1">
                  {shareLink.expiresAt && (
                    <p>
                      Expires: {new Date(shareLink.expiresAt).toLocaleString()}
                    </p>
                  )}
                  {shareLink.requiresPassword && <p>🔒 Password protected</p>}
                  {shareLink.maxDownloads && (
                    <p>📊 Max {shareLink.maxDownloads} downloads</p>
                  )}
                  {!shareLink.allowDownload && (
                    <p>👁️ View-only (no downloads)</p>
                  )}
                </div>
              </div>

              {/* Share Link Display */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={shareLink.url}
                    readOnly
                    className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
