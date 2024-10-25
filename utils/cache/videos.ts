import fs from "fs/promises";
import path from "path";

const CACHE_DB_PATH = path.join(
  process.cwd(),
  "database/cache/videos/cache.json"
);

async function ensureCacheDbExists(): Promise<void> {
  try {
    await fs.access(CACHE_DB_PATH);
  } catch {
    await fs.writeFile(CACHE_DB_PATH, JSON.stringify({}));
  }
}

export async function updateCacheMetadata(cacheKey: string): Promise<void> {
  await ensureCacheDbExists();
  const cacheDb = JSON.parse(await fs.readFile(CACHE_DB_PATH, "utf-8"));
  cacheDb[cacheKey] = { lastAccessed: Date.now() };
  await fs.writeFile(CACHE_DB_PATH, JSON.stringify(cacheDb, null, 2));
}

export async function deleteOldCacheFiles(
  cacheDir: string,
  daysOld: number
): Promise<void> {
  await ensureCacheDbExists();
  const cacheDb = JSON.parse(await fs.readFile(CACHE_DB_PATH, "utf-8"));
  const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

  for (const [key, metadata] of Object.entries(cacheDb)) {
    if ((metadata as { lastAccessed: number }).lastAccessed < cutoffTime) {
      const filePath = path.join(cacheDir, `${key}.webp`);
      try {
        await fs.unlink(filePath);
        delete cacheDb[key];
      } catch {
        // Ignore if file doesn't exist
      }
    }
  }

  await fs.writeFile(CACHE_DB_PATH, JSON.stringify(cacheDb, null, 2));
}
