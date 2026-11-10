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
});
