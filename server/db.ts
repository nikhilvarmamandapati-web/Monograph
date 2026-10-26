import fs from 'fs';
import path from 'path';
import { MongoClient, Db, ObjectId } from 'mongodb';

export interface Author {
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: Author;
  category: string;
  tags: string[];
  readTime: string;
  published: boolean;
  featured: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Draft {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage: string;
  updatedAt: string;
}

export interface DatabaseState {
  posts: Post[];
  comments: Comment[];
  drafts: Draft[];
  categories: { _id: string; name: string; slug: string; description: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'monograph_db.json');

const INITIAL_CATEGORIES = [
  { _id: 'cat_arch', name: 'Architecture', slug: 'architecture', description: 'Spatial investigations, materials, and built forms.' },
  { _id: 'cat_typo', name: 'Typography', slug: 'typography', description: 'The craft of letterforms, history of print, and layout systems.' },
  { _id: 'cat_essay', name: 'Essays', slug: 'essays', description: 'Long-form cultural critique, reflections, and creative non-fiction.' },
  { _id: 'cat_design', name: 'Design Philosophy', slug: 'design-philosophy', description: 'First principles, ethical tools, and industrial craft.' },
  { _id: 'cat_lit', name: 'Literature', slug: 'literature', description: 'Critical annotations, literary dialogues, and author archives.' },
];

const INITIAL_POSTS: Post[] = [
  {
    _id: '661fa109a12c8b001ef00001',
    title: 'The Architecture of Light: Dialogues Between Void and Solid',
    slug: 'the-architecture-of-light',
    excerpt: 'How contemporary monolithic spaces use natural illumination not as decoration, but as an active structural boundary defining human perception.',
    content: `During the mid-century transition, light became recognized not merely as an illuminant, but as an active structural element defining volumetric boundaries.

When natural daylight pierces raw limestone or board-formed concrete, it ceases to be ambient background. Instead, it becomes an unyielding material with weight, direction, and temper. In monastic architecture, the aperture was never about gazing outward; it was a calibrated instrument for metering the passage of hours across quiet surfaces.

### The Monolith as an Instrument

Consider the dialogue between the void and the solid. In traditional post-and-lintel construction, shadows are incidental artifacts of structural necessity. In contemporary monolithic forms, however, the void is excavated intentionally. The architect determines where the sun's trajectory will sculpt sharp diagonal planes against chalky textured stone.

> "A room is not a room without natural light. Natural light gives the time of day and the mood of the seasons to enter."

In our recent documentation of Mediterranean sanctuaries, we observed how the thickness of stone walls—often exceeding eighty centimeters—creates a profound thermal and optical threshold. The glare of the noon sun is softened as it reflects through deep embrasures, yielding an interior temperature and luminous quality entirely distinct from the exterior world.

### Materiality and Texture

Texture plays an indispensable role. A polished surface repels light with sterile certainty; a textured limestone wall absorbs and scatters it, creating micro-gradients that reveal the hand of the mason. These micro-shadows ground the eye, granting the inhabitant a sense of permanence in an era dominated by transient digital interfaces.`,
    coverImage: '/src/assets/images/hero_editorial_journal_1792911456184.jpg',
    author: {
      name: 'Elena Rostova',
      role: 'Curatorial Director',
      bio: 'Architectural theorist and essayist focusing on Mediterranean vernacular forms and light studies.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
    },
    category: 'Architecture',
    tags: ['Architecture', 'Light', 'Monographs', 'Spatial Theory'],
    readTime: '6 min read',
    published: true,
    featured: true,
    views: 1420,
    likes: 89,
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-20T14:30:00.000Z'
  },
  {
    _id: '661fa109a12c8b001ef00002',
    title: 'The Tactile Weight of Letterpress: Craft in an Ephemeral Era',
    slug: 'the-tactile-weight-of-letterpress',
    excerpt: 'An investigation into lead sorts, linseed ink, and why physical impressions resist the flattening tendencies of algorithmic reading.',
    content: `Hold a piece of damp cotton rag paper against the light after it has passed beneath the iron bed of a proof press. Run your fingertips across the reverse side: you can feel the embossed bite of sixty-point Caslon metal types.

In the digital realm, typography is weightless. Pixels light up and disappear with no memory of resistance. In letterpress printing, however, every letterform is a physical ingot of lead, tin, and antimony. It has gravity, cost, and physical limitation.

### The Constraint of the Job Case

Before a compositor could set a single sentence, they had to reckon with the contents of the California job case. If you ran out of lowercase 'e' sorts, you either rewrote the sentence or cast new type. This physical friction enforced an economy of expression and typographic discipline that modern fluid editors rarely demand.

The physical pressure required to transfer ink from metal to cellulose creates a tactile deboss—what early printers considered a technical defect, but what we now revere as a testament of human handwork.

### Ink, Oil, and Time

Printers' ink is not a dye; it is a rich dispersion of carbon black pigment in boiled linseed oil. It possesses a distinct linseed smell that lingers on printed leaves for decades. As we examine archival specimens from the 1920s, the fidelity of the type retains an optical richness unmatched by screen phosphors.`,
    coverImage: '/src/assets/images/article_typography_craft_1792911483355.jpg',
    author: {
      name: 'Julian Mercer',
      role: 'Master Typographer',
      bio: 'Foundry historian and printer exploring typographic revivals and book arts.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'
    },
    category: 'Typography',
    tags: ['Typography', 'Craft', 'Print', 'Design History'],
    readTime: '4 min read',
    published: true,
    featured: false,
    views: 840,
    likes: 64,
    createdAt: '2026-10-21T09:15:00.000Z',
    updatedAt: '2026-10-21T09:15:00.000Z'
  },
  {
    _id: '661fa109a12c8b001ef00003',
    title: 'Shadow as Structure: Brutalism and Mediterranean Monasticism',
    slug: 'shadow-as-structure',
    excerpt: 'Uncovering the spiritual geometry and structural honesty that connect austere cloisters to twentieth-century civic concrete.',
    content: `When Le Corbusier visited the Charterhouse of Ema in Tuscany in 1907, he discovered what he later called the archetype of modern human habitation: an individual cell of contemplation paired with a silent collective courtyard.

Decades later at Sainte Marie de La Tourette, that Mediterranean monastic spatial logic was retranslated into cast concrete. 

### Honest Concrete and Raw Formwork

Board-marked concrete bears the grain, knots, and imperfections of the timber formwork that held it during curing. It makes no attempt to pretend to be marble or dressed ashlar stone. It is monumental yet unadorned.

In warm climates, deep recessed loggias and brise-soleil slats cut the piercing Mediterranean sun, transforming thermal mass into natural refrigeration while creating deep, velvety shadows that anchor the human gaze.`,
    coverImage: '/src/assets/images/article_architecture_light_1792911469903.jpg',
    author: {
      name: 'Elena Rostova',
      role: 'Curatorial Director',
      bio: 'Architectural theorist and essayist focusing on Mediterranean vernacular forms and light studies.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
    },
    category: 'Architecture',
    tags: ['Architecture', 'Brutalism', 'Concrete', 'Monasticism'],
    readTime: '5 min read',
    published: true,
    featured: false,
    views: 615,
    likes: 42,
    createdAt: '2026-10-22T14:45:00.000Z',
    updatedAt: '2026-10-22T14:45:00.000Z'
  },
  {
    _id: '661fa109a12c8b001ef00004',
    title: "The Ritual of Solitude: Notes from a Writer's Morning Table",
    slug: 'the-ritual-of-solitude',
    excerpt: 'On the sacred threshold between dawn and the first sentence: why physical instruments and quiet habits sustain the thinking mind.',
    content: `Before the noise of the household begins, the room belongs solely to early daylight and steam rising from a heavy ceramic cup.

The desk is walnut, scarred by decades of brass fountain pen nibs and coffee rings. Writing is not merely an intellectual exertion; it is a somatic practice. The drag of ink upon cotton paper slows down impulsive syntax, forcing an author to weigh words before they are committed to the sheet.

### The Threshold Hour

Between five and seven in the morning, the critical faculty that polices creativity is still partially dormant. Sentences flow with an honesty rarely granted under the glare of mid-afternoon screens. 

To create a consistent body of work, one does not require heroic bursts of inspiration. One requires an uncompromised desk, an uninterrupted window of morning stillness, and the humility to sit until the prose finds its rhythm.`,
    coverImage: '/src/assets/images/article_creative_workspace_1792911497057.jpg',
    author: {
      name: 'Arthur Sterling',
      role: 'Senior Columnist',
      bio: 'Author of essays on literature, mindfulness, and creative solitude.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80'
    },
    category: 'Essays',
    tags: ['Essays', 'Writing', 'Ritual', 'Literature'],
    readTime: '7 min read',
    published: true,
    featured: false,
    views: 1105,
    likes: 97,
    createdAt: '2026-10-23T06:30:00.000Z',
    updatedAt: '2026-10-23T06:30:00.000Z'
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    _id: '661fa209a12c8b001ef00010',
    postId: '661fa109a12c8b001ef00001',
    authorName: 'Marcus Vance',
    content: 'The observation about the 80cm stone wall acting as an optical threshold is remarkable. In modern glass curtain walls, we have lost that sense of sanctuary.',
    createdAt: '2026-10-19T11:20:00.000Z',
    likes: 12
  },
  {
    _id: '661fa209a12c8b001ef00011',
    postId: '661fa109a12c8b001ef00001',
    authorName: 'Clara Lindqvist',
    content: 'Reminds me strongly of Carlo Scarpa’s work at the Castelvecchio in Verona. Light carving stone instead of merely lighting it.',
    createdAt: '2026-10-19T14:45:00.000Z',
    likes: 8
  },
  {
    _id: '661fa209a12c8b001ef00012',
    postId: '661fa109a12c8b001ef00002',
    authorName: 'Tobias Rowe',
    content: 'The limitation of the job case is precisely why classic book design felt so unified. The friction shaped the form.',
    createdAt: '2026-10-21T18:10:00.000Z',
    likes: 5
  }
];

class DatabaseManager {
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;
  private isConnectedToMongo: boolean = false;
  private currentUri: string = '';
  private memoryData: DatabaseState;

