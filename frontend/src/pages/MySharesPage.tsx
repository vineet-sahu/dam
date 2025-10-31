import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../services/api';

interface ShareLink {
  id: string;
  url: string;
  token: string;
  asset: {
    id: string;
    name: string;
    type: string;
    thumbnailPath?: string;
  };
  expiresAt?: string;
  isExpired: boolean;
  allowDownload: boolean;
  maxDownloads?: number;
  downloadCount: number;
  requiresPassword: boolean;
  accessCount: number;
  createdAt: string;
}

const MySharesPage: React.FC = () => {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchShareLinks();
  }, []);

  const fetchShareLinks = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get('/share/my-shares');
      setShareLinks(response.data.shareLinks);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch share links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevokeLink = async (token: string) => {
    if (!window.confirm('Are you sure you want to revoke this share link?')) {
      return;
    }

    try {
      await api.delete(`/share/${token}`);
      setShareLinks(shareLinks.filter((link) => link.token !== token));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to revoke link');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Shared Links</h1>
          <NavLink
            to="/gallery"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Back to Gallery
          </NavLink>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {shareLinks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Share Links Yet</h2>
            <p className="text-gray-600 mb-6">
              Share your assets with others by creating share links
            </p>
            <NavLink
              to="/gallery"
              className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
            >
              Go to Gallery
            </NavLink>
          </div>
        ) : (
          <div className="space-y-4">
            {shareLinks.map((link) => (
              <div
                key={link.id}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  link.isExpired ? 'opacity-60' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <NavLink to={`/asset/${link.asset.id}`} className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">
                        {link.asset.type === 'video' && '🎥'}
                        {link.asset.type === 'image' && '🖼️'}
                        {link.asset.type === 'audio' && '🎵'}
                        {link.asset.type === 'document' && '📄'}
                      </div>
                    </NavLink>
                    <div className="flex-1 min-w-0">
                      <NavLink
                        to={`/asset/${link.asset.id}`}
                        className="font-medium text-gray-900 hover:text-green-600 truncate block"
                      >
                        {link.asset.name}
                      </NavLink>
                      <p className="text-sm text-gray-500">Created: {formatDate(link.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {link.isExpired && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                        ⚠️ Expired
                      </span>
                    )}
                    {!link.isExpired && link.expiresAt && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                        ⏰ Expires {formatDate(link.expiresAt)}
                      </span>
                    )}
                    {link.requiresPassword && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        🔒 Password
                      </span>
                    )}
                    {!link.allowDownload && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        👁️ View Only
                      </span>
                    )}
                    {link.maxDownloads && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        📊 {link.downloadCount}/{link.maxDownloads}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      👁️ {link.accessCount} views
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopyLink(link.url, link.id)}
                      className={`px-4 py-2 rounded text-sm font-medium transition ${
                        copiedId === link.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {copiedId === link.id ? '✓ Copied' : 'Copy Link'}
                    </button>
                    <button
                      onClick={() => handleRevokeLink(link.token)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
                    >
                      Revoke
                    </button>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Show full URL
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm break-all">{link.url}</div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySharesPage;
