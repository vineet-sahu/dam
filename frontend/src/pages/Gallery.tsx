import React, { useEffect, useState } from "react";
import { useAssets, useDeleteAsset } from "../hooks/useAsset";
import { useAssetContext } from "../context/Assetcontext";
import { NavLink } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import ShareModal from "../components/common/ShareModal";
import { Eye, Share2, Trash2 } from "lucide-react";

const GalleryPage: React.FC = () => {
  const {
    filter,
    setFilter,
    sortBy,
    setSortBy,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
  } = useAssetContext();

  const { data, isLoading, isError, error } = useAssets({
    page: currentPage,
    limit: itemsPerPage,
    search: search || undefined,
    type: filter.type !== "all" ? filter.type : undefined,
    visibility: filter.visibility,
    sortBy: sortBy || undefined,
    tags: filter.tags,
  });

  const { mutate, isPending: deleteAssetIsPending } = useDeleteAsset();
  const [localSearch, setLocalSearch] = useState(search);
  const [shareModalAsset, setShareModalAsset] = useState<{
    id: string;
    name: string;
    type: string;
    thumbnailUrl?: string;
  } | null>(null);

  const { user } = useAuthContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, sortBy]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      mutate(id);
    }
  };

  const totalPages = data?.pagination.totalPages || 1;
  const assets = data?.assets || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gallery</h1>
          <div className="flex space-x-2">
            <NavLink
              to="/my-shares"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            >
              <span>🔗</span>
              <span>My Shares</span>
            </NavLink>
            <NavLink
              to="/upload"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
            >
              <span>+</span>
              <span>Upload Asset</span>
            </NavLink>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
          <input
            type="text"
            placeholder="Search assets..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full md:w-1/2 mb-2 md:mb-0 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />

          <select
            value={filter.type || "all"}
            onChange={(e) =>
              setFilter({ ...filter, type: e.target.value as any })
            }
            className="w-full md:w-1/4 mb-2 md:mb-0 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="audio">Audio</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="size:desc">Largest First</option>
            <option value="size:asc">Smallest First</option>
          </select>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error loading assets: {(error as any)?.message || "Unknown error"}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map((asset) => {
                const isOwner = user?.id === asset.owner_id;

                return (
                  <div
                    key={asset.id}
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group relative"
                  >
                    <NavLink to={`/asset/${asset.id}`}>
                      {(asset.type === "image" || asset.type === "video") &&
                      (asset.thumbnailUrl || asset.url) ? (
                        <img
                          src={asset.thumbnailUrl || asset.url}
                          alt={asset.name}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-gray-100 text-gray-500 font-medium">
                          {asset.type === "video" && "🎥 Video"}
                          {asset.type === "audio" && "🎵 Audio"}
                          {asset.type === "document" && "📄 Document"}
                        </div>
                      )}
                    </NavLink>

                    <div className="p-2">
                      <NavLink to={`/asset/${asset.id}`}>
                        <p className="text-sm font-medium truncate hover:text-green-600">
                          {asset.name}
                        </p>
                      </NavLink>
                      <p className="text-xs text-gray-500">
                        {(Number(asset.size) / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {asset.status && asset.status !== "completed" && (
                        <span
                          className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                            asset.status === "processing"
                              ? "bg-yellow-100 text-yellow-700"
                              : asset.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {asset.status}
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                      <NavLink
                        to={`/asset/${asset.id}`}
                        className="p-2 bg-white text-gray-800 rounded hover:bg-gray-100"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </NavLink>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShareModalAsset({
                            id: asset.id,
                            name: asset.name,
                            type: asset.type,
                            thumbnailUrl: asset.thumbnailUrl,
                          });
                        }}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Share"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(`${asset.id}`);
                          }}
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Delete"
                          disabled={deleteAssetIsPending}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {assets.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No assets found. Try adjusting your filters.
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNum
                          ? "bg-green-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            <div className="text-center mt-4 text-sm text-gray-600">
              Showing {assets.length} of {data?.pagination.total || 0} assets
            </div>
          </>
        )}
      </div>

      {/* Share Modal */}
      {shareModalAsset && (
        <ShareModal
          isOpen={!!shareModalAsset}
          onClose={() => setShareModalAsset(null)}
          assetId={shareModalAsset.id}
          assetName={shareModalAsset.name}
          assetType={shareModalAsset.type}
          thumbnailUrl={shareModalAsset.thumbnailUrl}
        />
      )}
    </div>
  );
};

export default GalleryPage;
