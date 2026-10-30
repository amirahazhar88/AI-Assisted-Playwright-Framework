import { Locator, Page } from '@playwright/test';

/** The top navigation bar, present on every page. */
export class NavBar {
  readonly signInLink: Locator;
  readonly signUpLink: Locator;

  constructor(private readonly page: Page) {
    const nav = page.getByRole('navigation');
    this.signInLink = nav.getByRole('link', { name: 'Sign in' });
    this.signUpLink = nav.getByRole('link', { name: 'Sign up' });
  }

  /** Link showing the signed-in user's name (only visible when logged in). */
  userLink(username: string): Locator {
    return this.page.getByRole('navigation').getByRole('link', { name: username });
  }
}
