import { Locator, Page } from '@playwright/test';

export class ArticlePage {
  readonly title: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByRole('heading', { level: 1 });
  }

  async goto(slug: string) {
    await this.page.goto(`/article/${slug}`);
  }
}
