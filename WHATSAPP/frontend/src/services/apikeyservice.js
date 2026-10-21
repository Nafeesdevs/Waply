import api from "./api";

const extractMessage = (err, fallback) =>
  err?.response?.data?.message || fallback;

/**
 * POST /api/keys
 * Body: { name? }
 * -> { message, apiKey (raw key, shown once), keyId, name }
 */
export const generateApiKey = async (name) => {
  try {
    const { data } = await api.post("/keys", name ? { name } : {});
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to generate an API key."));
  }
};

/**
 * GET /api/keys
 * -> { apiKeys: [{ keyId, name, status, lastUsedAt, revokedAt, createdAt, updatedAt }] }
 */
export const listApiKeys = async () => {
  try {
    const { data } = await api.get("/keys");
    return data.apiKeys || [];
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to load your API keys."));
  }
};

/**
 * DELETE /api/keys/:keyId
 * -> { message }
 */
export const revokeApiKey = async (keyId) => {
  try {
    const { data } = await api.delete(`/keys/${keyId}`);
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to revoke this API key."));
  }
};

/**
 * POST /api/keys/:keyId/regenerate
 * -> { message, apiKey (new raw key, shown once), keyId (new), name }
 */
export const regenerateApiKey = async (keyId) => {
  try {
    const { data } = await api.post(`/keys/${keyId}/regenerate`);
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to regenerate this API key."));
  }
};

export default { generateApiKey, listApiKeys, revokeApiKey, regenerateApiKey };
