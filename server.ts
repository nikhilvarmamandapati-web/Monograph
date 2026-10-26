import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './server/db.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

// -------------------------------------------------------------
// REST API ROUTES (Node.js + MongoDB backend)
// -------------------------------------------------------------

// Platform and Database Analytics
app.get('/api/stats', async (_req: Request, res: Response) => {
  try {
    const overview = await db.getDatabaseOverview();
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Database Management & MongoDB Connection
app.get('/api/db/status', (_req: Request, res: Response) => {
  res.json(db.getStatus());
});

app.post('/api/db/connect', async (req: Request, res: Response) => {
  try {
    const { uri } = req.body;
    const result = await db.initMongo(uri);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/db/reset', async (_req: Request, res: Response) => {
  try {
    const result = await db.resetToSeed();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/db/export', async (_req: Request, res: Response) => {
  try {
    const overview = await db.getDatabaseOverview();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=monograph_mongodb_export.json');
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Categories
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Posts
app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const tag = req.query.tag as string | undefined;
    const search = req.query.search as string | undefined;
    const featured = req.query.featured !== undefined ? req.query.featured === 'true' : undefined;

    const posts = await db.getPosts({ category, tag, search, featured });
    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/posts/:slugOrId', async (req: Request, res: Response) => {
  try {
    const post = await db.getPostBySlugOrId(req.params.slugOrId);
    if (!post) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(post);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, category, tags, coverImage, author, featured } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required to publish.' });
    }
    const newPost = await db.createPost({
      title,
      content,
      excerpt,
      category,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
      coverImage,
      author,
      featured: Boolean(featured)
    });
    res.status(201).json(newPost);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updatePost(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await db.deletePost(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ success: true, message: 'Article removed from database.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/like', async (req: Request, res: Response) => {
  try {
    const likes = await db.toggleLikePost(req.params.id);
    res.json({ likes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/view', async (req: Request, res: Response) => {
  try {
    const views = await db.incrementPostView(req.params.id);
    res.json({ views });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Comments
app.get('/api/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const comments = await db.getComments(req.params.id);
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const { authorName, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment body cannot be empty.' });
    }
    const comment = await db.addComment(req.params.id, authorName || 'Anonymous Reader', content);
    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Drafts
app.get('/api/drafts', async (_req: Request, res: Response) => {
  try {
    const drafts = await db.getDrafts();
    res.json(drafts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drafts', async (req: Request, res: Response) => {
  try {
    const draft = await db.saveDraft(req.body);
    res.json(draft);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/drafts/:id', async (req: Request, res: Response) => {
  try {
    const success = await db.deleteDraft(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC ASSETS HOSTING
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    await db.initMongo();
    console.log(`[Monograph] Express & MongoDB server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('[Monograph] Startup failure:', err);
  process.exit(1);
});
