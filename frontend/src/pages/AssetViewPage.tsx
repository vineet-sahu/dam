import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAsset, useDeleteAsset } from "../hooks/useAsset";
import { useAuthContext } from "../context/AuthContext";
import AssetPreview from "../components/AssetPreview";
import AssetDetails from "../components/AssetDetails";
import assetApi from "../services/asset";

const AssetViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: asset, isLoading, isError, error } = useAsset(id || "");
  const { mutate: deleteAsset, isPending } = useDeleteAsset();

  const isOwner = user?.id === asset?.owner_id;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      deleteAsset(id || "", { onSuccess: () => navigate("/gallery") });
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-b-2 border-green-500 rounded-full"></div>
      </div>
    );

  if (isError || !asset)
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error loading asset: {(error as any)?.message || "Asset not found"}
          </div>
          <button
            onClick={() => navigate("/gallery")}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/gallery")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Back to Gallery
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isPending ? "Deleting..." : "Delete Asset"}
            </button>
          )}
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetPreview asset={asset} />
          <AssetDetails asset={asset} />
        </div>

        {/* Additional sections */}
        {asset.thumbnailUrl && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Thumbnail</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={asset.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 bg-gray-50">
                  <p className="text-xs text-gray-600 truncate">
                    {asset.thumbnailPath?.split("/").pop() || "thumbnail.jpg"}
                  </p>
                  <button
                    onClick={() =>
                      assetApi.downloadAsset(asset.id, "thumbnail")
                    }
                    className="w-full mt-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetViewPage;
