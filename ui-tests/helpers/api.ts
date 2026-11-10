import { APIRequestContext } from '@playwright/test';
import type { NewArticle } from '../test-data/factory';

export const API_URL = process.env.API_URL || 'http://localhost:3100/api';

export type NewUser = { username: string; email: string; password: string };

export type CreatedArticle = { slug: string; title: string };

export type RegisteredUser = NewUser & { token: string };

/** Thin wrapper around the newsclip REST API, used to set up test state fast. */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async registerUser(user: NewUser): Promise<RegisteredUser> {
    const response = await this.request.post(`${API_URL}/users`, { data: { user } });
    if (!response.ok()) {
      throw new Error(`Register failed (${response.status()}): ${await response.text()}`);
    }
    const body = await response.json();
    return { ...user, token: body.user.token };
  }

  async login(email: string, password: string): Promise<string> {
    const response = await this.request.post(`${API_URL}/users/login`, {
      data: { user: { email, password } },
    });
    if (!response.ok()) {
      throw new Error(`Login failed (${response.status()}): ${await response.text()}`);
    }
    return (await response.json()).user.token;
  }

  async createArticle(token: string, article: NewArticle): Promise<CreatedArticle> {
    const response = await this.request.post(`${API_URL}/articles`, {
      data: { article },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok()) {
      throw new Error(`Create article failed (${response.status()}): ${await response.text()}`);
    }
    const { slug, title } = (await response.json()).article;
    return { slug, title };
  }

  async deleteArticle(token: string, slug: string): Promise<void> {
    const response = await this.request.delete(`${API_URL}/articles/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // 404 means it is already gone (e.g. the test deleted it itself), which is fine.
    if (!response.ok() && response.status() !== 404) {
      throw new Error(`Delete article failed (${response.status()}): ${await response.text()}`);
    }
  }

  /** True while the article is readable through the API (soft-deleted articles return 404). */
  async articleExists(slug: string): Promise<boolean> {
    const response = await this.request.get(`${API_URL}/articles/${slug}`);
    return response.ok();
  }

  async follow(token: string, username: string): Promise<void> {
    await this.send('POST', `/profiles/${username}/follow`, token);
  }

  async favorite(token: string, slug: string): Promise<void> {
    await this.send('POST', `/articles/${slug}/favorite`, token);
  }

  async addComment(token: string, slug: string, body: string): Promise<void> {
    await this.send('POST', `/articles/${slug}/comments`, token, { comment: { body } });
  }

  async getCurrentUser(token: string): Promise<{ username: string; email: string; bio: string | null }> {
    const response = await this.request.get(`${API_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok()) throw new Error(`Get user failed (${response.status()})`);
    return (await response.json()).user;
  }

  private async send(method: 'POST', path: string, token: string, data?: unknown): Promise<void> {
    const response = await this.request.fetch(`${API_URL}${path}`, {
      method,
      data,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok()) {
      throw new Error(`${method} ${path} failed (${response.status()}): ${await response.text()}`);
    }
  }
}
