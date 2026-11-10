import { test, expect } from '../fixtures';
import { buildArticle } from '../test-data/factory';

test.describe('Markdown rendering is sanitised (XSS)', () => {
  test('script, event handlers and javascript: links in the body are neutralised', async ({
    page,
    articlePage,
    api,
    user,
  }) => {
    const dialogs: string[] = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    const body = [
      'Safe **bold** text',
      '<img src=x onerror="window.__xss=1;alert(1)">',
      '<script>window.__xss=1;alert(1)</script>',
      '[click me](javascript:window.__xss=1)',
      '<a href="javascript:window.__xss=1">raw link</a>',
    ].join('\n\n');
    const created = await api.createArticle(user.token, buildArticle({ body }));
    try {
      await articlePage.goto(created.slug);
      await expect(articlePage.content).toContainText('Safe');
      await expect(articlePage.content.locator('strong')).toHaveText('bold'); // real markdown still works

      await expect(articlePage.content.locator('script')).toHaveCount(0);
      await expect(articlePage.content.locator('[onerror]')).toHaveCount(0);
      await expect(articlePage.content.locator('a[href^="javascript:" i]')).toHaveCount(0);
      expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
      expect(dialogs).toEqual([]);
    } finally {
      await api.deleteArticle(user.token, created.slug);
    }
  });
});
