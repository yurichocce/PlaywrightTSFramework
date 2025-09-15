import { Page, FrameLocator, expect } from '@playwright/test';
import BasePage from './BasePage';

export default class NLLookupPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Adjust these selectors if your app uses different frame ids/classes.
  /*
  private mainFrame(): FrameLocator {
    return this.page.frameLocator('#WacFrame_Excel_0');
  }
  private addinFrame(): FrameLocator {
    return this.page.frameLocator('.AddinIframe');
  }
    */

  // C# By.XPath(".//div[@id='nlFunctionCard']") -> '#nlFunctionCard' within add-in frame
  private nlWhatDropdown = this.addinFrame.locator('#nlFunctionCard');

  /** Click the NL Lookup card */
  async clickNLLookup(): Promise<void> {
    await expect(this.mainFrame.locator('body')).toBeVisible({ timeout: 10_000 });
    await expect(this.addinFrame.locator('body')).toBeVisible({ timeout: 10_000 });
    await expect(this.nlWhatDropdown).toBeVisible({ timeout: 10_000 });
    await this.nlWhatDropdown.click();
  }

  /** Check visibility (handy for asserts) */
  async isNLLookupVisible(): Promise<boolean> {
    return this.nlWhatDropdown.isVisible();
  }

  /** Parity with Selenium API; returns Playwright Page */
  getDriver(): Page {
    console.warn('getDriver(): returning Playwright Page (no Selenium WebDriver).');
    return this.page;
  }
}
