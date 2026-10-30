import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NavBar } from '../pages/NavBar';

test.describe('Authentication', () => {
  test('login page renders the sign-in form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('login with invalid credentials shows an error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('nobody@example.com', 'wrong-password');

    await expect(loginPage.errorMessages).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('a new user can register and is signed in', async ({ page }) => {
    const username = `qa_${Date.now()}`;
    const registerPage = new RegisterPage(page);
    const nav = new NavBar(page);
    await registerPage.goto();

    await registerPage.register(username, `${username}@example.com`, 'Passw0rd!123');

    await expect(page).toHaveURL('/');
    await expect(nav.userLink(username)).toBeVisible();
    await expect(nav.signInLink).toBeHidden();
  });
});
