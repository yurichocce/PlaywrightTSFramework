// utils/switchLastTab.ts
import type { Page } from '@playwright/test';

/** Switch to the most recently opened tab in the same context. Returns that Page. */
export async function switchLastWindowTab(currentPage: Page): Promise<Page> {
  const context = currentPage.context();
  const pages = context.pages().filter(p => !p.isClosed());
  if (pages.length === 0) throw new Error('No pages in context.');

  const last = pages[pages.length - 1];
  await last.bringToFront();
  await last.waitForLoadState('domcontentloaded').catch(() => {});
  return last;
}