  constructor() {
    this.memoryData = this.loadLocalFile();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadLocalFile(): DatabaseState {
    this.ensureDirectoryExists();
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('[DB] Error parsing local data file, restoring initial state', err);
      }
    }

    const initial: DatabaseState = {
      posts: INITIAL_POSTS,
      comments: INITIAL_COMMENTS,
      drafts: [],
      categories: INITIAL_CATEGORIES
    };

    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Error writing initial local data file', e);
    }
    return initial;
  }

  private persistLocalFile() {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save local database file', err);
    }
  }

  public async initMongo(uri?: string): Promise<{ success: boolean; message: string; mode: string }> {
    const targetUri = uri || process.env.MONGODB_URI;
    if (!targetUri) {
      return {
        success: true,
        message: 'Running on high-performance local persistent document database (MongoDB BSON compatible).',
        mode: 'local-document-db'
      };
    }

    try {
      if (this.mongoClient) {
        await this.mongoClient.close();
      }
      this.mongoClient = new MongoClient(targetUri, { serverSelectionTimeoutMS: 5000 });
      await this.mongoClient.connect();
      this.mongoDb = this.mongoClient.db('monograph_blog');
      this.isConnectedToMongo = true;
      this.currentUri = targetUri;

      // Ensure collections exist & sync seed if empty
      const postsCount = await this.mongoDb.collection('posts').countDocuments();
      if (postsCount === 0) {
        if (this.memoryData.posts.length > 0) {
          await this.mongoDb.collection('posts').insertMany(this.memoryData.posts as any);
        }
        if (this.memoryData.categories.length > 0) {
          await this.mongoDb.collection('categories').insertMany(this.memoryData.categories as any);
        }
        if (this.memoryData.comments.length > 0) {
          await this.mongoDb.collection('comments').insertMany(this.memoryData.comments as any);
        }
      }

      console.log('[DB] Connected to MongoDB Atlas/Instance successfully.');
      return {
        success: true,
        message: 'Successfully connected to MongoDB database.',
        mode: 'mongodb-atlas'
      };
    } catch (err: any) {
      console.warn('[DB] MongoDB connection failed or URI unreachable:', err.message);
      this.isConnectedToMongo = false;
      this.mongoDb = null;
      return {
        success: false,
        message: `Failed to connect to MongoDB: ${err.message}. Seamlessly using local persistent document storage.`,
        mode: 'local-document-db'
      };
    }
  }

  public getStatus() {
    return {
      connected: this.isConnectedToMongo,
      mode: this.isConnectedToMongo ? 'MongoDB Atlas / Native Driver' : 'Embedded MongoDB-Compatible Document Engine',
      database: 'monograph_blog',
      uriConfigured: Boolean(this.currentUri || process.env.MONGODB_URI),
      counts: {
        posts: this.memoryData.posts.length,
        comments: this.memoryData.comments.length,
        drafts: this.memoryData.drafts.length,
        categories: this.memoryData.categories.length
      }
    };
  }

  // POSTS
  public async getPosts(filter: { category?: string; tag?: string; search?: string; featured?: boolean } = {}): Promise<Post[]> {
    if (this.isConnectedToMongo && this.mongoDb) {
      const query: any = { published: true };
      if (filter.category && filter.category !== 'All') {
        query.category = { $regex: new RegExp(`^${filter.category}$`, 'i') };
      }
      if (filter.tag) {
        query.tags = filter.tag;
      }
      if (filter.featured !== undefined) {
        query.featured = filter.featured;
      }
      if (filter.search) {
        query.$or = [
          { title: { $regex: filter.search, $options: 'i' } },
          { excerpt: { $regex: filter.search, $options: 'i' } },
          { content: { $regex: filter.search, $options: 'i' } }
        ];
      }
      const docs = await this.mongoDb.collection('posts').find(query).sort({ createdAt: -1 }).toArray();
      return docs.map(d => ({ ...d, _id: d._id.toString() } as unknown as Post));
    }

    let results = this.memoryData.posts.filter(p => p.published);
    if (filter.category && filter.category !== 'All') {
      results = results.filter(p => p.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter.tag) {
      results = results.filter(p => p.tags.some(t => t.toLowerCase() === filter.tag!.toLowerCase()));
    }
    if (filter.featured !== undefined) {
      results = results.filter(p => p.featured === filter.featured);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getPostBySlugOrId(identifier: string): Promise<Post | null> {
    if (this.isConnectedToMongo && this.mongoDb) {
      let query: any = { slug: identifier };
      if (ObjectId.isValid(identifier)) {
        query = { $or: [{ slug: identifier }, { _id: new ObjectId(identifier) }] };
      }
      const post = await this.mongoDb.collection('posts').findOne(query);
      if (!post) return null;
      return { ...post, _id: post._id.toString() } as unknown as Post;
    }

    const post = this.memoryData.posts.find(p => p.slug === identifier || p._id === identifier);
    return post || null;
  }

  public async createPost(data: Partial<Post>): Promise<Post> {
    const slug = (data.title || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    const now = new Date().toISOString();
    const wordCount = (data.content || '').split(/\s+/).length;
    const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const newPost: Post = {
      _id: new ObjectId().toHexString(),
      title: data.title || 'Untitled Monograph',
      slug: data.slug || slug,
      excerpt: data.excerpt || (data.content ? data.content.slice(0, 160) + '...' : ''),
      content: data.content || '',
      coverImage: data.coverImage || '/src/assets/images/hero_editorial_journal_1792911456184.jpg',
      author: data.author || {
        name: 'Elena Rostova',
        role: 'Contributing Editor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
      },
      category: data.category || 'Architecture',
      tags: data.tags || ['Editorial'],
      readTime: data.readTime || `${readMinutes} min read`,
      published: data.published !== false,
      featured: Boolean(data.featured),
      views: 1,
      likes: 0,
      createdAt: now,
      updatedAt: now
    };

    if (this.isConnectedToMongo && this.mongoDb) {
      await this.mongoDb.collection('posts').insertOne({ ...newPost, _id: new ObjectId(newPost._id) } as any);
    }

    this.memoryData.posts.unshift(newPost);
    this.persistLocalFile();
    return newPost;
  }

  public async updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
    const now = new Date().toISOString();
    if (this.isConnectedToMongo && this.mongoDb && ObjectId.isValid(id)) {
      await this.mongoDb.collection('posts').updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: now } }
      );
      return this.getPostBySlugOrId(id);
    }

    const idx = this.memoryData.posts.findIndex(p => p._id === id);
    if (idx === -1) return null;
    this.memoryData.posts[idx] = {
      ...this.memoryData.posts[idx],
      ...updates,
      updatedAt: now
    };
    this.persistLocalFile();
    return this.memoryData.posts[idx];
  }

  public async deletePost(id: string): Promise<boolean> {
    if (this.isConnectedToMongo && this.mongoDb && ObjectId.isValid(id)) {
      await this.mongoDb.collection('posts').deleteOne({ _id: new ObjectId(id) });
      await this.mongoDb.collection('comments').deleteMany({ postId: id });
    }

    const before = this.memoryData.posts.length;
    this.memoryData.posts = this.memoryData.posts.filter(p => p._id !== id);
    this.memoryData.comments = this.memoryData.comments.filter(c => c.postId !== id);
    this.persistLocalFile();
    return this.memoryData.posts.length < before;
  }

  public async incrementPostView(id: string): Promise<number> {
    if (this.isConnectedToMongo && this.mongoDb && ObjectId.isValid(id)) {
      await this.mongoDb.collection('posts').updateOne({ _id: new ObjectId(id) }, { $inc: { views: 1 } });
    }
    const post = this.memoryData.posts.find(p => p._id === id || p.slug === id);
    if (post) {
      post.views = (post.views || 0) + 1;
      this.persistLocalFile();
      return post.views;
    }
    return 0;
  }

  public async toggleLikePost(id: string): Promise<number> {
    if (this.isConnectedToMongo && this.mongoDb && ObjectId.isValid(id)) {
      await this.mongoDb.collection('posts').updateOne({ _id: new ObjectId(id) }, { $inc: { likes: 1 } });
    }
    const post = this.memoryData.posts.find(p => p._id === id || p.slug === id);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      this.persistLocalFile();
      return post.likes;
    }
    return 0;
  }

  // COMMENTS
  public async getComments(postId: string): Promise<Comment[]> {
    if (this.isConnectedToMongo && this.mongoDb) {
      const comments = await this.mongoDb.collection('comments').find({ postId }).sort({ createdAt: -1 }).toArray();
      return comments.map(c => ({ ...c, _id: c._id.toString() } as unknown as Comment));
    }
    return this.memoryData.comments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async addComment(postId: string, authorName: string, content: string): Promise<Comment> {
    const comment: Comment = {
      _id: new ObjectId().toHexString(),
      postId,
      authorName: authorName.trim() || 'Anonymous Reader',
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0
    };

    if (this.isConnectedToMongo && this.mongoDb) {
      await this.mongoDb.collection('comments').insertOne({ ...comment, _id: new ObjectId(comment._id) } as any);
    }
    this.memoryData.comments.push(comment);
    this.persistLocalFile();
    return comment;
  }

  // DRAFTS
  public async getDrafts(): Promise<Draft[]> {
    return this.memoryData.drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public async saveDraft(draft: Partial<Draft>): Promise<Draft> {
    const now = new Date().toISOString();
    if (draft._id) {
      const idx = this.memoryData.drafts.findIndex(d => d._id === draft._id);
      if (idx !== -1) {
        this.memoryData.drafts[idx] = {
          ...this.memoryData.drafts[idx],
          ...draft,
          updatedAt: now
        } as Draft;
        this.persistLocalFile();
        return this.memoryData.drafts[idx];
      }
    }

    const newDraft: Draft = {
      _id: new ObjectId().toHexString(),
      title: draft.title || '',
      content: draft.content || '',
      excerpt: draft.excerpt || '',
      category: draft.category || 'Architecture',
      tags: draft.tags || [],
      coverImage: draft.coverImage || '',
      updatedAt: now
    };
    this.memoryData.drafts.unshift(newDraft);
    this.persistLocalFile();
    return newDraft;
  }

  public async deleteDraft(id: string): Promise<boolean> {
    const before = this.memoryData.drafts.length;
    this.memoryData.drafts = this.memoryData.drafts.filter(d => d._id !== id);
    this.persistLocalFile();
    return this.memoryData.drafts.length < before;
  }

  // CATEGORIES & STATS
  public async getCategories() {
    const counts: Record<string, number> = {};
    for (const post of this.memoryData.posts) {
      if (post.published) {
        counts[post.category] = (counts[post.category] || 0) + 1;
      }
    }
    return this.memoryData.categories.map(c => ({
      ...c,
      count: counts[c.name] || 0
    }));
  }

  public async getDatabaseOverview() {
    const totalViews = this.memoryData.posts.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalLikes = this.memoryData.posts.reduce((acc, p) => acc + (p.likes || 0), 0);
    return {
      status: this.getStatus(),
      collections: [
        { name: 'posts', documentCount: this.memoryData.posts.length, sampleFields: ['_id', 'title', 'slug', 'excerpt', 'content', 'coverImage', 'author', 'category', 'tags', 'views', 'likes', 'createdAt'] },
        { name: 'comments', documentCount: this.memoryData.comments.length, sampleFields: ['_id', 'postId', 'authorName', 'content', 'createdAt', 'likes'] },
        { name: 'drafts', documentCount: this.memoryData.drafts.length, sampleFields: ['_id', 'title', 'content', 'excerpt', 'category', 'tags', 'updatedAt'] },
        { name: 'categories', documentCount: this.memoryData.categories.length, sampleFields: ['_id', 'name', 'slug', 'description'] }
      ],
      metrics: {
        totalArticles: this.memoryData.posts.length,
        totalViews,
        totalLikes,
        totalComments: this.memoryData.comments.length,
        totalDrafts: this.memoryData.drafts.length
      }
    };
  }

  public async resetToSeed() {
    this.memoryData = {
      posts: JSON.parse(JSON.stringify(INITIAL_POSTS)),
      comments: JSON.parse(JSON.stringify(INITIAL_COMMENTS)),
      drafts: [],
      categories: JSON.parse(JSON.stringify(INITIAL_CATEGORIES))
    };
    this.persistLocalFile();
    return { success: true, message: 'Database reset to canonical editorial archive seed.' };
  }
}

export const db = new DatabaseManager();
