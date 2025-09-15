import { test, expect } from '@playwright/test';
import { loadTestData } from '../utils/testData';
import * as fs from 'fs';
import * as path from 'path';

import ExcelOnlinePage from '../pages/ExcelOnlinePage';
import SettingsPage from '../pages/SettingsPage';
import FunctionWizardPage from '../pages/FunctionWizardPage';
import ReportOptionPage from '../pages/ReportOptionPage';
import ReportStatusPage from '../pages/ReportStatusPage';
import { ExcelOnline } from '../utils/excelOnline';

const BASE_URL = process.env.BASE_URL ?? '';
const USERNAME = process.env.USERNAME ?? '';
const PASSWORD = process.env.PASSWORD ?? '';
const MANIFEST_URL = process.env.MANIFEST_URL ?? '';          // optional (your POM uses local file)
const LOCAL_MANIFEST_FILE = process.env.LOCAL_MANIFEST_FILE ?? ''; // e.g., './src/data/addin/manifest.xml'


test.beforeEach(async ({ page }, testInfo) => {
  const base = testInfo.project.use.baseURL as string | undefined;
  const target = base ?? process.env.BASE_URL;
  if (!target) throw new Error('No BASE_URL set in config.use.baseURL or env.');
  //await page.goto('/');        // resolves against config.use.baseURL
  // OR, if you prefer absolute:
   await page.goto(target);
});

/*
// Helper: load test data from src/data/TestData/<testName>.json
function loadTestData(testName: string): Record<string, any> {
  const safe = testName.replace(/[^\w\-]/g, '_');
  const file = path.resolve(process.cwd(), `src/data/TestData/${safe}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Test data not found: ${file}`);
  }
  const json = JSON.parse(fs.readFileSync(file, 'utf-8'));
  // Optional: allow top-level { dev: {...}, staging: {...} }
  const envName = (process.env.ENV ?? 'dev').toLowerCase();
  if (json && typeof json === 'object' && (json.dev || json.staging)) {
    return json[envName] ?? json.dev ?? json;
  }
  return json;
}
  */

