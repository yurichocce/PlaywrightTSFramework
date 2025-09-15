import { Page, expect } from '@playwright/test';
import BasePage from './BasePage';

export default class LoginPage extends BasePage {
  private emailField = this.page.locator('#i0116');
  private nextButton = this.page.locator('#idSIButton9');   // also used as Sign In
  private passwordField = this.page.locator('#i0118');
  private buttonBack = this.page.locator('#idBtn_Back');

  constructor(page: Page) {
    super(page);
  }

  async login(email: string, password: string): Promise<void> {
    console.log('Start login');

    await expect(this.emailField).toBeVisible({ timeout: 10_000 });
    await this.emailField.fill(email);
    await this.nextButton.click();

    await expect(this.passwordField).toBeVisible({ timeout: 10_000 });
    await this.passwordField.fill(password);

    // Mirror original flow (Back -> wait -> Next -> Back)
    await this.buttonBack.click({ timeout: 5_000 }).catch(() => {});
    await this.page.waitForTimeout(5000);
    await this.nextButton.click({ timeout: 10_000 }).catch(() => {});
    await this.buttonBack.click({ timeout: 5_000 }).catch(() => {});

    console.log('Login Completed successfully');
  }

  // Parity with Selenium API; returns Playwright Page
  getDriver(): Page {
    console.warn('getDriver(): returning Playwright Page (no Selenium WebDriver).');
    return this.page;
  }
}
