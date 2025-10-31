import React, { useState, FC, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Image,
  HardDrive,
  Users,
  Download,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
  Eye,
  Search,
  RefreshCw,
} from 'lucide-react';

import { useSearchParams } from 'react-router-dom';

import { User } from '../types/User';
import { Asset } from '../types/Asset';
import {
  useAdminData,
  useAssets,
  useUsers,
  useAnalytics,
  useDeleteAsset,
  useDeleteUser,
  useToggleUserStatus,
} from '../hooks/useAdminData';
import { NavLink } from 'react-router-dom';

type DashboardAsset = Partial<Asset> & {
  id: string | number;
  filename: string;
  type: string;
  size: string | number;
  downloadCount: number;
  uploadDate: string;
  thumbnail?: string;
};

interface StatCardProps {
  icon: FC<{ className?: string }>;
  label: string;
  value: string | number;
  change?: number;
  color: string;
}

// type DashboardStats = {
//   totalAssets: number;
//   totalUsers: number;
//   totaldownloadCount: number;
//   totalStorage: string;
//   uploadsLast30Days: number;
//   usersLast30Days: number;
//   activeJobs: number;
//   failedJobs: number;
// };

// type QueueStats = {
//   waiting: number;
//   active: number;
//   completed: number;
//   failed: number;
//   delayed: number;
// };

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'overview';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [assetPage, setAssetPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const {
    stats,
    // queueStats,
    loading: statsLoading,
    // refetch: refetchStats,
  } = useAdminData();

  const assetsQuery = useAssets({
    page: assetPage,
    limit: 10,
    search: searchTerm,
    type: filterType,
  });

  const usersQuery = useUsers({
    page: userPage,
    limit: 10,
    search: searchTerm,
    status: 'all',
  });

  const { uploadData, downloadData, storageData, loading: analyticsLoading } = useAnalytics('7d');

  const deleteAssetMutation = useDeleteAsset();
  const deleteUserMutation = useDeleteUser();
  const toggleUserStatusMutation = useToggleUserStatus();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  const assets = assetsQuery.data?.assets || assetsQuery.data?.data || [];
  const totalAssets = assetsQuery.data?.total || assetsQuery.data?.totalCount || 0;
  const users = usersQuery.data?.users || usersQuery.data?.data || [];
  const totalUsers = usersQuery.data?.total || usersQuery.data?.totalCount || 0;

  const StatCard: FC<StatCardProps> = ({ icon: Icon, label, value, change, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const handleDeleteAsset = async (id: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this asset?')) return;

    try {
      await deleteAssetMutation.mutateAsync(id);
      alert('Asset deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete asset');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUserMutation.mutateAsync(id);
      alert('User deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (id: string) => {
    try {
      if (!id) return;
      await toggleUserStatusMutation.mutateAsync(id);
      alert('User status updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Image}
          label="Total Assets"
          value={stats?.totalAssets?.toLocaleString() || 0}
          change={stats?.assetGrowth || 12}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers || 0}
          change={stats?.userGrowth || 8}
          color="bg-green-500"
        />
        <StatCard
          icon={Download}
          label="Total Downloads"
          value={
            stats?.totaldownloadCount?.toLocaleString() ||
            stats?.totalDownloads?.toLocaleString() ||
            0
          }
          change={stats?.downloadGrowth || 15}
          color="bg-purple-500"
        />
        <StatCard
          icon={HardDrive}
          label="Storage Used"
          value={stats?.totalStorage || stats?.storageUsed || '0 GB'}
          change={stats?.storageGrowth || -3}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 hidden">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Upload Trend (Last 7 Days)</h3>
          {analyticsLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={uploadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Storage by Type</h3>
          {analyticsLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={storageData.storageByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalSizeBytes"
                  nameKey="mimeType"
                >
                  {storageData.storageByType.map((_entry: any, index: any) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Processing Queue Status</h3>
          <button
            onClick={refetchStats}
            disabled={statsLoading}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${statsLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{queueStats?.waiting || 0}</p>
            <p className="text-sm text-gray-600">Waiting</p>
          </div>
          <div className="text-center">
            <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{queueStats?.active || 0}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{queueStats?.completed || 0}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{queueStats?.failed || 0}</p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{queueStats?.delayed || 0}</p>
            <p className="text-sm text-gray-600">Delayed</p>
          </div>
        </div>
      </div> */}
    </div>
  );

  const renderAssets = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {assetsQuery.isLoading ? (
        <div className="p-8 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading assets...</p>
        </div>
      ) : assetsQuery.isError ? (
        <div className="p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-600">Error loading assets</p>
          <button
            onClick={() => assetsQuery.refetch()}
            className="mt-2 text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assets.map((asset: any) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{asset.thumbnail || '📄'}</span>
                        <span className="font-medium text-gray-900">
                          {asset.filename || asset.originalName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {typeof asset.size === 'number'
                        ? `${(asset.size / (1024 * 1024)).toFixed(2)} MB`
                        : asset.size}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{asset.downloadCount || 0}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(asset.uploadDate || asset.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <NavLink
                          to={`/asset/${asset.id}`}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </NavLink>
                        <button className="p-1 hover:bg-gray-100 rounded hidden">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          disabled={deleteAssetMutation.isPending}
                          className="hidden p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(assetPage - 1) * 10 + 1} to {Math.min(assetPage * 10, totalAssets)} of{' '}
              {totalAssets} assets
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setAssetPage(Math.max(1, assetPage - 1))}
                disabled={assetPage === 1 || assetsQuery.isFetching}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">{assetPage}</button>
              <button
                onClick={() => setAssetPage(assetPage + 1)}
                disabled={assetPage * 10 >= totalAssets || assetsQuery.isFetching}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">User Management</h3>
      </div>

      {usersQuery.isLoading ? (
        <div className="p-8 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : usersQuery.isError ? (
        <div className="p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-600">Error loading users</p>
          <button
            onClick={() => usersQuery.refetch()}
            className="mt-2 text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Uploads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.roles?.[0]?.name === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.roles?.[0]?.name || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.uploads || 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleUserStatus(`${user.id}`)}
                          disabled={toggleUserStatusMutation.isPending}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                          title="Toggle Status"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(`${user.id}`)}
                          disabled={deleteUserMutation.isPending}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(userPage - 1) * 10 + 1} to {Math.min(userPage * 10, totalUsers)} of{' '}
              {totalUsers} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setUserPage(Math.max(1, userPage - 1))}
                disabled={userPage === 1 || usersQuery.isFetching}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">{userPage}</button>
              <button
                onClick={() => setUserPage(userPage + 1)}
                disabled={userPage * 10 >= totalUsers || usersQuery.isFetching}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Download Analytics (Last 7 Days)</h3>
        {analyticsLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={downloadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10B981" name="Downloads" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Downloaded Assets</h3>
          {assetsQuery.isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              {assets.slice(0, 5).map((asset: any) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{asset.thumbnail || '📄'}</span>
                    <div>
                      <p className="font-medium text-sm">{asset.filename}</p>
                      <p className="text-xs text-gray-500">{asset.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{asset.downloadCount || 0}</p>
                    <p className="text-xs text-gray-500">downloads</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Storage Details</h3>
          {analyticsLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              {console.log('storageData', storageData)}
              {(storageData?.storageByType || []).map((item: any, index: any) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.mimeType}</span>
                    <span className="text-sm text-gray-600">{item.totalSize}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${
                          (item.totalSizeBytes / storageData.overview.totalStorageBytes) * 100
                        }%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (statsLoading && assetsQuery.isLoading && usersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DAM Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Digital Asset Management Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Activity className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-gray-500">admin@dam.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'assets', label: 'Assets', icon: Image },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setSearchParams({ tab: id });
                }}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'assets' && renderAssets()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'analytics' && renderAnalytics()}
      </main>
    </div>
  );
};

export default AdminDashboard;
