import BasePage from './BasePage';
import { expect, FrameLocator, Page } from '@playwright/test';
import SettingsPage from './SettingsPage';
import FunctionWizardPage from './FunctionWizardPage';
import ReportOptionPage from './ReportOptionPage';
import ReportStatusPage from './ReportStatusPage';
import LoginPage from './LoginPage';
import { JetUtility } from '../utils/jetUtility';
// In ExcelOnlinePage.ts (Node/TS)
import fs from 'fs';
import path from 'path';


export default class ExcelOnlinePage extends BasePage {
  // Root-level locators
  //private readonly blankWorkbook = this.page.locator('div[aria-label="Blank workbook"]');
  //private readonly insertTab = this.page.locator('#InsertAddInFlyout');
  //private readonly backBtn = this.page.locator('#idBtn_Back');

  // Main frame and sub-frames
  //private mainFrame(): FrameLocator {
  /*
  private mainFrame() {
    return this.page.frameLocator('iframe[id^="WacFrame_Excel_"]');
  }
  private addinFrame(): FrameLocator {
    return this.page.frameLocator('.AddinIframe');
  }
  private modalFrame(): FrameLocator {
    return this.page.frameLocator('#InsertDialog');
  }
  */

  // Frames
//private get mainFrame()  { return this.page.frameLocator('iframe[name="WacFrame_Excel_0"]'); }
//private get addinFrame() { return this.mainFrame.frameLocator('.AddinIframe'); }
//private get modalFrame() { return this.page.frameLocator('#InsertDialog'); }
//private get modalFrame() { return this.mainFrame.frameLocator('#InsertDialog'); }

// Root
private get blankWorkbook() { return this.page.locator('div[aria-label="Blank workbook"]'); }
private get backBtn()       { return this.page.locator('#idBtn_Back'); }
private get uploadFileDialog() { return this.page.locator('#UploadFileDialog'); }

// Ribbon / menus (ALL inside the Excel frame)
private get insertTab()  { return this.mainFrame.locator('#InsertAddInFlyout'); }
private get addinsBy()   { return this.mainFrame.locator('xpath=.//div[.="Add-ins" and contains(@class,"ribbon-menu-text")]'); }
private get fileMenu()   { return this.mainFrame.locator('xpath=.//span[.="File"]'); }
private get openMenu()   { return this.mainFrame.locator('xpath=.//span[.="Open"]'); }
private get openFileFromDeviceMenu() { return this.mainFrame.locator('xpath=.//span[.="Open files from this device"]'); }

private get manageMyAddIns() { return this.mainFrame.locator('xpath=//li[@id="MY ADD-INS"]/button'); }
private get uploadMyAddIn()  { return this.modalFrame.locator('#UploadMyAddin'); }
private get browseButton()   { return this.modalFrame.locator('#BrowseButton'); }
private get fileInput()      { return this.modalFrame.locator('#BrowserFile'); }
private get uploadButton()   { return this.modalFrame.locator('#DialogInstall'); }

private get jetReportButton()   { return this.mainFrame.locator('xpath=//span[.="Jet Online" and @data-automationid="splitbuttonprimary"]'); }
private get functionBtn()       { return this.mainFrame.locator('xpath=//span[contains(.,"Function")]'); }
private get reportOptionsBtn()  { return this.mainFrame.locator('xpath=(//span[contains(.,"Report") and contains(.,"Options")])[1]'); }
private get moreSettingsLink()  { return this.mainFrame.locator('xpath=//span[.="More settings"]'); }
private get advancedLink()      { return this.mainFrame.locator('xpath=//span[.="Advanced..."]'); }
private get settingsBtn()       { return this.mainFrame.locator('xpath=//span[.="Settings"]'); }
private get runBtn()            { return this.mainFrame.locator('xpath=//span[.="Run"]'); }
private get designModeButton()  { return this.mainFrame.locator('#AddinControl3'); }





  // In-frame locators
//  private get insertTab()  { return this.page.locator('#InsertAddInFlyout'); }
//private get addinsBy()   { return this.mainFrame.locator('xpath=.//div[.="Add-ins" and contains(@class,"ribbon-menu-text")]'); }



