import { Locator, Page } from '@playwright/test';
import type { NewArticle } from '../test-data/factory';

export class EditorPage {
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagInput: Locator;
  readonly publishButton: Locator;
  readonly errorMessages: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.getByPlaceholder('Article Title');
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder('Write your article (in markdown)');
    this.tagInput = page.getByPlaceholder('Enter tags');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
    this.errorMessages = page.locator('.error-messages li');
  }

  /** Open the editor: blank for a new article, or pre-filled when a slug is given. */
  async goto(slug?: string) {
    await this.page.goto(slug ? `/editor/${slug}` : '/editor');
  }

  async fillAndPublish(article: Partial<NewArticle>) {
    if (article.title !== undefined) await this.titleInput.fill(article.title);
    if (article.description !== undefined) await this.descriptionInput.fill(article.description);
    if (article.body !== undefined) await this.bodyInput.fill(article.body);
    for (const tag of article.tagList ?? []) {
      await this.tagInput.fill(tag);
      await this.tagInput.press('Enter');
    }
    await this.publishButton.click();
  }
}
