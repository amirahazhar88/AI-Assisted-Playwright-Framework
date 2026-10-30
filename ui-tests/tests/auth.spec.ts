import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page renders the sign-in form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('login with invalid credentials shows an error', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email').fill('nobody@example.com');
    await page.getByPlaceholder('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.locator('.error-messages li')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('a new user can register and is signed in', async ({ page }) => {
    const id = Date.now();
    const username = `qa_${id}`;

    await page.goto('/register');
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Email').fill(`${username}@example.com`);
    await page.getByPlaceholder('Password').fill('Passw0rd!123');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: username })).toBeVisible();
  });
});
