import mongoose from "../config/db.js";
import { applyJsonTransform } from "../utils/schemaPlugin.js";

const apiKeySchema = new mongoose.Schema(
  {
    keyId: { type: String, required: true, unique: true }, // public, non-secret identifier

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: { type: String, default: null },
    keyHash: { type: String, required: true, unique: true }, // sha-256 of raw key; raw key never stored

    status: { type: String, enum: ["ACTIVE", "REVOKED"], default: "ACTIVE", index: true },

    lastUsedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
applyJsonTransform(apiKeySchema);

export const ApiKey = mongoose.models.ApiKey || mongoose.model("ApiKey", apiKeySchema);

export const createApiKey = async ({ userId, keyId, keyHash, name }) => {
  return ApiKey.create({ userId, keyId, keyHash, name });
};

export const findApiKeyByHash = async (keyHash) => {
  return ApiKey.findOne({ keyHash });
};

export const listApiKeysByUser = async (userId) => {
  return ApiKey.find({ userId })
    .select("keyId name status lastUsedAt revokedAt createdAt updatedAt -_id")
    .sort({ createdAt: -1 })
    .lean();
};

export const findApiKeyByKeyIdForUser = async (userId, keyId) => {
  return ApiKey.findOne({ userId, keyId });
};

export const revokeApiKey = async (id) => {
  return ApiKey.findByIdAndUpdate(
    id,
    { status: "REVOKED", revokedAt: new Date() },
    { new: true }
  );
};

export const touchApiKeyLastUsed = async (id) => {
  return ApiKey.findByIdAndUpdate(id, { lastUsedAt: new Date() }, { new: true });
};
