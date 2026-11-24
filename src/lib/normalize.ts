/**
 * Normalizes a player's display name and comparison key to prevent
 * duplicate accounts caused by extra whitespace or casing differences.
 */
export function sanitizePlayerName(rawName: string): string {
  return rawName.trim().replace(/\s+/g, ' ');
}

export function normalizePlayerName(rawName: string): string {
  return sanitizePlayerName(rawName).toLowerCase();
}
