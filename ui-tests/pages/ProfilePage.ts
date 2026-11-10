import { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly previewTitles: Locator;
  readonly bio: Locator;

  constructor(private readonly page: Page) {
    this.previewTitles = page.locator('.article-preview h1');
    this.bio = page.locator('.user-info p');
  }

  async goto(username: string) {
    await this.page.goto(`/profile/${username}`);
  }

  async gotoFavorites(username: string) {
    await this.page.goto(`/profile/${username}/favorites`);
  }

  followButton(username: string): Locator {
    return this.page.getByRole('button', { name: `Follow ${username}`, exact: true });
  }

  unfollowButton(username: string): Locator {
    return this.page.getByRole('button', { name: `Unfollow ${username}`, exact: true });
  }
}
