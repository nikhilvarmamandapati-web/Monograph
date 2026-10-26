import React, { useState } from 'react';
import { Post } from '../types/index.ts';
import { Eye, Heart, Trash2 } from 'lucide-react';

interface ArticleCardProps {
  post: Post;
  onRead: (post: Post) => void;
  onLike: (e: React.MouseEvent, post: Post) => void;
  onDelete?: (e: React.MouseEvent, post: Post) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  onRead,
  onLike,
  onDelete,
}) => {
  const [imageError, setImageError] = useState(false);

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      onClick={() => onRead(post)}
      className="group flex flex-col justify-between bg-stone-50/50 hover:bg-stone-50 border border-stone-200/80 hover:border-stone-300 rounded-xl overflow-hidden transition-all duration-300 p-5 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
    >
      <div className="space-y-4">
        {/* Visual Cover Frame */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
          {!imageError ? (
            <img
              src={post.coverImage}
              alt={post.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full bg-stone-200 flex flex-col items-center justify-center p-4 text-center">
              <span className="font-serif italic text-sm text-stone-700">{post.title}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mt-1">Monograph Plate</span>
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-stone-900/80 backdrop-blur-xs text-[10px] font-mono uppercase tracking-wider text-stone-200 rounded">
            {post.category}
          </div>
        </div>

        {/* Unboxed Metadata Line */}
        <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
          <span>{formattedDate}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readTime}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-serif font-medium text-stone-900 group-hover:text-amber-950 transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm text-stone-600 font-sans line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
      </div>

      {/* Footer Info: Author & Metrics */}
      <div className="pt-4 mt-4 border-t border-stone-200 flex items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex items-center gap-2 min-w-0">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover shrink-0 border border-stone-200"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-serif text-stone-700 font-bold shrink-0">
              {post.author.name[0]}
            </div>
          )}
          <span className="truncate font-medium text-stone-800">{post.author.name}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums text-xs">
          <span className="flex items-center gap-1 text-stone-400">
            <Eye className="w-3 h-3" />
            <span>{post.views}</span>
          </span>

          <button
            onClick={(e) => onLike(e, post)}
            className="flex items-center gap-1 text-stone-500 hover:text-rose-600 transition-colors p-1"
            title="Like this article"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{post.likes}</span>
          </button>

          {onDelete && (
            <button
              onClick={(e) => onDelete(e, post)}
              className="text-stone-400 hover:text-stone-700 p-1 transition-colors"
              title="Remove article"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