  //private fileMenu = this.mainFrame().locator('xpath=.//span[.="File"]');
  //private openMenu = this.mainFrame().locator('xpath=.//span[.="Open"]');
  //private openFileFromDeviceMenu = this.mainFrame.locator('xpath=//span[.="Open files from this device"]');


  constructor(page: Page) {
    super(page);
  }

private isClosedError(e: any) {
  const m = String(e?.message ?? e);
  return m.includes('Target page, context or browser has been closed') ||
         m.includes('Execution context was destroyed') ||
         m.includes('frame was detached');
}

/** Find/adopt a page that contains the Excel workbook iframe, with retries. */
private async findWorkbookPage(timeoutMs = 120_000) {
  const frameSelectors = [
    'iframe[id^="WacFrame_Excel_"]',
    'iframe[title^="Excel"]',
    'iframe[src*="excel"]',
    'iframe[data-automationid*="WacFrame"]',
  ];
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    // scan existing pages, newest first
    const pages = this.page.context().pages().slice().reverse();
    for (const p of pages) {
      if (p.isClosed()) continue;
      for (const sel of frameSelectors) {
        try {
          const f = p.frameLocator(sel).first();
          await f.locator('body').waitFor({ state: 'visible', timeout: 500 });
          this.adoptPage(p); // <-- swap this POM to that page
          return;
        } catch { /* try next selector/page */ }
      }
    }
    // wait briefly for a new page to open, then loop
    await this.page.context().waitForEvent('page', { timeout: 1500 }).catch(() => {});
  }

  // helpful debug on failure
  const info = this.page.context().pages().map(p => ({
    closed: p.isClosed(),
    url: (() => { try { return p.url(); } catch { return '<unavailable>'; } })()
  }));
  throw new Error(`Excel workbook tab not found. Pages seen: ${JSON.stringify(info)}`);
}

/** Ensure we’re attached to the workbook tab and its frame is visible. */
private async ensureExcelFrame(timeoutMs = 120_000) {
  // fast path: current page already has the frame
  for (const sel of ['iframe[id^="WacFrame_Excel_"]', 'iframe[title^="Excel"]']) {
    try {
      await this.page.frameLocator(sel).first().locator('body').waitFor({ state: 'visible', timeout: 1000 });
      return;
    } catch { /* fallback */ }
  }
  await this.findWorkbookPage(timeoutMs);
}


private async withWorkbook<T>(fn: () => Promise<T>): Promise<T> {
  await this.ensureExcelFrame();
  try {
    return await fn();
  } catch (e) {
    if (!this.isClosedError(e)) throw e;
    // Recover and retry once
    await this.ensureExcelFrame();
    return await fn();
  }
}


  private async openFileMenu() {
  const main = this.mainFrame;
  // Ensure Excel UI is actually loaded
  await expect(main.locator('body')).toBeVisible({ timeout: 120_000 });

  // Try common selectors first (role / aria / text), then fallback to keyboard
  const candidates = [
    main.getByRole('tab', { name: /^File$/ }).first(),
    main.getByRole('menuitem', { name: /^File$/ }).first(),
    main.locator('button[aria-label="File"]').first(),
    main.locator('text=File').first(), // last resort
  ];

  for (const c of candidates) {
    try {
      if (await c.isVisible({ timeout: 1500 })) { await c.click(); return; }
    } catch { /* try next */ }
  }

  // Keyboard fallback (accelerator): focus Excel and press Alt+F
  // (works on Windows; on macOS try 'Control+F2' or navigate via arrow keys)
  await this.page.locator('iframe[id^="WacFrame_Excel_"]').first().click({ timeout: 5_000 }).catch(() => {});
  await this.page.keyboard.press('Alt+F'); // open File menu
}
  
  // ------------------------- Workflows -------------------------

 async createNewWorkbook() {
  console.log('Create new Workbook');

  await this.page.waitForFunction(() => document.title.includes('Excel'), null, { timeout: 120_000 });

  // Click the "Blank workbook"
  const [maybeNewPage] = await Promise.all([
  this.page.context().waitForEvent('page').catch(() => null),
  this.blankWorkbook.click(),
]);

if (maybeNewPage) {
  await maybeNewPage.waitForLoadState('domcontentloaded');
  this.adoptPage(maybeNewPage);
}

// make sure the workbook frame is there before proceeding
await this.ensureExcelFrame(120_000);

await this.backBtn.click({ timeout: 5_000 }).catch(() => {});

}

