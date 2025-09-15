// src/utils/jetUtility.ts
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

export class JetUtility {
  /**
   * Downloads the manifest from `url` to `localFilePath`.
   * Throws on non-2xx responses.
   */
  static async downloadManifest(url: string, localFilePath: string, logger: (msg: string) => void = console.log) {
    logger(`Download Manifest url: ${url}`);

    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
    }

    const data = await res.arrayBuffer(); // fine for small files like XML manifests
    await mkdir(dirname(localFilePath), { recursive: true });
    await writeFile(localFilePath, Buffer.from(data));
  }
}

// Optional functional export if you prefer calling a function:
export const downloadManifest = JetUtility.downloadManifest;
