/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Post, Draft, DatabaseStatus } from './types/index.ts';
import { api } from './services/api.ts';
import { Header } from './components/Header.tsx';
import { HeroFeatured } from './components/HeroFeatured.tsx';
import { ArticleCard } from './components/ArticleCard.tsx';
import { ArticleReader } from './components/ArticleReader.tsx';
import { PublishModal } from './components/PublishModal.tsx';
import { DatabaseModal } from './components/DatabaseModal.tsx';
import { Footer } from './components/Footer.tsx';
import { Search, SlidersHorizontal, Database, PenTool, CheckCircle, XCircle } from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'likes' | 'views'>('recent');
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [databaseModalOpen, setDatabaseModalOpen] = useState(false);
  const [activeDraftToEdit, setActiveDraftToEdit] = useState<Draft | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [fetchedPosts, fetchedDrafts, fetchedStatus] = await Promise.all([
        api.getPosts(),
        api.getDrafts(),
        api.getDatabaseStatus(),
      ]);
      setPosts(fetchedPosts);
      setDrafts(fetchedDrafts);
      setDbStatus(fetchedStatus);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (currentCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === currentCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'likes') {
      result.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'views') {
      result.sort((a, b) => b.views - a.views);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [posts, currentCategory, searchQuery, sortBy]);

  // Featured Lead Story (lead story when viewing 'All' and no search query)
  const leadPost = useMemo(() => {
    if (currentCategory === 'All' && !searchQuery.trim() && filteredPosts.length > 0) {
      return filteredPosts.find((p) => p.featured) || filteredPosts[0];
    }
    return null;
  }, [currentCategory, searchQuery, filteredPosts]);

  // Secondary grid of articles
  const secondaryPosts = useMemo(() => {
    if (leadPost) {
      return filteredPosts.filter((p) => p._id !== leadPost._id);
    }
    return filteredPosts;
  }, [filteredPosts, leadPost]);

  const handleLike = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    try {
      const { likes } = await api.likePost(post._id);
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, likes } : p))
      );
      if (selectedPost && selectedPost._id === post._id) {
        setSelectedPost((prev) => (prev ? { ...prev, likes } : null));
      }
      showToast('Appreciation registered in MongoDB.');
    } catch {
      showToast('Failed to register appreciation.');
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${post.title}" from the database?`)) return;

    try {
      await api.deletePost(post._id);
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      if (selectedPost?._id === post._id) {
        setSelectedPost(null);
      }
      showToast('Article removed from MongoDB.');
    } catch {
      showToast('Failed to delete article.');
    }
  };

  const handleOpenDraft = (draft: Draft) => {
    setActiveDraftToEdit(draft);
    setPublishModalOpen(true);
  };

  const handleDeleteDraft = async (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    try {
      await api.deleteDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d._id !== draftId));
      showToast('Draft removed from MongoDB.');
    } catch {
      showToast('Failed to delete draft.');
    }
  };

  const handlePostPublished = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setSelectedPost(newPost);
    showToast('Monograph published and stored in MongoDB!');
    api.getDrafts().then(setDrafts).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-stone-900 text-stone-100 text-xs font-mono shadow-xl flex items-center gap-2 border border-stone-700 animate-fade-in">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header conforming to Top Bar Contract */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSelectedPost(null);
          setSearchQuery('');
        }}
        onOpenPublish={() => {
          setActiveDraftToEdit(null);
          setPublishModalOpen(true);
        }}
        onOpenDatabase={() => setDatabaseModalOpen(true)}
        onGoHome={() => {
          setSelectedPost(null);
          setCurrentCategory('All');
          setSearchQuery('');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedPost ? (
          /* Reader View */
          <ArticleReader
            post={selectedPost}
            onBack={() => setSelectedPost(null)}
            onLike={handleLike}
          />
        ) : (
          /* Catalog & Discovery Feed */
          <div className="max-w-7xl mx-auto px-6 pt-8 pb-20">
            {/* Operational Utility Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2.5 px-4 mb-8 rounded-lg bg-stone-100/80 border border-stone-200/90 text-xs font-mono text-stone-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-800">Monograph Archive:</span>
                <span>Autumn Edition 2026</span>
                <span aria-hidden="true">·</span>
                <span>Curated Papers &amp; Spatial Studies</span>
              </div>

              <button
                onClick={() => setDatabaseModalOpen(true)}
                className="flex items-center gap-1.5 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
                title="Inspect MongoDB Cluster"
              >
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span className="tabular-nums">
                  MongoDB: {posts.length} {posts.length === 1 ? 'doc' : 'docs'}
                </span>
                <span className="text-[10px] text-stone-400">({dbStatus?.mode.split(' ')[0] || 'active'})</span>
              </button>
            </div>

            {/* Lead Story Feature (when on 'All' without search) */}
            {leadPost && (
              <HeroFeatured
                post={leadPost}
                onRead={(p) => setSelectedPost(p)}
                onLike={handleLike}
              />
            )}

            {/* Filter, Search & Sorting Ribbon */}
            <div className="mb-10 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                {/* Category Selector Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 -mb-1">
                  {['All', 'Architecture', 'Typography', 'Essays', 'Design Philosophy', 'Literature'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setCurrentCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                          currentCategory === cat
                            ? 'bg-stone-900 text-stone-100'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                        }`}
                      >
                        {cat === 'All' ? 'All Works' : cat}
                      </button>
                    )
                  )}
                </div>

                {/* Search & Sort Controls */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search title, author, keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-stone-500 shrink-0">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="bg-transparent border-0 text-stone-700 font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="likes">Most Appreciated</option>
                      <option value="views">Most Read</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Saved Drafts Bar (if any drafts exist) */}
              {drafts.length > 0 && !searchQuery && (
                <div className="p-3 rounded-lg bg-stone-100/70 border border-stone-200 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5 text-amber-800" />
                    <span className="font-serif font-medium text-stone-800">Unpublished Drafts in MongoDB:</span>
                    <span className="text-stone-500 font-mono">
                      {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    {drafts.map((d) => (
                      <div
                        key={d._id}
                        onClick={() => handleOpenDraft(d)}
                        className="flex items-center gap-2 px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-300 rounded text-stone-800 cursor-pointer text-xs"
                      >
                        <span className="font-serif truncate max-w-[140px]">{d.title || 'Untitled Draft'}</span>
                        <button
                          onClick={(e) => handleDeleteDraft(e, d._id)}
                          className="text-stone-400 hover:text-stone-700 p-0.5"
                          title="Delete draft"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Articles Catalog Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-xl border border-stone-200 p-5 space-y-4 animate-pulse">
                    <div className="aspect-[4/3] bg-stone-200 rounded-lg" />
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                    <div className="h-6 bg-stone-200 rounded w-3/4" />
                    <div className="h-12 bg-stone-200 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : secondaryPosts.length === 0 ? (
              <div className="text-center py-20 px-6 border border-dashed border-stone-300 rounded-2xl space-y-4">
                <span className="font-serif italic text-2xl text-stone-700 block">
                  No monographs match your query
                </span>
                <p className="text-xs text-stone-500 max-w-sm mx-auto font-sans">
                  Try adjusting your search terms, select another catalog category, or author a new publication.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentCategory('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Clear Filter
                  </button>
                  <button
                    onClick={() => {
                      setActiveDraftToEdit(null);
                      setPublishModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs text-stone-100 bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Write New Article
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {secondaryPosts.map((post) => (
                  <ArticleCard
                    key={post._id}
                    post={post}
                    onRead={(p) => setSelectedPost(p)}
                    onLike={handleLike}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSelectedPost(null);
          setSearchQuery('');
        }}
        onOpenPublish={() => {
          setActiveDraftToEdit(null);
          setPublishModalOpen(true);
        }}
        onOpenDatabase={() => setDatabaseModalOpen(true)}
      />

      {/* Writing Studio / Publishing Modal */}
      <PublishModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPostPublished={handlePostPublished}
        initialDraft={activeDraftToEdit}
      />

      {/* MongoDB Database Inspector Modal */}
      <DatabaseModal
        isOpen={databaseModalOpen}
        onClose={() => setDatabaseModalOpen(false)}
        onDatabaseReset={() => loadAllData()}
      />
    </div>
  );
}