async clickOnAdvancedLink() {
    const main = this.mainFrame;
  await this.ensureExcelFrame();
  //await expect(this.advancedLink).toBeVisible({ timeout: 20_000 });
  await this.advancedLink.waitFor({ state: 'visible', timeout: 60_000 });
  await main.getByRole('menuitem', { name: 'Advanced...' }).click();
  //await this.advancedLink.click();
}

async clickOnMoreSettings() {
  await this.ensureExcelFrame();
  await expect(this.moreSettingsLink).toBeVisible({ timeout: 20_000 });
  await this.moreSettingsLink.click();
}

async clickOnFunctionButton(): Promise<FunctionWizardPage> {
  await this.ensureExcelFrame();
  await expect(this.functionBtn).toBeVisible({ timeout: 10_000 });
  await this.functionBtn.click();
  await expect(this.addinFrame.locator('body')).toBeVisible({ timeout: 10_000 });
  return new FunctionWizardPage(this.page);
}


  
  async switchModelFrame() {
    // In Playwright, "switching" is done by scoping locators; if you truly need
    // a Frame object, you can do:
    console.log('Switch Model frame');
    await expect(this.modalFrame.locator('body')).toBeVisible({ timeout: 10_000 });
  }

  async clickOnJetReportRibbon() {
    console.log('Click on Jet Report Ribbon');
    await this.page.waitForTimeout(500); // give ribbon time to render
    await expect(this.jetReportButton).toBeVisible({ timeout: 10_000 });
    await this.jetReportButton.click();
  }

  

  async clickOnReportOptionsButton(): Promise<ReportOptionPage> {
    console.log('Click on Report Options button');
    await expect(this.reportOptionsBtn).toBeVisible({ timeout: 10_000 });
    await this.reportOptionsBtn.click();

    await expect(this.addinFrame.locator('body')).toBeVisible({ timeout: 10_000 });
    return new ReportOptionPage(this.page);
  }

  async clickOnSettingsButton(): Promise<SettingsPage> {
    console.log('Click on Settings button');
    await expect(this.settingsBtn).toBeVisible({ timeout: 10_000 });
    await this.settingsBtn.click();
    return new SettingsPage(this.page);
  }

  async clickOnRunButton(): Promise<ReportStatusPage> {
    console.log('Click on Run button');
    await expect(this.runBtn).toBeVisible({ timeout: 10_000 });
    await this.runBtn.click();
    return new ReportStatusPage(this.page);
  }

  async verifyAddin() {
    console.log('Verify AddIn');
    await this.page.waitForTimeout(500);
    await expect(this.jetReportButton).toBeVisible({ timeout: 10_000 });
    await this.jetReportButton.click();

    // verify Function button exists
    await expect(this.functionBtn).toBeVisible({ timeout: 10_000 });
    await this.functionBtn.click();
  }

async clickOnAddIns() {
  console.log('Click on AddIns');
await this.sleep(20_000);

  const main = this.mainFrame;
  //await this.ensureExcelFrame(120_000);

// await this.insertTab.click({ timeout: 120_000 }).catch(() => {}); // open Insert if needed

  /*
  const addinsText = this.mainFrame.getByText('Add-ins', { exact: true });
  if (await addinsText.isVisible({ timeout: 5000 }).catch(() => false)) {
    await addinsText.click({ timeout: 60_000 });
  } else {
    await this.addinsBy.waitFor({ state: 'visible', timeout: 60_000 });
    await this.addinsBy.click({ timeout: 60_000 });
  }
    */
   //await this.wait(20_000);
   await this.addinsBy.waitFor({ state: 'visible', timeout: 60_000 });
  //await this.addinsBy.click({ timeout: 60_000 });
  await main.getByRole('button', { name: 'Add-ins' }).click({ timeout: 60_000 });
  
}



