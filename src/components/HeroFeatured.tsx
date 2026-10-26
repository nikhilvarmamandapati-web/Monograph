import React, { useState } from 'react';
import { Post } from '../types/index.ts';
import { BookOpen, Heart, Eye } from 'lucide-react';

interface HeroFeaturedProps {
  post: Post;
  onRead: (post: Post) => void;
  onLike: (e: React.MouseEvent, post: Post) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({ post, onRead, onLike }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <section className="border-b border-stone-200 pb-12 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Lead Story Editorial Narrative */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Unboxed Metadata Header */}
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500">
              <span className="font-semibold text-amber-900">{post.category}</span>
              <span aria-hidden="true">·</span>
              <span>Lead Dispatch</span>
              <span aria-hidden="true">·</span>
              <span>{post.readTime}</span>
            </div>

            {/* Headline */}
            <h1
              onClick={() => onRead(post)}
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-stone-900 leading-[1.15] hover:text-amber-950 transition-colors cursor-pointer text-balance"
            >
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-base lg:text-lg text-stone-600 font-sans leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          </div>

          {/* Hairline Divider & Curatorial Credit */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-3">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-stone-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center font-serif text-stone-700 font-semibold text-sm">
                  {post.author.name[0]}
                </div>
              )}
              <div>
                <span className="font-medium text-stone-800 block">{post.author.name}</span>
                <span className="text-stone-500">{post.author.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-stone-500 font-mono tabular-nums text-xs">
              <span>{formattedDate}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.views.toLocaleString()}</span>
              </span>
              <button
                onClick={(e) => onLike(e, post)}
                className="flex items-center gap-1.5 text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                title="Appreciate this article"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{post.likes}</span>
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={() => onRead(post)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Monograph</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero High-Fidelity Photograph Frame */}
        <div
          onClick={() => onRead(post)}
          className="lg:col-span-5 relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm cursor-pointer group"
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-stone-100 animate-pulse flex items-center justify-center text-xs text-stone-400 font-mono">
              Loading archival plate...
            </div>
          )}

          {!imageError ? (
            <img
              src={post.coverImage}
              alt={post.title}
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 flex flex-col items-center justify-center p-6 text-center text-stone-600">
              <span className="font-serif italic text-lg mb-1">{post.title}</span>
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Archival Plate</span>
            </div>
          )}

          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-xs text-stone-100">
            <span className="font-serif italic">Open Curatorial Essay</span>
            <span className="font-mono text-[10px] tracking-wider uppercase">Fig. 01</span>
          </div>
        </div>
      </div>
    </section>
  );
};
