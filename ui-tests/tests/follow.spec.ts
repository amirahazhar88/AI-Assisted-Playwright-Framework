import { test, expect } from '../fixtures';

test.describe('Follow and the following feed', () => {
  test('a user can follow and unfollow an author from the profile page', { tag: '@smoke' }, async ({
    authedPage,
    profilePage,
    author,
  }) => {
    await profilePage.goto(author.username);

    await profilePage.followButton(author.username).click();
    await expect(profilePage.unfollowButton(author.username)).toBeVisible();

    await profilePage.unfollowButton(author.username).click();
    await expect(profilePage.followButton(author.username)).toBeVisible();
  });

  test('a user can follow and unfollow an author from the article page', async ({
    authedPage,
    articlePage,
    authorArticle,
    author,
  }) => {
    // Known bug: the article page calls /profiles/undefined/follow (docs/bugs/BUG-003.md).
    // Remove test.fail() once BUG-003 is fixed.
    test.fail(true, 'BUG-003: Follow on the article page posts to /profiles/undefined/follow');

    await articlePage.goto(authorArticle.slug);
    await expect(articlePage.followButton).toHaveText(new RegExp(`^\\s*Follow ${author.username}`));

    await articlePage.followButton.click();
    await expect(articlePage.followButton).toContainText(`Unfollow ${author.username}`);

    await articlePage.followButton.click();
    await expect(articlePage.followButton).toHaveText(new RegExp(`^\\s*Follow ${author.username}`));
  });

  test('following survives a reload', async ({ authedPage, profilePage, author, api, user }) => {
    await api.follow(user.token, author.username);

    await profilePage.goto(author.username);

    await expect(profilePage.unfollowButton(author.username)).toBeVisible();
  });

  test('Your Feed is empty until you follow someone', async ({ authedPage, homePage }) => {
    await homePage.gotoFollowingFeed();

    await expect(homePage.yourFeedEmptyMessage).toBeVisible();
  });

  test('Your Feed shows articles from followed authors', { tag: '@smoke' }, async ({
    authedPage,
    homePage,
    authorArticle,
    author,
    api,
    user,
  }) => {
    await api.follow(user.token, author.username);

    await homePage.gotoFollowingFeed();

    await expect(homePage.previewTitles).toHaveText([authorArticle.title]);
  });

  test('a signed-out visitor who clicks follow is sent to the login page', async ({
    page,
    articlePage,
    authorArticle,
  }) => {
    await articlePage.goto(authorArticle.slug);

    await articlePage.followButton.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test("an author's profile lists that author's articles", async ({ profilePage, authorArticle, author }) => {
    await profilePage.goto(author.username);

    await expect(profilePage.previewTitles).toHaveText([authorArticle.title]);
  });
});
