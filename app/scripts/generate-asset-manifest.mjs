import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const assetsDir = path.join(appRoot, 'public', 'assets');
const manifestPath = path.join(assetsDir, 'asset-manifest.json');

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
};

const run = async () => {
  try {
    await fs.access(assetsDir);
  } catch {
    console.error(`Assets directory not found: ${assetsDir}`);
    process.exit(1);
  }

  const files = await walk(assetsDir);
  const urls = files
    .map((file) => path.relative(assetsDir, file))
    .filter((relativePath) => relativePath !== 'asset-manifest.json')
    .map((relativePath) => `/assets/${relativePath.replace(/\\/g, '/')}`)
    .sort();

  await fs.writeFile(manifestPath, `${JSON.stringify(urls, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${urls.length} asset entries to ${manifestPath}`);
};

run().catch((error) => {
  console.error('Failed to generate asset manifest:', error);
  process.exit(1);
});
