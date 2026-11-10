import { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly globalFeedTab: Locator;
  readonly previewTitles: Locator;
  readonly emptyMessage: Locator;
  readonly yourFeedEmptyMessage: Locator;

  constructor(private readonly page: Page) {
    this.globalFeedTab = page.getByRole('link', { name: 'Global Feed' });
    this.previewTitles = page.locator('.article-preview h1');
    this.emptyMessage = page.getByText('No articles are here... yet.');
    this.yourFeedEmptyMessage = page.locator('.empty-feed-message');
  }

  async goto() {
    await this.page.goto('/');
  }

  /** "Your Feed": articles from authors the signed-in user follows. */
  async gotoFollowingFeed() {
    await this.page.goto('/?feed=following');
  }

  /** The feed filtered by one tag (same list component as the home page). */
  async gotoTag(tag: string) {
    await this.page.goto(`/tag/${tag}`);
  }

  pageButton(pageNumber: number): Locator {
    return this.page.locator(`[data-test="page-link-${pageNumber}"] button`);
  }
}
