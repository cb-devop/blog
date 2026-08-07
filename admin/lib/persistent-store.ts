import fs from "fs";
import path from "path";

// Settings persistence helper.
//
// Settings used to live only in memory, which meant every server restart
// (or Next.js dev HMR) wiped them back to defaults. This writes a small
// JSON file to <app>/data/ so settings survive restarts.
//
// If the file system is unavailable (e.g. an edge runtime), it degrades
// gracefully to in-memory only.

function dataDir(): string {
  return path.join(process.cwd(), "data");
}

function filePath(filename: string): string {
  return path.join(dataDir(), filename);
}

// Load a JSON file, merged over the given fallback (so newly added fields
// get sensible defaults even if the file was written by an older version).
export function loadJsonFile<T extends object>(filename: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath(filename))) return fallback;
    const raw = fs.readFileSync(filePath(filename), "utf-8");
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...fallback, ...parsed };
  } catch (err) {
    console.warn(`[persistent-store] Failed to load ${filename}, using defaults:`, err);
    return fallback;
  }
}

// Write a JSON file (creates the data dir if needed). Failures are logged
// but never thrown, so a disk hiccup can't take down a request.
//
// Uses a temp-file + rename so a crash mid-write can never corrupt the
// settings file (otherwise the next load would fall back to defaults and
// silently lose everything — exactly what this store is meant to prevent).
export function saveJsonFile(filename: string, data: unknown): void {
  try {
    fs.mkdirSync(dataDir(), { recursive: true });
    const target = filePath(filename);
    const tmp = `${target}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tmp, target);
  } catch (err) {
    console.error(`[persistent-store] Failed to save ${filename}:`, err);
  }
}
