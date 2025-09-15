import { Page, FrameLocator, expect } from '@playwright/test';
import PlatformLoginPage from './PlatformLoginPage';   // ⬅️ use PlatformLoginPage (has login)
import BasePage from './BasePage';
                                                     //    not BasePage

export default class FunctionWizardPage extends PlatformLoginPage {
  private what = '';
  private table = '';
  private fields = '';

  constructor(page: Page) {
    super(page);
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

    const functionF = this.FunctionWizardInFrame;
    await this.page.waitForTimeout(10000); // parity with original

    // Click "Log in to Platform"
    //await expect(this.loginWithPlatform).toBeVisible({ timeout: 10_000 });

    //await this.loginWithPlatform.click();
    await functionF.locator('button:has-text("Log in to Platform")').click();
    // Click "Allow" and capture a new page if it opens
    const [maybePopup] = await Promise.all([
      this.page.context().waitForEvent('page').catch(() => null), // new tab/window if any
      await functionF.locator('input[type="button"][value="Allow"]').click()
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

  // --- Frames (adjust if needed) ---
  //private mainFrame(): FrameLocator { return this.page.frameLocator('#WacFrame_Excel_0'); }
  //private addinFrame(): FrameLocator { return this.page.frameLocator('.AddinIframe'); }

  // --- Locators inside add-in frame ---
private get nlLookup()          { return this.FunctionWizardInFrame.locator('#nlFunctionCard'); }
private get nlWhatDropdown()    { return this.FunctionWizardInFrame.locator('#whatButtonToggleMenu'); }
private get nlWhatFilter()      { return this.FunctionWizardInFrame.locator('#whatInputFilterOptions'); }
private get nlWhatFirstOption() { return this.FunctionWizardInFrame.locator('#whatMenuOption-0'); }
private get nlTableInput()      { return this.FunctionWizardInFrame.locator('#tablesInputFilterOptions'); }
private get nlTableToggle()     { return this.FunctionWizardInFrame.locator('#tablesButtonToggleMenu'); }
private get nlFieldsInput()     { return this.FunctionWizardInFrame.locator('#fieldsInputFilterOptions'); }
private get nlApplyBtn()        { return this.FunctionWizardInFrame.locator('#footerApplyButton'); }

  // ---------- Actions ----------
  async clickOnNLLookup(): Promise<void> {
    await expect(this.mainFrame.locator('body')).toBeVisible({ timeout: 10_000 });
    await expect(this.FunctionWizardInFrame.locator('body')).toBeVisible({ timeout: 10_000 });
    await this.nlLookup.click();
  }

  async setWhat(value: string): Promise<void> {
    await this.nlWhatDropdown.click();
    await this.nlWhatFilter.fill(value);
    await this.nlWhatFirstOption.click();
    this.what = value;
  }
  getWhat(): string { return this.what; }

  async clickOnTableToggle(): Promise<void> { await this.nlTableToggle.click(); }

  async setTable(value: string): Promise<void> {
    await this.clickOnTableToggle();
    await this.nlTableInput.fill(value);
    this.table = value;
  }
  getTable(): string { return this.table; }

  async setFields(value: string): Promise<void> {
    await this.clickOnTableToggle();
    await this.nlFieldsInput.fill(value);
    this.fields = value;
  }
  getFields(): string { return this.fields; }

  async enterNLTableInput(input: string): Promise<void> {
    await this.nlTableInput.fill(input);
    await this.nlTableInput.press('Tab');
  }

  async enterNLFieldInput(input: string): Promise<void> {
    await this.nlFieldsInput.fill(input);
  }

  async clickOnApplyButton(): Promise<void> {
    await this.nlApplyBtn.click();
  }

   getDriver(): Page {
    console.warn('getDriver(): returning Playwright Page (no Selenium WebDriver).');
    return this.page;
  }
}
