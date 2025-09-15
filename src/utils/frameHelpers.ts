import { Page, FrameLocator } from '@playwright/test';

export function frameBySelector(page: Page, selector: string): FrameLocator {
  return page.frameLocator(selector);
}

export async function withinFrame<T>(page: Page, selector: string, fn: (frame: FrameLocator) => Promise<T>): Promise<T> {
  const frame = page.frameLocator(selector);
  return fn(frame);
}
