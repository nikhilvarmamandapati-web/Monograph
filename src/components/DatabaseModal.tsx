import React, { useState, useEffect } from 'react';
import { DatabaseOverview } from '../types/index.ts';
import { api } from '../services/api.ts';
import { X, Database, Server, RefreshCw, Download, CheckCircle, AlertTriangle, Layers, FileJson } from 'lucide-react';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatabaseReset?: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  onDatabaseReset,
}) => {
  const [overview, setOverview] = useState<DatabaseOverview | null>(null);
  const [mongoUri, setMongoUri] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeCollectionTab, setActiveCollectionTab] = useState<string>('posts');
  const [collectionSample, setCollectionSample] = useState<any[]>([]);
  const [loadingSample, setLoadingSample] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchOverview = async () => {
    try {
      const data = await api.getDatabaseOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load database overview', err);
    }
  };

  const loadSampleData = async (collName: string) => {
    setActiveCollectionTab(collName);
    setLoadingSample(true);
    try {
      if (collName === 'posts') {
        const posts = await api.getPosts();
        setCollectionSample(posts.slice(0, 5));
      } else if (collName === 'categories') {
        const cats = await api.getCategories();
        setCollectionSample(cats);
      } else if (collName === 'drafts') {
        const drafts = await api.getDrafts();
        setCollectionSample(drafts);
      } else if (collName === 'comments') {
        // Fetch comments for first post
        const posts = await api.getPosts();
        if (posts.length > 0) {
          const comments = await api.getComments(posts[0]._id);
          setCollectionSample(comments);
        } else {
          setCollectionSample([]);
        }
      }
    } catch (err) {
      setCollectionSample([]);
    } finally {
      setLoadingSample(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOverview();
      loadSampleData('posts');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectMongo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUri.trim()) return;

    setConnecting(true);
    setConnectionResult(null);
    try {
      const res = await api.connectMongo(mongoUri.trim());
      setConnectionResult(res);
      await fetchOverview();
    } catch (err: any) {
      setConnectionResult({
        success: false,
        message: err.message || 'Failed to connect to MongoDB cluster.',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset database to canonical seed articles? Any custom posts will be re-initialized.')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetDatabase();
      await fetchOverview();
      await loadSampleData('posts');
      if (onDatabaseReset) onDatabaseReset();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#FBF9F5] w-full max-w-4xl rounded-2xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-white/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold font-sans text-stone-900">
                MongoDB Document Storage Architecture
              </h2>
              <p className="text-xs text-stone-500 font-mono">
                Node.js Express + MongoDB Driver · Database: monograph_blog
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Banner */}
          <div className="p-4 rounded-xl bg-stone-100/90 border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-stone-400 block mb-0.5">Active Engine</span>
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-stone-600" />
                <span>{overview?.status.mode || 'Loading...'}</span>
              </span>
            </div>

            <div>
              <span className="text-stone-400 block mb-0.5">Database Cluster</span>
              <span className="font-semibold text-stone-800">monograph_blog</span>
            </div>

            <div>
              <span className="text-stone-400 block mb-0.5">Total Registered Documents</span>
              <span className="font-semibold text-stone-900 tabular-nums">
                {overview
                  ? (
                      overview.status.counts.posts +
                      overview.status.counts.comments +
                      overview.status.counts.drafts +
                      overview.status.counts.categories
                    ).toLocaleString()
                  : '...'}
              </span>
            </div>
          </div>

          {/* Connect External MongoDB Atlas Instance */}
          <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-stone-900 font-sans">
                  External MongoDB Atlas / Cluster Connection
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Connect your live MongoDB Atlas connection string, or rely on the embedded local document engine.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                Native Driver Ready
              </span>
            </div>

            <form onSubmit={handleConnectMongo} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="mongodb+srv://<username>:<password>@cluster.mongodb.net/monograph_blog"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
              />
              <button
                type="submit"
                disabled={connecting || !mongoUri.trim()}
                className="px-4 py-2 text-xs font-medium text-stone-100 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                {connecting ? 'Connecting...' : 'Test & Connect'}
              </button>
            </form>

            {connectionResult && (
              <div
                className={`p-3 rounded-lg text-xs font-mono flex items-start gap-2 ${
                  connectionResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                {connectionResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{connectionResult.message}</span>
              </div>
            )}
          </div>

          {/* Collections Inspector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-stone-900 font-sans flex items-center gap-2">
                <Layers className="w-4 h-4 text-stone-600" />
                <span>MongoDB Collections Schema &amp; Documents</span>
              </h3>
            </div>

            {/* Collection Tabs */}
            <div className="flex items-center gap-2 border-b border-stone-200">
              {['posts', 'comments', 'drafts', 'categories'].map((coll) => {
                const count =
                  overview?.status.counts[coll as keyof typeof overview.status.counts] || 0;
                return (
                  <button
                    key={coll}
                    type="button"
                    onClick={() => loadSampleData(coll)}
                    className={`px-3 py-2 text-xs font-mono border-b-2 transition-colors cursor-pointer ${
                      activeCollectionTab === coll
                        ? 'border-stone-900 font-semibold text-stone-900'
                        : 'border-transparent text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {coll} ({count})
                  </button>
                );
              })}
            </div>

            {/* Live Collection Document Viewer */}
            <div className="bg-stone-900 text-stone-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-64 shadow-inner">
              {loadingSample ? (
                <div className="text-stone-400 py-4 text-center">Querying collection documents...</div>
              ) : collectionSample.length === 0 ? (
                <div className="text-stone-500 py-4 text-center">No documents in this collection.</div>
              ) : (
                <pre>{JSON.stringify(collectionSample, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Utilities */}
        <div className="px-6 py-4 border-t border-stone-200 bg-white/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="/api/db/export"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Database (JSON)</span>
            </a>

            <button
              type="button"
              onClick={handleResetSeed}
              disabled={resetting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>Reset to Seed Archive</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-300 transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
