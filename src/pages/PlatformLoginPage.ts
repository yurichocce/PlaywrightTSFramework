import { Page, expect } from '@playwright/test';
import BasePage from './BasePage';
import { report } from 'process';

export default class PlatformLoginPage extends BasePage {
  // Locators (C# -> PW)
  
  private emailField = this.page.locator('#signInName');
  private continueBtn = this.page.locator('#continue');
  private get loginWithPlatform() { return this.ReportOptionInFrame.locator('button:has-text("Log in to Platform")'); }
  private get allowButton() { return this.ReportOptionInFrame.locator('input[type="button"][value="Allow"]'); }

  // Optional (from C#)
  private selection = this.page.locator('p.chakra-text.css-l9wnib'); // not used in this snippet

  constructor(page: Page) {
    super(page);
  }

  /** Click the email input */
  async clickOnEmail(): Promise<void> {
    console.log('Click on Email');
    await expect(this.emailField).toBeVisible({ timeout: 10_000 });
    await this.emailField.click();
  }

  /** Type email into the email input */
  async enterEmail(email: string): Promise<void> {
    console.log('Enter email:', email);
    await expect(this.emailField).toBeVisible({ timeout: 10_000 });
    await this.emailField.fill(email);
  }

  /** Scroll to bottom of the current page */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /** Highlight the Nth iframe (defaults to index 5 like your C# example) */
  async highlightIframe(index = 5): Promise<void> {
    try {
      const iframe = this.page.frameLocator('iframe').locator('xpath=.');
      // Bring the target iframe into view
      await this.page.locator('iframe').nth(index).scrollIntoViewIfNeeded();
      // Add/remove a border using JS
      await this.page.locator('iframe').nth(index).evaluate((el: Element) => {
        const node = el as HTMLElement;
        const prev = node.style.border;
        node.style.border = '5px solid red';
        setTimeout(() => { node.style.border = prev; }, 3000);
      });
      console.log('Iframe has been highlighted!');
    } catch (e: any) {
      console.log('Iframe not found:', e?.message ?? e);
    }
  }

  
  /**
   * Login flow:
   * - Click "Log in to Platform"
   * - Click "Allow" (may open a popup)
   * - In the popup (or same tab) enter email and Continue
   * - Return focus to the main page
   */
  async login(email: string): Promise<void> {
    console.log('Start Platform login');

    const reportF = this.ReportOptionInFrame;
    await this.page.waitForTimeout(2000); // parity with original

    // Click "Log in to Platform"
    //await expect(this.loginWithPlatform).toBeVisible({ timeout: 10_000 });

    //await this.loginWithPlatform.click();
    await reportF.locator('button:has-text("Log in to Platform")').click();
    // Click "Allow" and capture a new page if it opens
    const [maybePopup] = await Promise.all([
      this.page.context().waitForEvent('page').catch(() => null), // new tab/window if any
      await reportF.locator('input[type="button"][value="Allow"]').click()
      //this.allowButton.click()
    ]);

    const authPage = maybePopup ?? this.page;
    await authPage.bringToFront();
    await authPage.waitForLoadState('domcontentloaded');

    // Fill email and continue
    await authPage.locator('#signInName').waitFor({ state: 'visible', timeout: 10_000 });
    await authPage.fill('#signInName', email);
    await authPage.click('#continue');

    // If it was a popup, you can optionally wait for it to close or just refocus main page:
    await this.page.bringToFront();
    console.log('Platform login flow finished');
  }

  /** Parity with Selenium API; returns Playwright Page */
  getDriver(): Page {
    console.warn('getDriver(): returning Playwright Page (no Selenium WebDriver).');
    return this.page;
  }
}
