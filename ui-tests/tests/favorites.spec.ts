import { test, expect } from '../fixtures';

test.describe('Favorites', () => {
  test('a signed-in user can favorite and unfavorite an article', { tag: '@smoke' }, async ({
    authedPage,
    articlePage,
    authorArticle,
  }) => {
    await articlePage.goto(authorArticle.slug);
    await expect(articlePage.favoriteButton).toContainText('(0)');

    await articlePage.favoriteButton.click();
    await expect(articlePage.favoriteButton).toContainText('Unfavorite Article');
    await expect(articlePage.favoriteButton).toContainText('(1)');

    await articlePage.favoriteButton.click();
    await expect(articlePage.favoriteButton).toContainText('(0)');
    await expect(articlePage.favoriteButton).not.toContainText('Unfavorite');
  });

  test('a favorite survives a reload', async ({ authedPage, articlePage, authorArticle, api, user }) => {
    await api.favorite(user.token, authorArticle.slug);

    await articlePage.goto(authorArticle.slug);

    await expect(articlePage.favoriteButton).toContainText('Unfavorite Article');
    await expect(articlePage.favoriteButton).toContainText('(1)');
  });

  test('a favorited article is listed under Favorited Articles on the profile', async ({
    authedPage,
    profilePage,
    authorArticle,
    api,
    user,
  }) => {
    await api.favorite(user.token, authorArticle.slug);

    await profilePage.gotoFavorites(user.username);

    await expect(profilePage.previewTitles).toHaveText([authorArticle.title]);
  });

  test('a signed-out visitor who clicks favorite is sent to the login page', async ({
    page,
    articlePage,
    authorArticle,
  }) => {
    await articlePage.goto(authorArticle.slug);

    await articlePage.favoriteButton.click();

    await expect(page).toHaveURL(/\/login/);
  });
});
