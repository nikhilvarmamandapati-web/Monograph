import React, { useState } from 'react';
import { Post, Draft } from '../types/index.ts';
import { api } from '../services/api.ts';
import { X, Eye, Edit3, Columns, Save, Send, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostPublished: (post: Post) => void;
  initialDraft?: Draft | null;
}

const STOCK_EDITORIAL_IMAGES = [
  {
    name: 'Sanctuary Interior & Light',
    url: '/src/assets/images/hero_editorial_journal_1792911456184.jpg',
    category: 'Architecture'
  },
  {
    name: 'Concrete Brutalist Courtyard',
    url: '/src/assets/images/article_architecture_light_1792911469903.jpg',
    category: 'Architecture'
  },
  {
    name: 'Artisanal Letterpress Sorts',
    url: '/src/assets/images/article_typography_craft_1792911483355.jpg',
    category: 'Typography'
  },
  {
    name: 'Writer’s Morning Workspace',
    url: '/src/assets/images/article_creative_workspace_1792911497057.jpg',
    category: 'Essays'
  }
];

const PRESET_AUTHORS = [
  {
    name: 'Elena Rostova',
    role: 'Curatorial Director',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
  },
  {
    name: 'Julian Mercer',
    role: 'Master Typographer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'
  },
  {
    name: 'Arthur Sterling',
    role: 'Senior Columnist',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80'
  }
];

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onPostPublished,
  initialDraft,
}) => {
  const [title, setTitle] = useState(initialDraft?.title || '');
  const [content, setContent] = useState(
    initialDraft?.content ||
      `Start drafting your essay here...\n\n### The Central Thesis\n\nExplain your theoretical framework or documentary findings.\n\n> "An uncompromised observation clarifies the entire discipline."\n\nConclude with practical implications for contemporary practice.`
  );
  const [excerpt, setExcerpt] = useState(initialDraft?.excerpt || '');
  const [category, setCategory] = useState(initialDraft?.category || 'Architecture');
  const [tagsInput, setTagsInput] = useState(initialDraft?.tags?.join(', ') || 'Architecture, Design, Monograph');
  const [coverImage, setCoverImage] = useState(initialDraft?.coverImage || STOCK_EDITORIAL_IMAGES[0].url);
  const [selectedAuthor, setSelectedAuthor] = useState(PRESET_AUTHORS[0]);
  const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const insertFormatting = (prefix: string, suffix = '') => {
    setContent((prev) => prev + `\n\n${prefix}Text${suffix}\n`);
  };

  const handleSaveDraft = async () => {
    try {
      setStatusMessage('Saving to MongoDB drafts collection...');
      await api.saveDraft({
        _id: initialDraft?._id,
        title,
        content,
        excerpt,
        category,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        coverImage,
      });
      setStatusMessage('Draft successfully stored in MongoDB.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage('Failed to save draft to database.');
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please provide an article title.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Article content cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage('Writing document to MongoDB posts collection...');

    try {
      const parsedTags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const post = await api.createPost({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.trim().slice(0, 160) + '...',
        category,
        tags: parsedTags,
        coverImage,
        author: selectedAuthor,
        readTime: `${estimatedReadMinutes} min read`,
        published: true,
        featured: false,
      });

      setStatusMessage('Published successfully!');
      setTimeout(() => {
        onPostPublished(post);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error publishing to MongoDB');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#FBF9F5] w-full max-w-5xl rounded-2xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Studio Top Bar */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-white/60">
          <div className="flex items-center gap-3">
            <span className="text-sm font-serif font-semibold text-stone-900">Monograph Publishing Studio</span>
            <span className="text-xs font-mono text-stone-400">· Node.js + MongoDB API</span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('write')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'write' ? 'bg-white text-stone-900 font-medium shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Write</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'split' ? 'bg-white text-stone-900 font-medium shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'preview' ? 'bg-white text-stone-900 font-medium shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Content Area */}
        <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-700" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Title & Metadata Header */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Article Title (e.g. The Architecture of Silence)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl sm:text-3xl font-serif font-medium text-stone-900 placeholder:text-stone-300 bg-transparent border-b border-stone-200 pb-2 focus:outline-none focus:border-stone-800"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="block text-stone-500 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-stone-900"
                >
                  <option value="Architecture">Architecture</option>
                  <option value="Typography">Typography</option>
                  <option value="Essays">Essays</option>
                  <option value="Design Philosophy">Design Philosophy</option>
                  <option value="Literature">Literature</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-500 mb-1">Author Credit</label>
                <select
                  value={selectedAuthor.name}
                  onChange={(e) => {
                    const found = PRESET_AUTHORS.find((a) => a.name === e.target.value);
                    if (found) setSelectedAuthor(found);
                  }}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-stone-900"
                >
                  {PRESET_AUTHORS.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-500 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Architecture, Light, Stone"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Excerpt Field */}
          <div>
            <label className="block text-xs font-mono text-stone-500 mb-1">
              Editorial Deck / Pull Excerpt (1–2 concise sentences)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief curatorial summary of this monograph for catalog cards and previews..."
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-stone-900 resize-none font-sans"
            />
          </div>

          {/* Archival Artwork Plate Selector */}
          <div>
            <label className="block text-xs font-mono text-stone-500 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Select High-Fidelity Cover Plate</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STOCK_EDITORIAL_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.url}
                  onClick={() => setCoverImage(img.url)}
                  className={`group relative aspect-[4/3] rounded-lg overflow-hidden border text-left transition-all cursor-pointer ${
                    coverImage === img.url
                      ? 'border-stone-950 ring-2 ring-stone-900 shadow-sm'
                      : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-stone-900/70 p-1.5 text-[10px] text-stone-200 font-mono truncate">
                    {img.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Formatting Helper Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200 text-xs font-mono text-stone-600">
            <span className="text-[11px] text-stone-400">Insert:</span>
            <button
              type="button"
              onClick={() => insertFormatting('### ')}
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 cursor-pointer"
            >
              H3 Header
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('> "')}
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 cursor-pointer"
            >
              Pull Quote
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 cursor-pointer"
            >
              Bold
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 cursor-pointer"
            >
              Italic
            </button>

            <div className="ml-auto text-[11px] text-stone-400">
              {wordCount} words · ~{estimatedReadMinutes} min read
            </div>
          </div>

          {/* Editor Workspace / Live Preview */}
          <div className="min-h-[300px]">
            {viewMode === 'write' && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your long-form publication in markdown..."
                rows={14}
                className="w-full p-4 bg-white border border-stone-300 rounded-xl font-serif text-base text-stone-900 leading-relaxed focus:outline-none focus:border-stone-900 shadow-inner"
                required
              />
            )}

            {viewMode === 'preview' && (
              <div className="p-6 bg-white border border-stone-300 rounded-xl max-h-[420px] overflow-y-auto font-serif text-stone-800 leading-relaxed space-y-4">
                <div className="border-b border-stone-200 pb-3 mb-4">
                  <span className="text-xs font-mono uppercase text-amber-900 tracking-widest">{category}</span>
                  <h2 className="text-2xl font-serif font-medium text-stone-950 mt-1">{title || 'Untitled Monograph'}</h2>
                </div>
                {content.split('\n\n').map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            )}

            {viewMode === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={14}
                  className="w-full p-4 bg-white border border-stone-300 rounded-xl font-serif text-base text-stone-900 leading-relaxed focus:outline-none focus:border-stone-900"
                />
                <div className="p-4 bg-white border border-stone-300 rounded-xl max-h-[380px] overflow-y-auto font-serif text-stone-800 leading-relaxed space-y-4 text-sm">
                  {content.split('\n\n').map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Studio Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 bg-white/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <span>BSON ObjectId generation</span>
            <span aria-hidden="true">·</span>
            <span>Mongo Document Schema ready</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-stone-100 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] disabled:opacity-50 rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Monograph'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