test.describe('SideloaderExcelAddInTests', () => {
  // [Test] ReportOpenAfterRunIsCompleted
  test('ReportOpenAfterRunIsCompleted', async ({ page, context }) => {
    console.log('Start ReportOpenAfterRunIsCompleted');
    const ExcelOnlineP = new ExcelOnlinePage(page);
    const raw = loadTestData(test.info().title);
    const testData = Array.isArray(raw) ? raw[0] : raw;

    // Login & create workbook
    await ExcelOnlineP.login(USERNAME, PASSWORD);
    await ExcelOnlineP.createNewWorkbook();

    // Upload report from local machine (uses file chooser inside POM)
    await page.waitForTimeout(5000);
     ExcelOnlineP.uploadReportFromLocalMachine('CustomerInformationTest');
     


    // Upload add-in (manifest)
    await ExcelOnlineP.uploadAddIn(MANIFEST_URL, LOCAL_MANIFEST_FILE);

    // Settings
    const settings: SettingsPage = await ExcelOnlineP.clickOnSettingsButton();
    await settings.login(USERNAME);
    await settings.setDataSource(testData.DataSource);
    await settings.setCompany(testData.Company);
    await settings.clickOnSaveButton();

    // Run report
    const rep: ReportStatusPage = await ExcelOnlineP.clickOnRunButton();
    const success = await rep.validateMessageReportSuccess();
    expect(success, 'Failed The success message is not shown').toBeTruthy();

    // Open in Excel Online (wait for the new tab)
    const newTabPromise = context.waitForEvent('page');
    await rep.openSuccess();
    const newTab = await newTabPromise.catch(() => null);
    if (newTab) {
      await newTab.waitForLoadState('domcontentloaded');
      await newTab.bringToFront();
    }

    // Ribbon & Settings
    await page.waitForTimeout(20000);
    // If a new tab opened and you actually need to act there, re-instantiate POMs with newTab.
    await ExcelOnlineP.clickOnJetReportRibbon();
    await ExcelOnlineP.clickOnSettingsButton();

    // Validate cell values
    const currentValue = await ExcelOnlineP.getCanvasTxt(testData.Cell1);
    expect(currentValue, 'Error Test Failed').toBe(testData.ValueCell1);
    expect(await ExcelOnlineP.getCanvasTxt(testData.Cell2), 'Error Test Failed').toBe(testData.ValueCell2);

    // Design Mode button + status check
    await ExcelOnlineP.clickDesignModeButton();
    const statusText = await rep.getReportStatus();
    expect(statusText, `Design mode was not successfully enabled. Actual status: '${statusText}'`).toBe('Design Mode');

    // CurrentCell setter/getter parity
    //ExcelOnline.CurrentCell = 'C10';
    const excel = new ExcelOnline(ExcelOnlineP.getDriver());
    await excel.moveToCell(testData.Cell, testData.Sheet);
    //const actualCurrentCellValue = await ExcelOnline.CurrentCell;
    const actualCurrentCellValue =  await excel.getCell(testData.Cell, testData.Sheet);
    expect(actualCurrentCellValue, `Design mode cell C10 is not empty. Actual: '${actualCurrentCellValue}'`).toBe('');
  });

  // [Test] ValidatePendingRunText
  test('ValidatePendingRunText', async ({ page }) => {
    console.log('Start ValidatePendingRunText');

    const ExcelOnlineP = new ExcelOnlinePage(page);
    const raw = loadTestData(test.info().title);
    const testData = Array.isArray(raw) ? raw[0] : raw;
   

    await ExcelOnlineP.login(USERNAME, PASSWORD);
    await ExcelOnlineP.createNewWorkbook();

    // Add Jet reports
    await ExcelOnlineP.uploadAddIn(MANIFEST_URL, LOCAL_MANIFEST_FILE);

    // Open NL function wizard
    const JFX: FunctionWizardPage = await ExcelOnlineP.clickOnFunctionButton();
    await JFX.login(USERNAME);
    await JFX.clickOnNLLookup();

    // Fill out NL formula
     const excel = new ExcelOnline(JFX.getDriver());
    await excel.moveToCell(testData.Cell, testData.Sheet);

    await page.waitForTimeout(2000);
    await JFX.setWhat(testData.What);
    await page.waitForTimeout(10000);
    await JFX.setTable(testData.Table);
    await page.waitForTimeout(5000);
    await JFX.setFields(testData.Field);
    await JFX.clickOnApplyButton();

    // Assert "pending run" text in the target cell
    const pending = await excel.getCell(testData.Cell, testData.Sheet);
    expect(pending, 'Error Test Failed').toBe(testData.MessageCell);
  });

  // [Test] ReportOptionsScreenInDesignModeUI
  test('ReportOptionsScreenInDesignModeUI', async ({ page }) => {
    console.log('Start ReportOptionsScreenInDesignModeUI');

    const ExcelOnline = new ExcelOnlinePage(page);
    const raw = loadTestData(test.info().title);
    const testData = Array.isArray(raw) ? raw[0] : raw;

    await ExcelOnline.login(USERNAME, PASSWORD);
    await ExcelOnline.createNewWorkbook();

    // Add Jet reports
    await ExcelOnline.uploadAddIn(MANIFEST_URL, LOCAL_MANIFEST_FILE);

    // Open Report Options Screen
    const reportOptions: ReportOptionPage = await ExcelOnline.clickOnReportOptionsButton();
    await reportOptions.login(USERNAME);

    // Verify first title not displayed
    expect(await reportOptions.isTitleFirstDisplayed(), 'Title First should NOT be displayed').toBeFalsy();

    // Click Add Option
    await reportOptions.clickAddOptionButton();
    // Now first title visible
    expect(await reportOptions.isTitleFirstDisplayed(), 'Title First should be displayed').toBeTruthy();

    // Enter & verify Title First
    await reportOptions.enterTitleFirst(testData.TitleFirst);
    expect(await reportOptions.getTitleFirst(), 'Title First mismatch').toBe(testData.TitleFirst);

    // Enter & verify Default Value First
    await reportOptions.enterDefaultValueFirst(testData.DefaultValueFirst);
    expect(await reportOptions.getDefaultValueFirst(), 'Default Value First mismatch').toBe(testData.DefaultValueFirst);

    // Add again → second title visible
    await reportOptions.clickAddOptionButton();
    expect(await reportOptions.isTitleFirstDisplayed(), 'Title Second should be displayed').toBeTruthy();

    // Enter & verify Title Second
    await reportOptions.enterTitleSecond(testData.TitleSecond);
    expect(await reportOptions.getTitleSecond(), 'Title Second mismatch').toBe(testData.TitleSecond);

    // Enter & verify Default Value Second
    await reportOptions.enterDefaultValueSecond(testData.DefaultValueSecond);
    expect(await reportOptions.getDefaultValueSecond(), 'Default Value Second mismatch').toBe(testData.DefaultValueSecond);

    // Store first values
    const firstTitle = await reportOptions.getTitleFirst();
    const firstDefaultValue = await reportOptions.getDefaultValueFirst();
    void firstTitle; void firstDefaultValue; // not used later, but kept to mirror original flow

    // Update first title/default value
    await reportOptions.cleanTitleFirst();
    await reportOptions.enterTitleFirst(testData.UpdatedTitleFirst);
    await reportOptions.cleanDefaultValueFirst();
    await reportOptions.enterDefaultValueFirst(testData.UpdatedDefaultValueFirst);

    expect(await reportOptions.getTitleFirst(), 'Updated Title First mismatch').toBe(testData.UpdatedTitleFirst);
    expect(await reportOptions.getDefaultValueFirst(), 'Updated Default Value First mismatch').toBe(testData.UpdatedDefaultValueFirst);

    // Remove options (second, then first) — original called remove first twice
    await reportOptions.clickRemoveOptionFirst();
    await reportOptions.clickRemoveOptionFirst();

    // Verify first title is not displayed
    expect(await reportOptions.isTitleFirstDisplayed(), 'Title First should NOT be displayed after removal').toBeFalsy();
  });
});
