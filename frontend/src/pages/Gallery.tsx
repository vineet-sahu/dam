import React, { useState } from "react";

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
}

// Create multiple dummy assets for pagination
const dummyAssets: Asset[] = Array.from({ length: 32 }, (_, i) => {
  const isImage = i % 3 !== 0;
  const isVideo = i % 3 === 0 && i % 2 === 0;
  const isDocument = i % 3 === 0 && i % 2 !== 0;

  return {
    id: `${i + 1}`,
    name: isImage
      ? `Image ${i + 1}`
      : isVideo
        ? `Video ${i + 1}`
        : `Document ${i + 1}`,
    url: isImage
      ? `https://via.placeholder.com/300x200?text=Image+${i + 1}`
      : "",
    type: isImage ? "image/png" : isVideo ? "video/mp4" : "application/pdf",
  };
});

const GalleryPage: React.FC = () => {
  const [assets] = useState<Asset[]>(dummyAssets);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video" | "document">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtered assets based on search & filter
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name
      .toLowerCase()
      .includes(search.toLowerCase());

    let matchesFilter = true;
    if (filter === "image") matchesFilter = asset.type.startsWith("image");
    if (filter === "video") matchesFilter = asset.type.startsWith("video");
    if (filter === "document") matchesFilter = asset.type === "application/pdf";

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gallery</h1>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset page on search
          }}
          className="w-full md:w-1/2 mb-2 md:mb-0 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
        />

        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as any);
            setCurrentPage(1); // reset page on filter change
          }}
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
        >
          <option value="all">All</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {paginatedAssets.map((asset) => (
          <div
            key={asset.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
          >
            {asset.type.startsWith("image") && asset.url ? (
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-40 bg-gray-100 text-gray-500 font-medium">
                {asset.type.startsWith("video")
                  ? "Video Placeholder"
                  : "Document Placeholder"}
              </div>
            )}
            <p className="p-2 text-sm font-medium">{asset.name}</p>
          </div>
        ))}
        {paginatedAssets.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No assets found
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
