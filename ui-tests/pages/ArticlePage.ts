import { Locator, Page } from '@playwright/test';

export class ArticlePage {
  readonly title: Locator;
  readonly content: Locator;
  // The author actions are rendered twice (banner and bottom of the page), so take the first.
  readonly editLink: Locator;
  readonly deleteButton: Locator;
  // Favorite/follow buttons are also rendered in the banner and at the bottom, so take the first.
  readonly favoriteButton: Locator;
  readonly followButton: Locator;
  readonly commentInput: Locator;
  readonly postCommentButton: Locator;
  readonly commentErrors: Locator;
  readonly comments: Locator;
  readonly commentDeleteIcons: Locator;
  readonly signInPrompt: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByRole('heading', { level: 1 });
    this.content = page.locator('.article-content');
    this.editLink = page.getByRole('link', { name: 'Edit Article' }).first();
    this.deleteButton = page.getByRole('button', { name: 'Delete Article' }).first();
    this.favoriteButton = page.getByRole('button', { name: /favorite article/i }).first();
    this.followButton = page.getByRole('button', { name: /follow \w/i }).first();
    this.commentInput = page.getByPlaceholder('Write a comment...');
    this.postCommentButton = page.getByRole('button', { name: 'Post Comment' });
    this.commentErrors = page.locator('.error-messages li');
    this.comments = page.locator('.card .card-text');
    this.commentDeleteIcons = page.locator('.mod-options .ion-trash-a');
    this.signInPrompt = page.getByText('to add comments on this article');
  }

  async goto(slug: string) {
    await this.page.goto(`/article/${slug}`);
  }
}
