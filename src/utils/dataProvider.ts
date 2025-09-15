import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

export function* jsonData<T = any>(filePath: string): Generator<T> {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  if (Array.isArray(data)) {
    for (const item of data) yield item as T;
  } else {
    yield data as T;
  }
}

export function csvData<T = any>(filePath: string): T[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return parse(raw, { columns: true, skip_empty_lines: true }) as T[];
}

export function xlsxData<T = any>(filePath: string, sheetName?: string): T[] {
  const wb = XLSX.read(fs.readFileSync(filePath));
  const sheet = sheetName ?? wb.SheetNames[0];
  const json = XLSX.utils.sheet_to_json<T>(wb.Sheets[sheet], { defval: null });
  return json;
}
