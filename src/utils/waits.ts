import { Page, Locator, expect } from '@playwright/test';

export async function waitUntil(predicate: () => Promise<boolean>, timeoutMs = 10000, intervalMs = 200): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await predicate()) return;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`waitUntil timed out after ${timeoutMs}ms`);
}

export async function waitForNetworkIdle(page: Page, idleMs = 500, timeoutMs = 10000): Promise<void> {
  let last = Date.now();
  const listener = () => { last = Date.now(); };
  page.on('request', listener);
  page.on('response', listener);
  try {
    await waitUntil(async () => Date.now() - last >= idleMs, timeoutMs, 100);
  } finally {
    page.off('request', listener);
    page.off('response', listener);
  }
}

export async function safeClick(el: Locator, timeoutMs = 10000): Promise<void> {
  await expect(el).toBeVisible({ timeout: timeoutMs });
  await el.click();
}

export async function typeAndEnter(el: Locator, text: string): Promise<void> {
  await el.fill(text);
  await el.press('Enter');
}
