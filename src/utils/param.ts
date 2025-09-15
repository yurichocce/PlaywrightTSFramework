import { test as base } from '@playwright/test';

export function dataTest<T>(title: string, dataset: T[], fn: (row: T) => void) {
  for (const [i, row] of dataset.entries()) {
    base(`${title} [${i+1}]`, async () => { await fn(row); });
  }
}
