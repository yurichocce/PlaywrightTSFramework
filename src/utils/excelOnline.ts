// src/utils/jexcelOnline.ts
import { expect, type Page, type Frame, type Locator } from '@playwright/test';

export class ExcelOnline {
  constructor(private page: Page) {}

  // --------------- helpers that return Frame (no FrameLocator here) ---------------
  private hostIframeEl(): Locator {
    return this.page.locator('xpath=//iframe[starts-with(@id,"WacFrame_Excel_") or starts-with(@title,"Excel")]');
  }

  private async hostFrame(): Promise<Frame> {
    const iframeEl = this.hostIframeEl().first();                           // Locator to <iframe>
    await iframeEl.waitFor({ state: 'visible', timeout: 120_000 });
    const handle = await iframeEl.elementHandle();
    const frame = handle && (await handle.contentFrame());                  // Frame | null
    if (!frame) throw new Error('Excel host frame not found');
    return frame;                                                            // ✅ Frame
  }

  private addinIframeEl(host: Frame): Locator {
    return host.locator('iframe.AddinIframe, iframe[title*="Add-in"], iframe[src*="taskpane"]');
  }

  private async paneFrame(
    opts: { ensureOpened?: () => Promise<void>; timeoutMs?: number } = {}
  ): Promise<Frame> {
    const { ensureOpened, timeoutMs = 60_000 } = opts;
    const deadline = Date.now() + timeoutMs;
    let lastErr: unknown;

    while (Date.now() < deadline) {
      const host = await this.hostFrame();                                   // Frame
      const paneEl = this.addinIframeEl(host).first();                       // Locator

      if (!(await paneEl.count()) && ensureOpened) await ensureOpened();

      try {
        await paneEl.waitFor({ state: 'visible', timeout: Math.max(500, Math.min(3000, deadline - Date.now())) });
        const paneHandle = await paneEl.elementHandle();
        const pane = paneHandle && (await paneHandle.contentFrame());        // Frame | null
        if (pane) return pane;                                               // ✅ Frame
        throw new Error('contentFrame() returned null');
      } catch (e) {
        lastErr = e;
        await this.page.waitForTimeout(250);
      }
    }
    throw new Error(`Add-in frame not found within ${timeoutMs} ms. Last error: ${String(lastErr)}`);
  }

  private async ensureOfficeReady(frame: Frame): Promise<void> {
    await frame.waitForFunction(() => {
      const w: any = window;
      return !!w?.Office && !!w?.Excel && !!w?.Office?.onReady;
    }, null, { timeout: 60_000 });
    await frame.evaluate(() => new Promise<void>(res => (window as any).Office.onReady(() => res())));
  }

  // --------------- public APIs (examples) ---------------
  async moveToCell(cell: string, sheet?: string, ensureOpened?: () => Promise<void>) {
    const pane = await this.paneFrame({ ensureOpened });
    await this.ensureOfficeReady(pane);
    const res = await pane.evaluate(async ({ cell, sheet }) => {
      const w: any = window;
      try {
        return w.Excel.run(async (ctx: any) => {
          const ws = sheet ? ctx.workbook.worksheets.getItem(sheet) : ctx.workbook.worksheets.getActiveWorksheet();
          ws.getRange(cell).select();
          await ctx.sync();
          return 'OK';
        });
      } catch (e: any) { return 'Error: ' + (e?.message ?? String(e)); }
    }, { cell, sheet });
    if (res !== 'OK') throw new Error(String(res));
  }

  async getCell(cell: string, sheet?: string, ensureOpened?: () => Promise<void>) {
    const pane = await this.paneFrame({ ensureOpened });
    await this.ensureOfficeReady(pane);
    const values = await pane.evaluate(async ({ cell, sheet }) => {
      const w: any = window;
      return w.Excel.run(async (ctx: any) => {
        const ws = sheet ? ctx.workbook.worksheets.getItem(sheet) : ctx.workbook.worksheets.getActiveWorksheet();
        const r = ws.getRange(cell); r.load('values');
        await ctx.sync();
        return r.values; // [[value]]
      });
    }, { cell, sheet });
    return Array.isArray(values) && Array.isArray(values[0]) ? values[0][0] : values;
  }
}