protected runCellScript(script: string, cell: string) {
  return this.page.evaluate(
    ({ s, c }) => {
      const fn = new Function('cell', s as string);
      return Promise.resolve(fn(c as string));
    },
    { s: script, c: cell }
  );
}


  async clickOnUploadMyAddIns() {
    console.log('Click on Upload my AddIns');
    const modalF = this.modalFrame;
    //await expect(this.modalFrame.locator('body')).toBeVisible({ timeout: 20_000 });
    //await this.uploadMyAddIn.waitFor({ state: 'visible', timeout: 20_000 });
    //await expect(this.uploadMyAddIn).toBeVisible({ timeout: 20_000 });
    //await this.uploadMyAddIn.click();
    await modalF.getByRole('link', { name: 'Upload My Add-in' }).click({ timeout: 60_000 });
  }

  /**
   * Upload Add-in (manifest) already on local disk (localFilePath).
   * If you still need to download the manifest at runtime, do it in the test or a helper (Node fetch/fs).
   */
  async uploadAddIn(urlFilePath: string, localFilePath: string) {
    console.log('Upload AddIn:', localFilePath);
    const modalF = this.modalFrame;

    if (urlFilePath) {
    await JetUtility.downloadManifest(urlFilePath, localFilePath, msg => console.log(msg));
  }

    await this.clickOnAddIns();

    // Try "More settings" else "Advanced..."
    try {
      await this.clickOnMoreSettings();
    } catch {
      console.log('More Settings not found, clicking Advanced...');
      await this.clickOnAdvancedLink();
    }

    await this.page.waitForTimeout(500);
    await this.clickOnUploadMyAddIns();

    //await expect(this.uploadFileDialog).toBeVisible({ timeout: 10_000 });
    //await expect(this.browseButton).toBeVisible({ timeout: 10_000 });

    // Set the file into the input (inside modal frame)
    await this.page.waitForTimeout(5000);
    await modalF.locator('#BrowserFile').setInputFiles(localFilePath);

    //await modalF.getByRole('button', { name: 'Browse...' }).setInputFiles(localFilePath);
    //await this.fileInput.setInputFiles(localFilePath);
    //await modalF.getByRole('button', { name: 'Browse...' }).setInputFiles(localFilePath);
    await modalF.locator('#DialogInstall').click();
    //await this.uploadButton.click();
    //locator('#DialogInstall');
  }

  /**
   * Upload a report workbook from local machine. Replace AutoIt with direct setInputFiles.
   */
  // in ExcelOnlinePage.ts
async uploadReportFromLocalMachine(reportName: string) {
  // Build the file path and sanity-check it
  const filePath = path.resolve(process.cwd(), 'src/data/JetReportTest', `${reportName}.xlsx`);
  if (!fs.existsSync(filePath)) throw new Error(`Report not found: ${filePath}`);

  // Open File > Open > "Open files from this device" (your existing method)
  await this.openFileMenu();
  const main = this.mainFrame; // your frameLocator/host frame accessor

  // Click "Open"
  await main.getByRole('menuitem', { name: /^Open$/ }).first().click().catch(async () => {
    await main.locator('xpath=.//span[.="Open"]').first().click();
  });

  // Prepare to catch the OS file dialog
  const waitChooser = this.page.waitForEvent('filechooser').catch(() => null);

  // Click the item that triggers the chooser (wording varies by tenant)
  const fromDeviceCandidates = [
    main.getByText('Open files from this device', { exact: true }),
    main.getByText('Upload from this device', { exact: true }),
    main.locator('xpath=.//span[.="Open files from this device"]'),
  ];
  let clicked = false;
  for (const c of fromDeviceCandidates) {
    try { await c.first().click({ timeout: 4000 }); clicked = true; break; } catch {}
  }
  if (!clicked) throw new Error('Could not open the “Open from this device” menu.');

  // Provide the file to the chooser (primary path) or to a hidden <input type=file> (fallback)
  const chooser = await waitChooser;
  if (chooser) {
    await chooser.setFiles(filePath);
  } else {
    const topInput = this.page.locator('input[type="file"]');
    const frameInput = main.locator('input[type="file"]');
    if (await topInput.count())      await topInput.first().setInputFiles(filePath);
    else if (await frameInput.count()) await frameInput.first().setInputFiles(filePath);
    else throw new Error('No file chooser or <input type=file> found.');
  }

  // If Excel opens the workbook in a new tab, catch/adopt it (no Thread.Sleep)
  const maybeNewPage = await Promise.race([
    this.page.context().waitForEvent('page',  { timeout: 10_000 }).catch(() => null),
    this.page.waitForEvent('popup',           { timeout: 10_000 }).catch(() => null),
  ]);
  if (maybeNewPage) {
    await maybeNewPage.waitForLoadState('domcontentloaded').catch(() => {});
    await maybeNewPage.bringToFront();
    // if you have adoptPage(newPage: Page) in BasePage, use it:
     this.adoptPage?.(maybeNewPage);
  }

  // Robust wait instead of Sleep(10000): wait for the workbook frame to be usable
  await expect(
    this.page.frameLocator('iframe[id^="WacFrame_Excel_"], iframe[title^="Excel"]').locator('body')
  ).toBeVisible({ timeout: 60_000 });
}

