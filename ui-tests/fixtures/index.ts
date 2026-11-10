import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ArticlePage } from '../pages/ArticlePage';
import { EditorPage } from '../pages/EditorPage';
import { HomePage } from '../pages/HomePage';
import { SettingsPage } from '../pages/SettingsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NavBar } from '../pages/NavBar';
import { ApiClient, CreatedArticle, RegisteredUser } from '../helpers/api';
import { buildArticle, buildUser } from '../test-data/factory';

type Pages = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  articlePage: ArticlePage;
  editorPage: EditorPage;
  homePage: HomePage;
  settingsPage: SettingsPage;
  profilePage: ProfilePage;
  nav: NavBar;
};

type Api = {
  /** Calls the newsclip REST API directly (fast setup, no browser). */
  api: ApiClient;
  /** A brand-new user, created through the API. */
  user: RegisteredUser;
  /** Browser page that is already signed in as `user`, without touching the login form. */
  authedPage: Page;
  /** An article written by `user`, created through the API and deleted after the test. */
  article: CreatedArticle;
  /** A second user (the "other person"), created through the API. */
  author: RegisteredUser;
  /** An article written by `author`, deleted after the test. `user` is the reader. */
  authorArticle: CreatedArticle;
};

/**
 * Custom `test` that hands each test ready-made page objects and API-backed setup.
 * Import `test` and `expect` from here instead of '@playwright/test'.
 */
export const test = base.extend<Pages & Api>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },
  editorPage: async ({ page }, use) => {
    await use(new EditorPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  nav: async ({ page }, use) => {
    await use(new NavBar(page));
  },

  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  user: async ({ api }, use) => {
    await use(await api.registerUser(buildUser()));
  },

  authedPage: async ({ page, user }, use) => {
    // The app reads its JWT from localStorage on load, so plant it before any page script runs.
    // Init scripts re-run on every full page load, so a sessionStorage flag makes this happen only
    // once per tab. Otherwise a reload after logout would silently sign the user back in.
    await page.addInitScript((token) => {
      if (window.sessionStorage.getItem('authSeeded')) return;
      window.localStorage.setItem('jwtToken', token);
      window.sessionStorage.setItem('authSeeded', '1');
    }, user.token);
    await use(page);
  },

  article: async ({ api, user }, use) => {
    const article = await api.createArticle(user.token, buildArticle());
    await use(article);
    await api.deleteArticle(user.token, article.slug); // cleanup after the test
  },

  author: async ({ api }, use) => {
    await use(await api.registerUser(buildUser()));
  },

  authorArticle: async ({ api, author }, use) => {
    const article = await api.createArticle(author.token, buildArticle());
    await use(article);
    await api.deleteArticle(author.token, article.slug); // cleanup after the test
  },
});

export { expect } from '@playwright/test';
