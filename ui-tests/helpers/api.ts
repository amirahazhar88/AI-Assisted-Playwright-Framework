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
}