// Helper to pick the last Excel tab if no page event fired
private async switchToNewestExcelTab(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const pages = this.page.context().pages().filter(p => !p.isClosed());
    for (let i = pages.length - 1; i >= 0; i--) {
      const p = pages[i];
      try {
        await p.frameLocator('iframe[id^="WacFrame_Excel_"], iframe[title^="Excel"]')
               .locator('body')
               .waitFor({ state: 'visible', timeout: 500 });
        await p.bringToFront();
       
        this.adoptPage?.(p);
        return;
      } catch { /* not the workbook tab */ }
    }
    await this.page.waitForTimeout(250);
  }
  throw new Error('Workbook tab not found after upload.');
}


  // ------------------------- Canvas helpers -------------------------

 
  async selectCanvasCell(cell: string) {
  console.log('Select Canvas cell:', cell);

  await expect(this.mainFrame.locator('body')).toBeVisible({ timeout: 10_000 });
  await expect(this.JetReportInFrame.locator('body')).toBeVisible({ timeout: 20_000 }).catch(() => {});

  const script = process.env.SELECT_CELL_SCRIPT;
  if (!script) {
    console.warn('SELECT_CELL_SCRIPT not set. Provide the script via env/config.');
    return;
  }

  await this.runCellScript(script, cell)
}

async getCanvasTxt(cell: string): Promise<string> {
  console.log('Get Canvas to Txt:', cell);

  await expect(this.mainFrame.locator('body')).toBeVisible({ timeout: 10_000 });
  await expect(this.JetReportInFrame.locator('body')).toBeVisible({ timeout: 20_000 });
  await this.page.waitForTimeout(300);

  const script = process.env.GET_VALUE_CELL_SCRIPT;
  if (!script) {
    console.warn('GET_VALUE_CELL_SCRIPT not set. Provide the script via env/config.');
    return '';
  }

  const result = await this.runCellScript(script, cell)

  if (Array.isArray(result) && result.length > 0) {
    const first = result[0];
    if (Array.isArray(first) && first.length > 0) {
      return String(first[0] ?? 'Empty');
    }
  }
  return typeof result === 'string' ? result : String(result ?? '');
}

async getReportResultCanvasTxt(cell: string): Promise<string> {
  console.log('Get report result Canvas to Txt:', cell);

  await expect(this.mainFrame.locator('body')).toBeVisible({ timeout: 10_000 });
  await this.page.waitForTimeout(300);

  const script = process.env.GET_VALUE_CELL_SCRIPT;
  if (!script) {
    console.warn('GET_VALUE_CELL_SCRIPT not set. Provide the script via env/config.');
    return '';
  }

  const result = await this.runCellScript(script, cell)

  if (Array.isArray(result) && result.length > 0) {
    const first = result[0];
    if (Array.isArray(first) && first.length > 0) {
      return String(first[0] ?? 'Empty');
    }
  }
  return typeof result === 'string' ? result : String(result ?? '');
}

  // ------------------------- Misc -------------------------

  getDriver() {
    // Kept for parity with your original API; Playwright doesn't expose a driver.
    // Prefer returning the Playwright Page.
    console.warn('getDriver() called: returning Playwright Page (not Selenium WebDriver).');
    return this.page;
  }

  async login(v1: string, v2: string) {
    // Use your own LoginPage Playwright POM; stubbed here:
    //await this.page.goto('/');
    const loginPage = new LoginPage(this.page);
    await loginPage.login(v1, v2);
  }

  async clickDesignModeButton() {
    console.log('Click Design Mode button');
    await expect(this.designModeButton).toBeVisible({ timeout: 30_000 });
    await this.designModeButton.click();
  }
}

