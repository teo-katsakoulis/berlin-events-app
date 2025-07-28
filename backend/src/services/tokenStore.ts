const cacheToken = new Map<string, string>();

export function saveToken(userId: string, token: string): void {
  cacheToken.set(userId, token);
}

export function getToken(userId: string): string | undefined {
  return cacheToken.get(userId);
}
