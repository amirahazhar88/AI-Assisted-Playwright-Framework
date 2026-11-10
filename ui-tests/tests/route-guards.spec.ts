import { test, expect } from '../fixtures';

test.describe('Route guards (signed out)', () => {
  const protectedPaths = ['/settings', '/editor', '/editor/some-article', '/?feed=following'];

  for (const path of protectedPaths) {
    test(`${path} redirects a signed-out visitor to the login page`, async ({ page, loginPage }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/login/);
      await expect(loginPage.heading).toBeVisible();
    });
  }

  test('the home page and article pages stay public', async ({ page, homePage, article, articlePage }) => {
    await homePage.goto();
    await expect(homePage.globalFeedTab).toBeVisible();

    await articlePage.goto(article.slug);
    await expect(page).toHaveURL(new RegExp(`/article/${article.slug}`));
    await expect(articlePage.title).toHaveText(article.title);
  });
});
