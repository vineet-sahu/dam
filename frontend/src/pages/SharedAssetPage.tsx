import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { saveFileAsBlob } from '../utils/file-utils';

interface AssetData {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: string;
  url: string;
  thumbnailUrl?: string;
  metadata?: any;
}

interface ShareInfo {
  allowDownload: boolean;
  expiresAt?: string;
  remainingDownloads?: number | null;
}

const SharedAssetPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSharedAsset();
  }, [token]);

  const fetchSharedAsset = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get(`/share/${token}`);
      const data = response.data;

      setRequiresPassword(data.requiresPassword);
      setShareInfo(data.shareInfo);

      if (!data.requiresPassword && data.asset) {
        setAsset(data.asset);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load shared asset';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      const response = await api.post(`/share/${token}/verify`, { password });
      const data = response.data;

      setAsset(data.asset);
      setShareInfo(data.shareInfo);
      setRequiresPassword(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid password');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setError('');

    try {
      const response = await api.get(`/share/${token}/download`);
      const data = response.data;

      const fileResponse = await fetch(data.downloadUrl);
      if (!fileResponse.ok) {
        throw new Error('Failed to download file');
      }

      await saveFileAsBlob(fileResponse);
      console.log('shareInfo?.remainingDownloads ', shareInfo?.remainingDownloads);
      if (shareInfo?.remainingDownloads !== null) {
        fetchSharedAsset();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download file');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes: string | number) => {
    const numBytes = Number(bytes);
    if (numBytes < 1024) return numBytes + ' B';
    if (numBytes < 1024 * 1024) return (numBytes / 1024).toFixed(2) + ' KB';
    return (numBytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared asset...</p>
        </div>
      </div>
    );
  }

  if (error && !requiresPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Access</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">This link may have expired or been revoked.</p>
          </div>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Protected</h2>
            <p className="text-gray-600">
              This shared asset is protected. Please enter the password to continue.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !password}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isVerifying ? 'Verifying...' : 'Access Asset'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!asset) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Shared Asset</h1>
            {shareInfo?.expiresAt && (
              <span className="text-sm text-gray-500">
                Expires: {formatDate(shareInfo.expiresAt)}
              </span>
            )}
          </div>

          {shareInfo?.remainingDownloads !== null &&
            shareInfo?.remainingDownloads !== undefined && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  📊 {shareInfo.remainingDownloads} download
                  {shareInfo.remainingDownloads !== 1 ? 's' : ''} remaining
                </p>
              </div>
            )}
        </div>

        {/* Asset Preview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
            {asset.type === 'image' && (
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full h-auto max-h-96 object-contain"
              />
            )}
            {asset.type === 'video' && (
              <video
                src={asset.url}
                controls
                controlsList="nodownload"
                poster={asset.thumbnailUrl}
                className="w-full h-auto max-h-96"
                onContextMenu={(e) => e.preventDefault()}
              >
                Your browser does not support the video tag.
              </video>
            )}
            {asset.type === 'audio' && (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🎵</div>
                <audio
                  src={asset.url}
                  controls
                  controlsList="nodownload"
                  className="w-full max-w-md"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  Your browser does not support the audio tag.
                </audio>
              </div>
            )}
            {asset.type === 'document' && (
              <div className="p-8 flex flex-col items-center justify-center h-64">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-gray-600">Document Preview</p>
              </div>
            )}
          </div>

          {/* Download Button */}
          {shareInfo?.allowDownload && (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
              >
                <span>⬇</span>
                <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
              </button>
            </>
          )}

          {!shareInfo?.allowDownload && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <p className="text-sm text-yellow-700">
                👁️ View-only mode - Downloads are not allowed
              </p>
            </div>
          )}
        </div>

        {/* Asset Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium break-words">{asset.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium capitalize">{asset.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Size</p>
              <p className="font-medium">{formatFileSize(asset.size)}</p>
            </div>
            {asset.metadata?.duration && (
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">
                  {Math.floor(asset.metadata.duration / 60)}:
                  {String(Math.floor(asset.metadata.duration % 60)).padStart(2, '0')}
                </p>
              </div>
            )}
            {asset.metadata?.width && asset.metadata?.height && (
              <div>
                <p className="text-sm text-gray-500">Dimensions</p>
                <p className="font-medium">
                  {asset.metadata.width} × {asset.metadata.height}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Shared via Digital Asset Management System</p>
        </div>
      </div>
    </div>
  );
};

export default SharedAssetPage;
