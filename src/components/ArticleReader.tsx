import React, { useState, useEffect } from 'react';
import { Post, Comment } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ArrowLeft, Heart, MessageSquare, Share2, Eye, Check, Send, Sparkles } from 'lucide-react';

interface ArticleReaderProps {
  post: Post;
  onBack: () => void;
  onLike: (e: React.MouseEvent, post: Post) => void;
  onPostUpdated?: (updated: Post) => void;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  post,
  onBack,
  onLike,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [readingProgress, setReadingProgress] = useState(0);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Record view & load comments
  useEffect(() => {
    api.recordView(post._id).catch(() => {});
    api.getComments(post._id).then(setComments).catch(() => {});
  }, [post._id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await api.addComment(post._id, commentAuthor, commentContent);
      setComments([newComment, ...comments]);
      setCommentContent('');
      setCommentFeedback('Comment saved to MongoDB comments collection.');
      setTimeout(() => setCommentFeedback(null), 3000);
    } catch (err: any) {
      setCommentFeedback('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const fontSizeClasses = {
    sm: 'text-base leading-relaxed',
    base: 'text-lg leading-loose',
    lg: 'text-xl leading-[2]',
  }[fontSize];

  // Render markdown-like sections cleanly
  const paragraphs = post.content.split('\n\n');

  return (
    <article className="min-h-screen bg-[#FBF9F5] pb-24">
      {/* Sticky Reading Progress Rail */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-stone-200 z-30">
        <div
          className="h-full bg-amber-800 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-10">
        {/* Navigation & Reader Controls */}
        <div className="flex items-center justify-between gap-4 pb-8 mb-8 border-b border-stone-200">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-600 hover:text-stone-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Works</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Font Size Adjuster */}
            <div className="flex items-center border border-stone-300 rounded-md overflow-hidden text-xs font-mono">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  fontSize === 'sm' ? 'bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-600 hover:bg-stone-200'
                }`}
                title="Compact type size"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2.5 py-1 border-x border-stone-300 transition-colors cursor-pointer ${
                  fontSize === 'base' ? 'bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-600 hover:bg-stone-200'
                }`}
                title="Standard type size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  fontSize === 'lg' ? 'bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-600 hover:bg-stone-200'
                }`}
                title="Generous type size"
              >
                A+
              </button>
            </div>

            {/* Share / Copy URL */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md transition-colors cursor-pointer"
              title="Copy article link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Article Header & Typography */}
        <header className="space-y-6 max-w-3xl mx-auto mb-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500">
            <span className="font-semibold text-amber-900">{post.category}</span>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium text-stone-950 leading-[1.12] text-balance">
            {post.title}
          </h1>

          <p className="text-xl sm:text-2xl font-serif italic text-stone-600 leading-relaxed font-light">
            {post.excerpt}
          </p>

          {/* Author Byline */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-200 text-stone-600">
            <div className="flex items-center gap-3">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border border-stone-300"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-stone-300 flex items-center justify-center font-serif text-stone-800 font-semibold text-base">
                  {post.author.name[0]}
                </div>
              )}
              <div>
                <span className="font-medium text-stone-900 block text-sm">{post.author.name}</span>
                <span className="text-xs text-stone-500">{post.author.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-stone-500">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.views}</span>
              </span>
              <button
                onClick={(e) => onLike(e, post)}
                className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer text-stone-600"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{post.likes}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Lead Artwork Plate */}
        {post.coverImage && (
          <div className="my-10">
            <div className="rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm aspect-[16/9] sm:aspect-[21/9]">
              <img
                src={post.coverImage}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center text-xs font-serif italic text-stone-500 mt-2.5">
              Plate 01 — {post.title}. Monograph archival record.
            </p>
          </div>
        )}

        {/* Long-form Article Reading Canvas */}
        <div className={`max-w-2xl mx-auto text-stone-800 font-serif ${fontSizeClasses} space-y-6 pt-4`}>
          {paragraphs.map((para, idx) => {
            // Drop cap on first paragraph
            const isFirst = idx === 0;

            // Header markdown ## or ###
            if (para.startsWith('### ')) {
              return (
                <h3
                  key={idx}
                  className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 pt-6 pb-2 border-b border-stone-200"
                >
                  {para.replace('### ', '')}
                </h3>
              );
            }
            if (para.startsWith('## ')) {
              return (
                <h2
                  key={idx}
                  className="text-3xl sm:text-4xl font-serif font-medium text-stone-900 pt-8 pb-3 border-b border-stone-200"
                >
                  {para.replace('## ', '')}
                </h2>
              );
            }

            // Pull Quote markdown >
            if (para.startsWith('> ')) {
              return (
                <blockquote
                  key={idx}
                  className="my-8 py-6 px-4 text-center font-serif italic text-xl sm:text-2xl text-stone-900 border-y border-stone-300"
                >
                  {para.replace('> ', '').replace(/^"|"$/g, '')}
                </blockquote>
              );
            }

            return (
              <p
                key={idx}
                className={
                  isFirst
                    ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-stone-950'
                    : ''
                }
              >
                {para}
              </p>
            );
          })}
        </div>

        {/* Tags Line */}
        {post.tags && post.tags.length > 0 && (
          <div className="max-w-2xl mx-auto pt-10 mt-10 border-t border-stone-200 flex flex-wrap items-center gap-2 text-xs font-mono text-stone-500">
            <span className="uppercase tracking-widest text-stone-400">Index Terms:</span>
            {post.tags.map((tag, i) => (
              <React.Fragment key={tag}>
                <span className="text-stone-700">{tag}</span>
                {i < post.tags.length - 1 && <span aria-hidden="true">·</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Reader Engagement Footer */}
        <div className="max-w-2xl mx-auto my-12 p-6 rounded-xl bg-stone-100/70 border border-stone-200 flex items-center justify-between gap-4">
          <div>
            <h4 className="font-serif font-medium text-stone-900 text-base">Enjoyed this monograph?</h4>
            <p className="text-xs text-stone-500 mt-0.5">Register appreciation or leave a critical reflection below.</p>
          </div>
          <button
            onClick={(e) => onLike(e, post)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-100 hover:bg-stone-800 rounded-lg text-xs font-medium transition-all active:scale-95 cursor-pointer"
          >
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>Appreciate ({post.likes})</span>
          </button>
        </div>

        {/* Comments Section */}
        <section className="max-w-2xl mx-auto pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-stone-700" />
              <h3 className="font-serif text-2xl font-medium text-stone-900">
                Responses &amp; Annotations
              </h3>
            </div>
            <span className="font-mono text-xs tabular-nums text-stone-500">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4 mb-10">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Contribute to the Archive</span>
            </div>

            <div>
              <input
                type="text"
                placeholder="Your name or initials (optional)"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
              />
            </div>

            <div>
              <textarea
                rows={3}
                placeholder="Share your perspective, critique, or historical reference..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              {commentFeedback ? (
                <span className="text-xs text-amber-900 font-mono">{commentFeedback}</span>
              ) : (
                <span className="text-[11px] text-stone-400 font-mono">Persists to MongoDB collection: comments</span>
              )}

              <button
                type="submit"
                disabled={submittingComment || !commentContent.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-100 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingComment ? 'Writing...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-stone-200 rounded-xl text-stone-400 font-serif italic text-sm">
                No annotations on this monograph yet. Be the first to add your perspective.
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium text-stone-800">{comment.authorName}</span>
                    <span className="font-mono tabular-nums">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed font-sans">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </article>
  );
};
