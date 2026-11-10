import { test, expect } from '../fixtures';
import { buildUser } from '../test-data/factory';

test.describe('Authentication', () => {
  test('login page renders the sign-in form', async ({ loginPage }) => {
    await loginPage.goto();

    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('login with invalid credentials shows an error', async ({ page, loginPage }) => {
    await loginPage.goto();

    await loginPage.login('nobody@example.com', 'wrong-password');

    await expect(loginPage.errorMessages).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('a new user can register and is signed in', async ({ page, registerPage, nav }) => {
    const { username, email, password } = buildUser();
    await registerPage.goto();

    await registerPage.register(username, email, password);

    await expect(page).toHaveURL('/');
    await expect(nav.userLink(username)).toBeVisible();
    await expect(nav.signInLink).toBeHidden();
  });
});
