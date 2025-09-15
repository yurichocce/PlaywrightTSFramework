import { Page, FrameLocator, expect } from '@playwright/test';
import PlatformLoginPage from './PlatformLoginPage';

export default class ReportOptionPage extends PlatformLoginPage {
  constructor(page: Page) {
    super(page);
  }

  // --- Frames (adjust selectors if your app differs) ---
  //private mainFrame(): FrameLocator {
//    return this.page.frameLocator('#WacFrame_Excel_0');
 // }
 // private addinFrame(): FrameLocator {
    // Report Options UI typically lives inside the add-in pane
   // return this.page.frameLocator('.AddinIframe');
  //}

  // --- Locators (scoped to add-in frame) ---
  private get addOptionButton() {
  return this.ReportOptionInFrame.locator('label:has-text("Add option")');
}

private get titleFirstInput()         { return this.ReportOptionInFrame.locator('label:has-text("Title") + input').first(); }
private get defaultValueFirstInput()  { return this.ReportOptionInFrame.locator('label:has-text("Default Value") + input').first(); }
private get titleSecondInput()        { return this.ReportOptionInFrame.locator('label:has-text("Title") + input').nth(1); }
private get defaultValueSecondInput() { return this.ReportOptionInFrame.locator('label:has-text("Default Value") + input').nth(1); }

// If “Remove option” is not a button in your DOM:
private get removeOptionFirst()  { return this.ReportOptionInFrame.locator('label:has-text("Remove option")').first(); }
private get removeOptionSecond() { return this.ReportOptionInFrame.locator('label:has-text("Remove option")').nth(1); }

// If you need to click the labels themselves:
private get titleFirstLabel()  { return this.ReportOptionInFrame.locator('label:has-text("Title")').first(); }
private get titleSecondLabel() { return this.ReportOptionInFrame.locator('label:has-text("Title")').nth(1); }


/*
  private titleFirstLabel = this.ReportOptionInFrame.locator('xpath=(//label[.="Title"])[1]');
  private titleFirstInput = this.ReportOptionInFrame.locator('xpath=(//label[.="Title"])[1]/following-sibling::input');
  private defaultValueFirstInput = this.ReportOptionInFrame.locator('xpath=(//label[.="Default Value"])[1]/following-sibling::input');
  private removeOptionFirst = this.ReportOptionInFrame.locator('xpath=(//label[.="Remove option"])[1]');

  private titleSecondLabel = this.ReportOptionInFrame.locator('xpath=(//label[.="Title"])[2]');
  private titleSecondInput = this.ReportOptionInFrame.locator('xpath=(//label[.="Title"])[2]/following-sibling::input');
  private defaultValueSecondInput = this.ReportOptionInFrame.locator('xpath=(//label[.="Default Value"])[2]/following-sibling::input');
  private removeOptionSecond = this.ReportOptionInFrame.locator('xpath=(//label[.="Remove option"])[2]');
*/
  // Ensure the Report Options UI (addin frame) is visible before actions
  private async ensureReportOptionsVisible() {
    await expect(this.mainFrame.locator('body')).toBeVisible({ timeout: 10_000 });
    await expect(this.ReportOptionInFrame.locator('body')).toBeVisible({ timeout: 120_000 });
  }

  // ---------------- Actions ----------------

  async clickAddOptionButton(): Promise<void> {
    console.log('Click on Add Option Button');

    const reportF = this.ReportOptionInFrame;

    await this.ensureReportOptionsVisible();
    //wait this.addOptionButton.click();
    await reportF.locator('label:has-text("Add option")').click();
  }

  async isTitleFirstDisplayed(): Promise<boolean> {
    console.log('Check if Title First is displayed');
    await this.ensureReportOptionsVisible();
    return this.titleFirstLabel.isVisible();
  }

  async enterTitleFirst(title: string): Promise<void> {
    console.log('Enter Title First:', title);
    await this.ensureReportOptionsVisible();
    await this.titleFirstInput.fill(title);
  }

  async cleanTitleFirst(): Promise<void> {
    console.log('Clean Title First');
    await this.ensureReportOptionsVisible();
    // Equivalent of Ctrl+A + Delete
    await this.titleFirstInput.click();
    await this.titleFirstInput.press('ControlOrMeta+a');
    await this.titleFirstInput.press('Delete');
  }

  async getTitleFirst(): Promise<string> {
    console.log('Get Title First');
    await this.ensureReportOptionsVisible();
    return this.titleFirstInput.inputValue();
  }

  async enterDefaultValueFirst(defaultValue: string): Promise<void> {
    console.log('Enter Default Value First:', defaultValue);
    await this.ensureReportOptionsVisible();
    await this.defaultValueFirstInput.fill(defaultValue);
  }

  async cleanDefaultValueFirst(): Promise<void> {
    console.log('Clean Default Value First');
    await this.ensureReportOptionsVisible();
    await this.defaultValueFirstInput.click();
    await this.defaultValueFirstInput.press('ControlOrMeta+a');
    await this.defaultValueFirstInput.press('Delete');
  }

  async getDefaultValueFirst(): Promise<string> {
    console.log('Get Default Value First');
    await this.ensureReportOptionsVisible();
    return this.defaultValueFirstInput.inputValue();
  }

  async clickRemoveOptionFirst(): Promise<void> {
    console.log('Click on Remove Option First');
    await this.ensureReportOptionsVisible();
    await this.removeOptionFirst.click();
  }

  async isTitleSecondDisplayed(): Promise<boolean> {
    console.log('Check if Title Second is displayed');
    await this.ensureReportOptionsVisible();
    return this.titleSecondLabel.isVisible();
  }

  async enterTitleSecond(title: string): Promise<void> {
    console.log('Enter Title Second:', title);
    await this.ensureReportOptionsVisible();
    await this.titleSecondInput.fill(title);
  }

  async cleanTitleSecond(): Promise<void> {
    console.log('Clean Title Second');
    await this.ensureReportOptionsVisible();
    await this.titleSecondInput.click();
    await this.titleSecondInput.press('ControlOrMeta+a');
    await this.titleSecondInput.press('Delete');
  }

  async getTitleSecond(): Promise<string> {
    console.log('Get Title Second');
    await this.ensureReportOptionsVisible();
    return this.titleSecondInput.inputValue();
  }

  async enterDefaultValueSecond(defaultValue: string): Promise<void> {
    console.log('Enter Default Value Second:', defaultValue);
    await this.ensureReportOptionsVisible();
    await this.defaultValueSecondInput.fill(defaultValue);
  }

  async cleanDefaultValueSecond(): Promise<void> {
    console.log('Clean Default Value Second');
    await this.ensureReportOptionsVisible();
    await this.defaultValueSecondInput.click();
    await this.defaultValueSecondInput.press('ControlOrMeta+a');
    await this.defaultValueSecondInput.press('Delete');
  }

  async getDefaultValueSecond(): Promise<string> {
    console.log('Get Default Value Second');
    await this.ensureReportOptionsVisible();
    return this.defaultValueSecondInput.inputValue();
  }

  async clickRemoveOptionSecond(): Promise<void> {
    console.log('Click on Remove Option Second');
    await this.ensureReportOptionsVisible();
    await this.removeOptionSecond.click();
  }

  // Parity helper with Selenium API
  getDriver(): Page {
    console.warn('getDriver(): returning Playwright Page (no Selenium WebDriver).');
    return this.page;
  }
}
