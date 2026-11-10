import { NewUser } from '../helpers/api';

export type NewArticle = {
  title: string;
  description: string;
  body: string;
  tagList: string[];
};

/** Short unique suffix so parallel tests and repeated runs never collide. */
function uniqueId(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
}

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  const username = overrides.username ?? `qa_${uniqueId()}`;
  return {
    username,
    email: `${username}@example.com`,
    password: 'Passw0rd!123',
    ...overrides,
  };
}

/** The API derives the article slug from the title, so the title must be unique. */
export function buildArticle(overrides: Partial<NewArticle> = {}): NewArticle {
  return {
    title: `QA article ${uniqueId()}`,
    description: 'Created by an automated test',
    body: 'Body text for an automated test article.',
    tagList: [],
    ...overrides,
  };
}

/** A unique tag, handy for isolating a test's articles in a tag-filtered feed. */
export function buildTag(): string {
  return `t${uniqueId().replace('_', '')}`;
}

export function buildComment(): string {
  return `QA comment ${uniqueId()}`;
}
