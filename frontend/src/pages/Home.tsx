import React, { useState } from 'react';
import {
  Upload,
  Search,
  Image,
  Video,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Database,
  ChevronRight,
  FolderOpen,
  UserPlus,
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuthContext();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: 'Bulk Upload',
      description: 'Drag-and-drop multiple files or use our API for seamless batch uploads',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Smart Processing',
      description:
        'Auto-generate thumbnails, transcode videos, and extract metadata in the background',
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Intelligent Search',
      description:
        'Find assets instantly with advanced filtering, tagging, and content-based search',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Sharing',
      description: 'Control access, preview assets, and share securely across teams',
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Scalable Storage',
      description: 'MinIO-powered object storage that grows with your needs',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Usage Analytics',
      description: 'Track downloads, uploads, and asset performance with detailed insights',
    },
  ];

  const assetTypes = [
    {
      icon: <Image className="w-8 h-8" />,
      name: 'Images',
      formats: 'JPG, PNG, WebP',
    },
    {
      icon: <Video className="w-8 h-8" />,
      name: 'Videos',
      formats: 'MP4, MOV, AVI',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      name: 'Documents',
      formats: 'PDF, DOCX',
    },
  ];

  const techStack = [
    'React + Tailwind',
    'Node.js + Express',
    'BullMQ + Redis',
    'MinIO Storage',
    'Docker Swarm',
    'FFmpeg + Sharp',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Centralize & Scale Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Digital Assets
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Upload, process, organize, and distribute your images, videos, and documents seamlessly.
            Built for teams that need enterprise-grade asset management with intelligent automation.
          </p>

          {/* Account Setup Section - Only shown when not logged in */}
          {!isLoggedIn && (
            <div className="max-w-2xl mx-auto mb-12 bg-slate-800/50 backdrop-blur border border-purple-500/30 rounded-xl p-8">
              <div className="flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-purple-400 mr-3" />
                <h3 className="text-2xl font-bold text-white">Get Started in Minutes</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Create your account to start managing your digital assets. No credit card required.
                Set up your workspace, invite team members, and begin uploading assets immediately.
              </p>
              <button
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-lg font-semibold transition inline-flex items-center group"
                onClick={() => {
                  navigate('/signup');
                }}
              >
                Create Free Account
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
              <p className="text-gray-400 text-sm mt-4">
                Already have an account?{' '}
                <Link to="/signin" className="text-purple-400 hover:text-purple-300 underline">
                  Sign in here
                </Link>
              </p>
            </div>
          )}

          {/* Action Buttons Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
            <Link
              to={'/upload'}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl p-8 transition shadow-lg hover:shadow-purple-500/50 group"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition" />
              <h3 className="text-2xl font-bold mb-2">Upload Assets</h3>
              <p className="text-purple-100">
                Drag and drop files or folders to start uploading. Supports bulk uploads with
                automatic processing.
              </p>
            </Link>

            <Link
              to={'/gallery'}
              className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white rounded-xl p-8 transition shadow-lg hover:shadow-pink-500/50 group"
            >
              <FolderOpen className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition" />
              <h3 className="text-2xl font-bold mb-2">View Digital Assets</h3>
              <p className="text-pink-100">
                Browse your asset library with advanced search, filters, and preview capabilities.
              </p>
            </Link>
          </div>

          {/* Asset Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assetTypes.map((asset, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition"
              >
                <div className="text-purple-400 mb-3 flex justify-center">{asset.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{asset.name}</h3>
                <p className="text-gray-400 text-sm">{asset.formats}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to streamline your digital asset workflow from upload to delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-slate-800/30 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:bg-slate-800/50 hover:border-purple-500/40 transition group"
              >
                <div className="text-purple-400 mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Automated Asset Pipeline
            </h2>
            <p className="text-xl text-gray-300">
              From upload to distribution - fully automated background processing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Upload',
                desc: 'Drag & drop or API bulk upload with progress tracking',
              },
              {
                step: '2',
                title: 'Process',
                desc: 'Auto-generate thumbnails, transcode videos, extract metadata',
              },
              {
                step: '3',
                title: 'Organize',
                desc: 'Smart tagging, categorization, and content-based indexing',
              },
              {
                step: '4',
                title: 'Distribute',
                desc: 'Secure preview, download, and cross-team sharing',
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-purple-400 w-6 h-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Enterprise-Grade Technology Stack
            </h2>
            <p className="text-xl text-gray-300">
              Built on proven technologies for scalability, reliability, and performance
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className="bg-slate-800/30 backdrop-blur border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition flex items-center justify-center"
              >
                <span className="text-gray-300 text-sm font-medium text-center">{tech}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  label: 'Docker Swarm',
                  value: 'Auto-Scaling',
                  desc: 'Dynamic worker scaling based on queue size',
                },
                {
                  label: 'BullMQ + Redis',
                  value: 'Job Queue',
                  desc: 'Reliable background processing with retry logic',
                },
                {
                  label: 'MinIO',
                  value: 'Object Storage',
                  desc: 'S3-compatible storage with unlimited scalability',
                },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-purple-400 font-semibold mb-2">{item.label}</div>
                  <div className="text-white text-2xl font-bold mb-2">{item.value}</div>
                  <div className="text-gray-400 text-sm">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Asset Management?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join teams managing millions of digital assets with intelligent automation and
              enterprise-grade infrastructure
            </p>
            <button className="px-10 py-4 bg-white text-purple-600 hover:bg-gray-100 rounded-lg text-lg font-semibold transition inline-flex items-center group">
              Get Started Now
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
