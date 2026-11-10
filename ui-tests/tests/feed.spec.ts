import { test, expect } from '../fixtures';
import { ApiClient } from '../helpers/api';
import { buildArticle, buildTag } from '../test-data/factory';

test.describe('Feeds', () => {
  test('the global feed page loads with its tab', { tag: '@smoke' }, async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.globalFeedTab).toBeVisible();
  });

  test('an article shows up in the feed filtered by its tag', async ({ homePage, api, user }) => {
    const tag = buildTag();
    const data = buildArticle({ tagList: [tag] });
    const created = await api.createArticle(user.token, data);
    try {
      await homePage.gotoTag(tag);

      await expect(homePage.previewTitles).toHaveText([data.title]);
    } finally {
      await api.deleteArticle(user.token, created.slug);
    }
  });

  test('a tag with no articles shows the empty message', async ({ homePage }) => {
    await homePage.gotoTag(buildTag());

    await expect(homePage.emptyMessage).toBeVisible();
  });

  test('a long feed shows 10 articles per page and a pager', async ({ homePage, api, user }) => {
    const tag = buildTag();
    const created = await createArticles(api, user.token, tag, 11);
    try {
      await homePage.gotoTag(tag);

      await expect(homePage.previewTitles).toHaveCount(10);
      await expect(homePage.pageButton(2)).toBeVisible();
    } finally {
      await deleteArticles(api, user.token, created);
    }
  });

  test('page 2 of a long feed shows the remaining article', async ({ homePage, api, user }) => {
    // Known bug: the API multiplies `offset` by `limit`, so page 2 comes back empty.
    // Remove test.fail() once BUG-001 is fixed (docs/bugs/BUG-001.md).
    test.fail(true, 'BUG-001: GET /api/articles skips too many rows when offset > 0');

    const tag = buildTag();
    const created = await createArticles(api, user.token, tag, 11);
    try {
      await homePage.gotoTag(tag);
      await homePage.pageButton(2).click();

      await expect(homePage.previewTitles).toHaveCount(1);
    } finally {
      await deleteArticles(api, user.token, created);
    }
  });
});

function createArticles(api: ApiClient, token: string, tag: string, count: number) {
  return Promise.all(
    Array.from({ length: count }, () => api.createArticle(token, buildArticle({ tagList: [tag] }))),
  );
}

function deleteArticles(api: ApiClient, token: string, articles: { slug: string }[]) {
  return Promise.all(articles.map((a) => api.deleteArticle(token, a.slug)));
}
