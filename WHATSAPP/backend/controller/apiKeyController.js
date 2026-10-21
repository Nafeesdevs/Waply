import {
  createApiKey,
  listApiKeysByUser,
  findApiKeyByKeyIdForUser,
  revokeApiKey,
} from "../model/apiKeyModel.js";
import { generateApiKey } from "../utils/apiKey.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

// POST /api/keys — generate a new SaaS API key for the authenticated customer.
export const generateKey = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body || {};

  const { keyId, rawKey, keyHash } = generateApiKey();

  await createApiKey({ userId, keyId, keyHash, name: name || null });

  // The raw key is only ever shown here, at creation time.
  return res.status(201).json({
    message: "API key generated successfully. Store it securely — it will not be shown again.",
    apiKey: rawKey,
    keyId,
    name: name || null,
  });
});

// GET /api/keys — list metadata only, never the raw key or its hash.
export const listKeys = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const keys = await listApiKeysByUser(userId);
  return res.status(200).json({ apiKeys: keys });
});

// DELETE /api/keys/:keyId — revoke a key. Scoped to req.user.id so a
// customer can never revoke another customer's key by guessing an id.
export const revokeKey = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { keyId } = req.params;

  const key = await findApiKeyByKeyIdForUser(userId, keyId);

  if (!key) {
    throw new AppError("API key not found", 404);
  }

  if (key.status === "REVOKED") {
    return res.status(200).json({ message: "API key is already revoked" });
  }

  await revokeApiKey(key.id);

  return res.status(200).json({ message: "API key revoked successfully" });
});

// POST /api/keys/:keyId/regenerate — revoke the old key and issue a new
// one in a single call, preserving the same display name.
export const regenerateKey = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { keyId } = req.params;

  const existingKey = await findApiKeyByKeyIdForUser(userId, keyId);

  if (!existingKey) {
    throw new AppError("API key not found", 404);
  }

  if (existingKey.status === "ACTIVE") {
    await revokeApiKey(existingKey.id);
  }

  const { keyId: newKeyId, rawKey, keyHash } = generateApiKey();

  await createApiKey({
    userId,
    keyId: newKeyId,
    keyHash,
    name: existingKey.name,
  });

  return res.status(201).json({
    message: "API key regenerated successfully. Store it securely — it will not be shown again.",
    apiKey: rawKey,
    keyId: newKeyId,
    name: existingKey.name,
  });
});
