import React, { useState, useEffect, FC } from "react";
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
} from "recharts";
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
} from "lucide-react";

import { User } from "../types/User";
import { Asset } from "../types/Asset";

type DashboardAsset = Partial<Asset> & {
  id: string | number;
  filename: string;
  type: string;
  size: string;
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

type DashboardStats = {
  totalAssets: number;
  totalUsers: number;
  totaldownloadCount: number;
  totalStorage: string;
  uploadsLast30Days: number;
  usersLast30Days: number;
  activeJobs: number;
  failedJobs: number;
};

type QueueStats = {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [assets, setAssets] = useState<DashboardAsset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setTimeout(() => {
        setStats({
          totalAssets: 15847,
          totalUsers: 342,
          totaldownloadCount: 48293,
          totalStorage: "2.4 TB",
          uploadsLast30Days: 1247,
          usersLast30Days: 23,
          activeJobs: 12,
          failedJobs: 3,
        });

        setAssets([
          {
            id: "1",
            filename: "product-banner.jpg",
            type: "image",
            size: "2.4 MB",
            downloadCount: 342,
            uploadDate: "2025-10-20",
            thumbnail: "🖼️",
          },
          {
            id: "2",
            filename: "demo-video.mp4",
            type: "video",
            size: "145 MB",
            downloadCount: 189,
            uploadDate: "2025-10-19",
            thumbnail: "🎥",
          },
          {
            id: "3",
            filename: "whitepaper.pdf",
            type: "document",
            size: "5.2 MB",
            downloadCount: 567,
            uploadDate: "2025-10-18",
            thumbnail: "📄",
          },
          {
            id: "4",
            filename: "logo-pack.zip",
            type: "archive",
            size: "12 MB",
            downloadCount: 234,
            uploadDate: "2025-10-17",
            thumbnail: "📦",
          },
          {
            id: "5",
            filename: "promo-image.png",
            type: "image",
            size: "1.8 MB",
            downloadCount: 445,
            uploadDate: "2025-10-16",
            thumbnail: "🖼️",
          },
        ]);

        setUsers([
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            roles: [{ name: "admin" }],
            uploads: 234,
            status: "active",
            storageUsed: 0,
            storageLimit: 0,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            roles: [{ name: "user" }],
            uploads: 145,
            status: "active",
            storageUsed: 0,
            storageLimit: 0,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "3",
            name: "Bob Wilson",
            email: "bob@example.com",
            roles: [{ name: "user" }],
            uploads: 89,
            status: "inactive",
            storageUsed: 0,
            storageLimit: 0,
            createdAt: "",
            updatedAt: "",
          },
        ]);

        setQueueStats({
          waiting: 5,
          active: 12,
          completed: 4829,
          failed: 3,
          delayed: 0,
        });

        setLoading(false);
      }, 1000);
    };

    fetchDashboardData();
  }, []);

  const uploadData = [
    { date: "10/21", count: 145 },
    { date: "10/22", count: 189 },
    { date: "10/23", count: 167 },
    { date: "10/24", count: 223 },
    { date: "10/25", count: 198 },
    { date: "10/26", count: 234 },
    { date: "10/27", count: 212 },
  ];

  const downloadData = [
    { date: "10/21", count: 567 },
    { date: "10/22", count: 634 },
    { date: "10/23", count: 712 },
    { date: "10/24", count: 689 },
    { date: "10/25", count: 745 },
    { date: "10/26", count: 823 },
    { date: "10/27", count: 791 },
  ];

  const storageData = [
    { name: "Images", value: 45, size: "1.08 TB" },
    { name: "Videos", value: 35, size: "840 GB" },
    { name: "Documents", value: 15, size: "360 GB" },
    { name: "Other", value: 5, size: "120 GB" },
  ];

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

  const StatCard: FC<StatCardProps> = ({
    icon: Icon,
    label,
    value,
    change,
    color,
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p
              className={`text-sm mt-1 ${change > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {change > 0 ? "↑" : "↓"} {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Image}
          label="Total Assets"
          value={stats?.totalAssets.toLocaleString() || 0}
          change={12}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers || 0}
          change={8}
          color="bg-green-500"
        />
        <StatCard
          icon={Download}
          label="Total downloadCount"
          value={stats?.totaldownloadCount.toLocaleString() || 0}
          change={15}
          color="bg-purple-500"
        />
        <StatCard
          icon={HardDrive}
          label="Storage Used"
          value={stats?.totalStorage || 0}
          change={-3}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Upload Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={uploadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Storage by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={storageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  const { name, value } = props as any;
                  return `${name}: ${value}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {storageData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Processing Queue Status</h3>
          <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{queueStats?.waiting}</p>
            <p className="text-sm text-gray-600">Waiting</p>
          </div>
          <div className="text-center">
            <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{queueStats?.active}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{queueStats?.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{queueStats?.failed}</p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{queueStats?.delayed}</p>
            <p className="text-sm text-gray-600">Delayed</p>
          </div>
        </div>
      </div>
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
                downloadCount
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
            {assets.map((asset: DashboardAsset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{asset.thumbnail}</span>
                    <span className="font-medium text-gray-900">
                      {asset.filename}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {asset.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{asset.size}</td>
                <td className="px-6 py-4 text-gray-600">
                  {asset.downloadCount}
                </td>
                <td className="px-6 py-4 text-gray-600">{asset.uploadDate}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
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
          Showing 1 to 5 of {assets.length} assets
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">
            3
          </button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">User Management</h3>
      </div>
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
                {/* <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td> */}
                {/* <td className="px-6 py-4 text-gray-600">{user.uploads}</td> */}
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Download Analytics (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={downloadData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10B981" name="downloadCount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Downloaded Assets</h3>
          <div className="space-y-3">
            {assets.slice(0, 5).map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{asset.thumbnail}</span>
                  <div>
                    <p className="font-medium text-sm">{asset.filename}</p>
                    <p className="text-xs text-gray-500">{asset.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">
                    {asset.downloadCount}
                  </p>
                  <p className="text-xs text-gray-500">downloadCount</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Storage Details</h3>
          <div className="space-y-4">
            {storageData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">{item.size}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: COLORS[index],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
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
              <h1 className="text-2xl font-bold text-gray-900">
                DAM Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Digital Asset Management Platform
              </p>
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
              { id: "overview", label: "Overview", icon: Activity },
              { id: "assets", label: "Assets", icon: Image },
              { id: "users", label: "Users", icon: Users },
              { id: "analytics", label: "Analytics", icon: BarChart },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
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
        {activeTab === "overview" && renderOverview()}
        {activeTab === "assets" && renderAssets()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "analytics" && renderAnalytics()}
      </main>
    </div>
  );
};

export default AdminDashboard;
