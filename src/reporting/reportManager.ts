import { test as base } from '@playwright/test';

export const test = base.extend({});

export const ReportManager = {
  step: async (title: string, fn: () => Promise<void> | void) => {
    return await base.step(title, async () => { await Promise.resolve(fn()); });
  }
};
