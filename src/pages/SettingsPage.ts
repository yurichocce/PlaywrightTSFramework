import { Page, FrameLocator, expect } from '@playwright/test';
import PlatformLoginPage from './PlatformLoginPage';

export default class SettingsPage extends PlatformLoginPage {
  private _dataSource = '';
  private _company = '';

  constructor(page: Page) {
    super(page);
  }

  // --- Frames (adjust if your app uses different selectors) ---
  //private mainFrame(): FrameLocator {
   // return this.page.frameLocator('#WacFrame_Excel_0');
  //}
  //private addinFrame(): FrameLocator {
  //  return this.page.frameLocator('.AddinIframe');
  //}

  // --- Locators inside add-in frame ---
  private dataSourceInput = this.addinFrame.locator('#dataSourceInputFilterOptions');
  private companyInput = this.addinFrame.locator('#companyInputFilterOptions');
  private saveButton = this.addinFrame.locator('xpath=.//button[.="Save"]');

  private async ensureAddinVisible() {
    await expect(this.mainFrame.locator('body')).toBeVisible({ timeout: 10_000 });
    await expect(this.addinFrame.locator('body')).toBeVisible({ timeout: 10_000 });
  }

  // --------- API (C# properties mapped to methods for clarity) ---------

  public getDataSource(): string {
    return this._dataSource;
  }
  public async setDataSource(value: string): Promise<void> {
    console.log('Enter Data Source Input:', value);
    await this.ensureAddinVisible();

    await this.dataSourceInput.click();
    await this.dataSourceInput.press('ControlOrMeta+a');
    await this.dataSourceInput.press('Delete');
    await this.dataSourceInput.fill(value);

    this._dataSource = value;
    await this.page.waitForTimeout(2000); // parity with original sleep
  }

  public getCompany(): string {
    return this._company;
  }
  public async setCompany(value: string): Promise<void> {
    console.log('Enter Company Input:', value);
    await this.ensureAddinVisible();

    await this.companyInput.click();
    await this.companyInput.press('ControlOrMeta+a');
    await this.companyInput.press('Delete');
    await this.companyInput.fill(value);

    this._company = value;
    await this.page.waitForTimeout(2000); // parity with original sleep
  }

  // --------- Actions ---------

  public async clickOnSaveButton(): Promise<void> {
    console.log('Click on Save button');
    await this.ensureAddinVisible();
    await expect(this.saveButton).toBeVisible({ timeout: 10_000 });
    await this.saveButton.click();

    // Original code waited 20s; keep for parity (consider replacing with a smarter wait)
    await this.page.waitForTimeout(20_000);
  }

  // Parity helper with Selenium API; returns Playwright Page
  public getDriver(): Page {
    console.warn('getDriver(): returning Playwright Page (no Selenium WebDriver).');
    return this.page;
  }
}
