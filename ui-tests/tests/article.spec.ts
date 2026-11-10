import { test, expect } from '../fixtures';

test.describe('Article (created through the API)', () => {
  test('an article created via the API can be opened and shows its title', async ({
    page,
    articlePage,
    article,
  }) => {
    await articlePage.goto(article.slug);

    await expect(page).toHaveURL(new RegExp(`/article/${article.slug}`));
    await expect(articlePage.title).toHaveText(article.title);
  });
});
