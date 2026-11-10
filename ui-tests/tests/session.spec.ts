import { test, expect } from '../fixtures';
import { NavBar } from '../pages/NavBar';

test.describe('Signed-in session (set up through the API)', () => {
  test('a user created via the API is signed in without using the login form', async ({
    authedPage,
    user,
  }) => {
    await authedPage.goto('/');

    const nav = new NavBar(authedPage);
    await expect(nav.userLink(user.username)).toBeVisible();
    await expect(nav.signInLink).toBeHidden();
  });

  test('a signed-in user can open the settings page', async ({ authedPage }) => {
    await authedPage.goto('/settings');

    await expect(authedPage).toHaveURL(/\/settings/);
    await expect(authedPage.getByRole('heading', { name: 'Your Settings' })).toBeVisible();
  });

  test('the token is planted only once, so a reload after logout stays signed out', async ({
    authedPage,
    user,
  }) => {
    await authedPage.goto('/');
    const nav = new NavBar(authedPage);
    await expect(nav.userLink(user.username)).toBeVisible();

    // Simulate logout by removing the token, then do a full page reload.
    await authedPage.evaluate(() => window.localStorage.removeItem('jwtToken'));
    await authedPage.reload();

    await expect(nav.signInLink).toBeVisible();
    await expect(nav.userLink(user.username)).toBeHidden();
  });
});
