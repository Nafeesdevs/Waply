import crypto from "crypto";

// SaaS API keys are generated with cryptographically secure randomness.
// The raw key is only ever shown to the customer once (at creation /
// regeneration time). Only a SHA-256 hash of the raw key is persisted.
//
// Raw key format:  wply_<keyId>_<secret>
//   - keyId  : short public identifier, safe to log/display, used to
//              look up API key metadata without needing the secret.
//   - secret : the actual high-entropy secret portion.
//
// Storing a keyId lets us find "which key is this" for admin/list views
// without ever storing or exposing the reversible raw key.

const KEY_PREFIX = "wply";

export function generateKeyId() {
  return crypto.randomBytes(8).toString("hex"); // 16 hex chars
}

export function generateApiKey() {
  const keyId = generateKeyId();
  const secret = crypto.randomBytes(32).toString("base64url"); // 43 chars, high entropy
  const rawKey = `${KEY_PREFIX}_${keyId}_${secret}`;
  const keyHash = hashApiKey(rawKey);

  return { keyId, rawKey, keyHash };
}

export function hashApiKey(rawKey) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Extracts the keyId portion from a raw API key string without
 * validating the secret. Used only to speed up lookups if needed;
 * the source of truth for validity remains the keyHash comparison.
 */
export function parseKeyId(rawKey) {
  if (typeof rawKey !== "string") return null;
  const parts = rawKey.split("_");
  if (parts.length < 3 || parts[0] !== KEY_PREFIX) return null;
  return parts[1];
}
