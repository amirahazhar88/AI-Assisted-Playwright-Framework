import { test, expect } from '../fixtures';

test.describe('User settings', () => {
  test('updating the bio saves it and opens the profile', { tag: '@smoke' }, async ({
    authedPage,
    settingsPage,
    profilePage,
    api,
    user,
  }) => {
    await settingsPage.goto();
    await expect(settingsPage.usernameInput).toHaveValue(user.username);

    await settingsPage.bioInput.fill('I write about QA.');
    await settingsPage.imageInput.fill('https://example.com/avatar.png'); // see BUG-002: empty image cannot be saved
    await settingsPage.updateButton.click();

    await expect(authedPage).toHaveURL(new RegExp(`/profile/${user.username}`));
    await expect(profilePage.bio).toHaveText('I write about QA.');
    expect((await api.getCurrentUser(user.token)).bio).toBe('I write about QA.');
  });

  test('a changed password is accepted at the next login', async ({
    authedPage,
    settingsPage,
    api,
    user,
  }) => {
    const newPassword = 'N3wPassw0rd!456';
    await settingsPage.goto();

    await settingsPage.bioInput.fill('Bio for password test'); // see BUG-002: empty bio/image cannot be saved
    await settingsPage.imageInput.fill('https://example.com/avatar.png');
    await settingsPage.passwordInput.fill(newPassword);
    await settingsPage.updateButton.click();
    await expect(authedPage).toHaveURL(new RegExp(`/profile/${user.username}`));

    expect(await api.login(user.email, newPassword)).toBeTruthy();
    await expect(api.login(user.email, user.password)).rejects.toThrow(/Login failed/);
  });

  test('changing the email to one that is already taken is rejected', async ({
    authedPage,
    settingsPage,
    author,
  }) => {
    await settingsPage.goto();

    await settingsPage.emailInput.fill(author.email);
    await settingsPage.updateButton.click();

    await expect(settingsPage.errorMessages.first()).toBeVisible();
    await expect(authedPage).toHaveURL(/\/settings/);
  });

  test('settings can be saved with an empty image', async ({ authedPage, settingsPage, user }) => {
    // Known bug: an empty image/bio is sent as "" and the API answers 422 (docs/bugs/BUG-002.md).
    // Remove test.fail() once BUG-002 is fixed.
    test.fail(true, 'BUG-002: settings cannot be saved when bio or image is empty');

    await settingsPage.goto();
    await settingsPage.bioInput.fill('Only a bio, no image');
    await settingsPage.updateButton.click();

    await expect(authedPage).toHaveURL(new RegExp(`/profile/${user.username}`));
  });
});
