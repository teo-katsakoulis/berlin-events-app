import db from "../db/sqlite";

type TokenRow = {
  user_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
};

export function saveToken(
  userId: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: number
) {
  const stmt = db.prepare(`
    INSERT INTO tokens (user_id, access_token, refresh_token, expires_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      access_token=excluded.access_token,
      refresh_token=excluded.refresh_token,
      expires_at=excluded.expires_at
  `);
  stmt.run(userId, accessToken, refreshToken, expiresAt);
}

export function getTokenRow(userId: string): TokenRow | undefined {
  const stmt = db.prepare("SELECT * FROM tokens WHERE user_id = ?");
  return stmt.get(userId) as TokenRow | undefined;
}
