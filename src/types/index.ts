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

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface DatabaseStatus {
  connected: boolean;
  mode: string;
  database: string;
  uriConfigured: boolean;
  counts: {
    posts: number;
    comments: number;
    drafts: number;
    categories: number;
  };
}

export interface DatabaseOverview {
  status: DatabaseStatus;
  collections: {
    name: string;
    documentCount: number;
    sampleFields: string[];
  }[];
  metrics: {
    totalArticles: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalDrafts: number;
  };
}
