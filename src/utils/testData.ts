// src/utils/testData.ts
import fs from 'fs';
import path from 'path';

export function loadTestData(
  testName: string,
  opts?: { envVar?: string; required?: string[] }
): Record<string, any> {
  const envVar = opts?.envVar ?? 'ENV';
  const required = opts?.required ?? [];

  // File name from test title
  const safe = testName.replace(/[^\w\-]/g, '_'); // "ReportOptionsScreenInDesignModeUI" -> same
  const file = path.resolve(process.cwd(), `src/data/TestData/${safe}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Test data not found: ${file}`);
  }

  // Parse
  let json: any;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    throw new Error(`Invalid JSON in ${file}: ${(e as Error).message}`);
  }

  // Env selection (supports { dev: {...}, staging: {...} } or flat)
  const envName = (process.env[envVar] ?? 'dev').toLowerCase();
  const payload =
    json && typeof json === 'object' && (json.dev || json.staging)
      ? (json[envName] ?? json.dev ?? json)
      : json;

  // Validate required keys
  for (const key of required) {
    if (payload[key] === undefined) {
      const keys = Object.keys(payload ?? {});
      throw new Error(
        `Missing key "${key}" in ${file}${json.dev || json.staging ? ` (env="${envName}")` : ''}. ` +
        `Available keys: ${keys.join(', ') || '(none)'}`
      );
    }
  }

  // Helpful one-time debug (optional)
  if (process.env.DEBUG_TESTDATA === '1') {
    // eslint-disable-next-line no-console
    console.log(`[testData] file=${file} env=${envName} keys=${Object.keys(payload).join(',')}`);
  }

  return payload;
}
