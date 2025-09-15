import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const {
  viewport: _v,            // drop preset viewport
  deviceScaleFactor: _d,   // drop emulation
  isMobile: _m,            // drop emulation
  hasTouch: _t,            // drop emulation
  ...desktopChromeNoEmu
} = devices['Desktop Chrome'];


// ENV selection: ENV=dev | staging (default dev)
const envName = process.env.ENV || 'dev';
const envFile = path.resolve(process.cwd(), `.env.${envName}`);
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: true }); // allow .env to override OS vars
} else {
  console.warn(`Env file not found: ${envFile}. Using defaults from process.env.`);
}

const isHeadless = process.env.HEADLESS !== 'false';
const workers = process.env.PLAYWRIGHT_WORKERS !== undefined
  ? Number(process.env.PLAYWRIGHT_WORKERS)
  : undefined; // undefined lets PW decide
const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const retries = process.env.RETRIES ? Number(process.env.RETRIES) : 0;

// Parse PROJECTS env (e.g., "chromium,firefox")
const selected = (process.env.PROJECTS || '')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

// Define all projects
const allProjects = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: null, launchOptions: { args: ['--start-maximized'] }, }, },
  //{ name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  //{ name: 'webkit',   use: { ...devices['Desktop Safari'] } },
];

// Compute effective projects
const projects = selected.length
  ? allProjects.filter(p => selected.includes(p.name.toLowerCase()))
  : allProjects;

export default defineConfig({
  testDir: './src/tests',
  timeout: 10 * 60 * 1000,
  expect: { timeout: 10 * 1000 },
  fullyParallel: false, //true
  forbidOnly: !!process.env.CI,
  retries,
  workers,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright']
  ],
  use: {
    baseURL,
    headless: isHeadless,
    actionTimeout: 0,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
   projects: [
    {
      name: 'chromium',
      use: {
        ...desktopChromeNoEmu,
        viewport: null, // use window size
        launchOptions: { args: ['--start-maximized'] }, // or '--start-fullscreen'
        headless: process.env.HEADLESS !== 'false',
      },
    },
  ],
});
