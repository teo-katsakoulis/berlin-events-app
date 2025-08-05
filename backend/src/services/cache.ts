import db from "../db/sqlite";

interface CacheRow {
  value: string;
  expires_at: number;
}

export function setCache(key: string, value: any, ttlSeconds: number) {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const stmt = db.prepare(`
    INSERT INTO cache (key, value, expires_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at
  `);
  stmt.run(key, JSON.stringify(value), expiresAt);
}

export function getCache<T = any>(key: string): T | null {
  const stmt = db.prepare("SELECT value, expires_at FROM cache WHERE key = ?");
  const row = stmt.get(key) as CacheRow | undefined;

  if (!row) return null;
  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at < now) return null;

  return JSON.parse(row.value);
}

export async function fetchWithCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = getCache<T>(key);
  if (cached) return cached;

  const result = await fetchFn();
  setCache(key, result, ttlSeconds);
  return result;
}
