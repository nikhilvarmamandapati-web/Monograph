import { Post, Comment, Draft, Category, DatabaseOverview, DatabaseStatus } from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Posts
  async getPosts(params?: { category?: string; tag?: string; search?: string; featured?: boolean }): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.search) query.set('search', params.search);
    if (params?.featured !== undefined) query.set('featured', String(params.featured));

    const res = await fetch(`${API_BASE}/posts?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async getPost(slugOrId: string): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${slugOrId}`);
    if (!res.ok) throw new Error('Article not found');
    return res.json();
  },

  async createPost(postData: Partial<Post>): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to publish article');
    }
    return res.json();
  },

  async updatePost(id: string, postData: Partial<Post>): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error('Failed to update article');
    return res.json();
  },

  async deletePost(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  async likePost(id: string): Promise<{ likes: number }> {
    const res = await fetch(`${API_BASE}/posts/${id}/like`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to register appreciation');
    return res.json();
  },

  async recordView(id: string): Promise<{ views: number }> {
    const res = await fetch(`${API_BASE}/posts/${id}/view`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to record view');
    return res.json();
  },

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
    if (!res.ok) throw new Error('Failed to load comments');
    return res.json();
  },

  async addComment(postId: string, authorName: string, content: string): Promise<Comment> {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, content }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit comment');
    }
    return res.json();
  },

  // Categories & Stats
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getDatabaseOverview(): Promise<DatabaseOverview> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch database overview');
    return res.json();
  },

  async getDatabaseStatus(): Promise<DatabaseStatus> {
    const res = await fetch(`${API_BASE}/db/status`);
    if (!res.ok) throw new Error('Failed to fetch database status');
    return res.json();
  },

  async connectMongo(uri: string): Promise<{ success: boolean; message: string; mode: string }> {
    const res = await fetch(`${API_BASE}/db/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });
    return res.json();
  },

  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/db/reset`, {
      method: 'POST',
    });
    return res.json();
  },

  // Drafts
  async getDrafts(): Promise<Draft[]> {
    const res = await fetch(`${API_BASE}/drafts`);
    if (!res.ok) throw new Error('Failed to fetch drafts');
    return res.json();
  },

  async saveDraft(draft: Partial<Draft>): Promise<Draft> {
    const res = await fetch(`${API_BASE}/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (!res.ok) throw new Error('Failed to save draft');
    return res.json();
  },

  async deleteDraft(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/drafts/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },
};
