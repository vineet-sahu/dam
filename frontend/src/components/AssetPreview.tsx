import React from 'react';
import assetApi from '../services/asset-service';

interface Props {
  asset: any;
  refetch: () => void;
}

const AssetPreview: React.FC<Props> = ({ asset, refetch }) => {
  const handleDownload = async (): Promise<void> => {
    try {
      await assetApi.downloadAsset(asset.id, 'original');
      refetch();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Asset Preview</h2>
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        {asset.type === 'image' && asset.url && (
          <img src={asset.url} alt={asset.name} className="w-full h-auto max-h-96 object-contain" />
        )}

        {asset.type === 'video' && asset.url && (
          <video
            src={asset.url}
            controls
            poster={asset.thumbnailUrl || undefined}
            className="w-full h-auto max-h-96"
          />
        )}

        {asset.type === 'audio' && asset.url && (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🎵</div>
            <audio src={asset.url} controls className="w-full" />
          </div>
        )}

        {asset.type === 'document' && (
          <div className="p-8 flex flex-col items-center justify-center h-64">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-600">Document Preview</p>
          </div>
        )}
      </div>

      <button
        onClick={handleDownload}
        className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center space-x-2"
      >
        <span>⬇</span>
        <span>Download Original</span>
      </button>
    </div>
  );
};

export default AssetPreview;
