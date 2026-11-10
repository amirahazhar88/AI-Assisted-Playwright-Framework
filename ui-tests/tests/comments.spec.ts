import { test, expect } from '../fixtures';
import { buildComment } from '../test-data/factory';

test.describe('Comments', () => {
  test('a signed-in user can post a comment', { tag: '@smoke' }, async ({
    authedPage,
    articlePage,
    authorArticle,
  }) => {
    const body = buildComment();
    await articlePage.goto(authorArticle.slug);

    await articlePage.commentInput.fill(body);
    await articlePage.postCommentButton.click();

    await expect(articlePage.comments).toHaveText([body]);
    await expect(articlePage.commentInput).toHaveValue('');
  });

  test('an empty comment is rejected', async ({ authedPage, articlePage, authorArticle }) => {
    await articlePage.goto(authorArticle.slug);

    await articlePage.postCommentButton.click();

    await expect(articlePage.commentErrors.first()).toBeVisible();
    await expect(articlePage.comments).toHaveCount(0);
  });

  test('a user can delete their own comment', async ({
    authedPage,
    articlePage,
    authorArticle,
    api,
    user,
  }) => {
    const body = buildComment();
    await api.addComment(user.token, authorArticle.slug, body);
    await articlePage.goto(authorArticle.slug);
    await expect(articlePage.comments).toHaveText([body]);

    await articlePage.commentDeleteIcons.click();

    await expect(articlePage.comments).toHaveCount(0);
  });

  test("other users' comments are listed without a delete control", async ({
    authedPage,
    articlePage,
    authorArticle,
    author,
    api,
  }) => {
    const body = buildComment();
    await api.addComment(author.token, authorArticle.slug, body);

    await articlePage.goto(authorArticle.slug);

    await expect(articlePage.comments).toHaveText([body]);
    await expect(articlePage.commentDeleteIcons).toHaveCount(0);
  });

  test('a signed-out visitor sees a sign-in prompt instead of the comment box', async ({
    page,
    articlePage,
    authorArticle,
  }) => {
    await articlePage.goto(authorArticle.slug);

    await expect(articlePage.signInPrompt).toBeVisible();
    await expect(articlePage.commentInput).toHaveCount(0);
  });
});
