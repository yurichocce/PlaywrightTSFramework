import { Page, FrameLocator, Locator, expect } from '@playwright/test';
import { waitForNetworkIdle, safeClick, waitUntil } from '../utils/waits';

export default class BasePage {
  protected page: Page;
  constructor(page: Page) { 
    if (!page) {
      throw new Error (
        'BasePage: `page` is undefined. Did you pass the Playwright fixture variable (async ({ page }) => {...})?'
      )
    }
    this.page = page;
   }

  protected get mainFrame(): FrameLocator  { return this.page.frameLocator('iframe[name="WacFrame_Excel_0"]'); }
  protected get addinFrame(): FrameLocator { return this.mainFrame.frameLocator('.AddinIframe'); }
  protected get modalFrame(): FrameLocator { return this.mainFrame.frameLocator('#InsertDialog'); }
  protected get ReportOptionInFrame(): FrameLocator{ return this.mainFrame.frameLocator('iframe[title="Office Add-in Report Options"]')};
  protected get FunctionWizardInFrame(): FrameLocator{ return this.mainFrame.frameLocator('iframe[title="Office Add-in Function Wizard"]')};
  protected get JetReportInFrame(): FrameLocator{ return this.mainFrame.frameLocator('iframe[title="Office Add-in Jet Reports"]')};

  iframe(selector: string): FrameLocator { return this.page.frameLocator(selector); }
  loc(selector: string): Locator { return this.page.locator(selector); }

  async goto(url: string) { await this.page.goto(url); }
  async waitVisible(selector: string) { await expect(this.page.locator(selector)).toBeVisible(); }
  async click(selector: string) { await safeClick(this.page.locator(selector)); }
  async networkIdle(idleMs = 500, timeoutMs = 10000) { await waitForNetworkIdle(this.page, idleMs, timeoutMs); }
  async waitUntil(predicate: () => Promise<boolean>, timeoutMs = 10000, intervalMs = 200) { await waitUntil(predicate, timeoutMs, intervalMs); }

  protected runCellScript(script: string, cell: string) {
  return this.page.evaluate(
    ({ s, c }) => {
      const fn = new Function('cell', s as string);
      return Promise.resolve(fn(c as string));
    },
    { s: script, c: cell }
  );
  }

 /** Allow adopting a newly opened tab */
  protected adoptPage(newPage: Page) { this.page = newPage; }

  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async sleep(ms: number) { await this.page.waitForTimeout(ms); }

  async switchLastWindowTab(): Promise<void> {
  const pages = this.page.context().pages().filter(p => !p.isClosed());
  if (pages.length === 0) throw new Error('No pages in context.');

  const last = pages[pages.length - 1];
  await last.bringToFront();
  await last.waitForLoadState('domcontentloaded').catch(() => {});
  // if you have adoptPage(newPage: Page) to update `this.page`
    
  this.adoptPage ? this.adoptPage(last) : (this.page = last);
}
  
}
