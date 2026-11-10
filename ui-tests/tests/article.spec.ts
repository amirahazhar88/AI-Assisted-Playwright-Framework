import { test, expect } from '../fixtures';
import { buildArticle } from '../test-data/factory';

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

test.describe('Article management (through the UI)', () => {
  test('an author can create an article in the editor', { tag: '@smoke' }, async ({
    authedPage,
    editorPage,
    articlePage,
    api,
    user,
  }) => {
    const data = buildArticle({ body: 'Hello **markdown** body', tagList: ['qa'] });
    await editorPage.goto();

    await editorPage.fillAndPublish(data);

    await expect(authedPage).toHaveURL(/\/article\//);
    const slug = new URL(authedPage.url()).pathname.split('/').pop()!;
    try {
      await expect(articlePage.title).toHaveText(data.title);
      await expect(articlePage.content).toContainText('Hello markdown body'); // markdown is rendered
      await expect(articlePage.content.locator('strong')).toHaveText('markdown');
    } finally {
      await api.deleteArticle(user.token, slug);
    }
  });

  test('publishing without a title shows an error and stays on the editor', async ({
    authedPage,
    editorPage,
  }) => {
    await editorPage.goto();

    await editorPage.fillAndPublish({ description: 'no title', body: 'no title' });

    await expect(editorPage.errorMessages.first()).toBeVisible();
    await expect(authedPage).toHaveURL(/\/editor/);
  });

  test('an author can edit an article', { tag: '@smoke' }, async ({
    authedPage,
    editorPage,
    articlePage,
    article,
  }) => {
    await editorPage.goto(article.slug);
    await expect(editorPage.titleInput).toHaveValue(article.title);

    await editorPage.fillAndPublish({ description: 'Edited description', body: 'Edited body text' });

    await expect(authedPage).toHaveURL(new RegExp(`/article/${article.slug}`));
    await expect(articlePage.content).toContainText('Edited body text');
  });

  test('an author can delete an article', { tag: '@smoke' }, async ({
    authedPage,
    articlePage,
    article,
    api,
  }) => {
    await articlePage.goto(article.slug);

    await articlePage.deleteButton.click();

    await expect(authedPage).toHaveURL('/');
    expect(await api.articleExists(article.slug)).toBe(false);
  });

  test('a visitor who is not the author cannot see edit or delete', async ({
    page,
    articlePage,
    article,
  }) => {
    await articlePage.goto(article.slug);

    await expect(articlePage.title).toHaveText(article.title);
    await expect(articlePage.editLink).toBeHidden();
    await expect(articlePage.deleteButton).toBeHidden();
  });
});
