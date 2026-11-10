import { Locator, Page } from '@playwright/test';

export class SettingsPage {
  readonly heading: Locator;
  readonly imageInput: Locator;
  readonly usernameInput: Locator;
  readonly bioInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly updateButton: Locator;
  readonly logoutButton: Locator;
  readonly errorMessages: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Your Settings' });
    this.imageInput = page.getByPlaceholder('URL of profile picture');
    this.usernameInput = page.getByPlaceholder('Your username');
    this.bioInput = page.getByPlaceholder('Short bio about you');
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.updateButton = page.getByRole('button', { name: 'Update Settings' });
    this.logoutButton = page.getByRole('button', { name: /click here to logout/i });
    this.errorMessages = page.locator('.error-messages li');
  }

  async goto() {
    await this.page.goto('/settings');
  }

  async logout() {
    await this.logoutButton.click();
  }
}
