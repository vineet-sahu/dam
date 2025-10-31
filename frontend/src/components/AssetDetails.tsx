import React from 'react';
import { formatFileSize, formatDate } from '../utils/format-utils';

interface Props {
  asset: any;
}

const AssetDetails: React.FC<Props> = ({ asset }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-bold mb-4">Asset Details</h2>
    <div className="space-y-3">
      <Detail label="Name" value={asset.name || asset.originalName} />
      <Detail label="Type" value={asset.type} capitalize />
      <Detail label="MIME Type" value={asset.mimeType || 'N/A'} />
      <Detail label="Size" value={formatFileSize(asset.size)} />
      <Detail label="Status" value={asset.status} status />
      <Detail label="Visibility" value={asset.visibility} capitalize />
      <Detail label="Download Count" value={asset.downloadCount || 0} />
      <Detail label="Uploaded" value={formatDate(asset.uploadDate || asset.createdAt)} />
      <Detail label="Last Modified" value={formatDate(asset.updatedAt)} />
      {asset.description && <Detail label="Description" value={asset.description} />}
    </div>
  </div>
);

const Detail = ({
  label,
  value,
  status,
  capitalize,
}: {
  label: string;
  value: any;
  status?: boolean;
  capitalize?: boolean;
}) => {
  if (status) {
    const color =
      value === 'completed'
        ? 'bg-green-100 text-green-700'
        : value === 'processing'
          ? 'bg-yellow-100 text-yellow-700'
          : value === 'failed'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-700';
    return (
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <span className={`inline-block px-2 py-1 text-xs rounded font-medium ${color}`}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  );
};

export default AssetDetails;
