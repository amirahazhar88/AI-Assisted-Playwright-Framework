import { Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessages: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Sign up' });
    this.usernameInput = page.getByPlaceholder('Username');
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign up' });
    this.errorMessages = page.locator('.error-messages li');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(username: string, email: string, password: string) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
