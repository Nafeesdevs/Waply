import crypto from "crypto";

// AES-256-GCM encryption used to store sensitive Meta credentials
// (access tokens) at rest. The key is derived from ENCRYPTION_KEY.
// ENCRYPTION_KEY must be a 32+ character secret. We derive a 32 byte
// key from it with sha256 so any length input is safe to use.

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended IV length for GCM

function getKey() {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "ENCRYPTION_KEY is not set. It is required to encrypt/decrypt sensitive credentials."
    );
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plaintext string. Returns a single string in the form
 * "iv:authTag:ciphertext" (all base64), safe to store in a TEXT column.
 */
export function encryptSecret(plainText) {
  if (plainText === null || plainText === undefined) return null;

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(String(plainText), "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/**
 * Decrypts a string produced by encryptSecret. Throws if the payload
 * has been tampered with or the key is wrong.
 */
export function decryptSecret(payload) {
  if (!payload) return null;

  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format");
  }

  const [ivB64, authTagB64, dataB64] = parts;
  const key = getKey();

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
