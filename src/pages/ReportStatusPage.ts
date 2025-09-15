import { Page, expect } from '@playwright/test';
import BasePage from './BasePage';

export default class ReportStatusPage extends BasePage {
  // Locators (mapped from your By.*)
  private messageReportSuccess = this.page.locator('xpath=//div[contains(text(),"Run with success")]');
  private optionMenu = this.page.locator('#menu-button-menu0');
  private openInExcelOnlineBtn = this.page.locator('button:has-text("Open in Excel Online")');
  private openInBrowserBtn = this.page.locator('button:has-text("Open in browser")');
  private itemStatus = this.page.locator('#itemStatus > div > div.css-p35yji');

  constructor(page: Page) {
    super(page);
  }

  /** Validate success message (120s timeout like your C#) */
  async validateMessageReportSuccess(): Promise<boolean> {
    console.log('Validate Message Report Success is shown');
    try {
      await expect(this.messageReportSuccess).toBeVisible({ timeout: 120_000 });
      return true;
    } catch {
      return false;
    }
  }

  /** Clicks the "Menu" option */
  async clickOnMenuOption(): Promise<void> {
    console.log('Click on Menu option');
    await expect(this.optionMenu).toBeVisible({ timeout: 10_000 });
    await this.optionMenu.click();
  }

  /** Clicks "Open in Excel Online" (or fallback to "Open in browser") */
  async clickOnOpenExcelTab(): Promise<void> {
    console.log('Click on Open Excel Tab');

    // Wait for either of the two buttons and click whichever is visible
    if (await this.openInExcelOnlineBtn.isVisible({ timeout: 10_000 })) {
      await this.openInExcelOnlineBtn.click();
    } else {
      await expect(this.openInBrowserBtn).toBeVisible({ timeout: 10_000 });
      await this.openInBrowserBtn.click();
    }
  }

  /** Combined action: open menu, then click "Open in Excel ..." */
  async openSuccess(): Promise<void> {
    console.log('Open success workflow (menu -> open)');
    await this.clickOnMenuOption();
    await this.clickOnOpenExcelTab();
  }

  /** Parity with Selenium API; returns Playwright Page */
  getDriver(): Page {
    console.warn('getDriver(): returning Playwright Page (no Selenium WebDriver).');
    return this.page;
  }

  /** Get the Design Mode/Report status text shown on the page */
  async getReportStatus(): Promise<string> {
    const el = this.itemStatus;
    await expect(el).toBeVisible({ timeout: 15_000 });
    return (await el.innerText()).trim();
  }
}
