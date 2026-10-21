import { hashApiKey } from "../utils/apiKey.js";
import { findApiKeyByHash, touchApiKeyLastUsed } from "../model/apiKeyModel.js";
import { findUserByIdInternal } from "../model/userModel.js";
import { findWhatsAppConnectionByUserId } from "../model/whatsappModel.js";

/**
 * Authenticates requests to the external SaaS message API using
 * `Authorization: Bearer <SaaS API key>`.
 *
 * On success attaches:
 *   req.apiKey  -> the ApiKey database record (id, keyId, status, ...)
 *   req.customer -> the full User record owning the key
 *   req.whatsapp -> that customer's WhatsAppConnection record (or null)
 *
 * This is the ONLY place tenant identity is derived for the external
 * API — the customer can never influence which tenant is used by
 * passing an id in the request body.
 */
export const apiKeyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Missing or invalid Authorization header",
    });
  }

  const rawKey = authHeader.split(" ")[1];
  if (!rawKey) {
    return res.status(401).json({ success: false, message: "Invalid API key" });
  }

  const keyHash = hashApiKey(rawKey);
  const apiKeyRecord = await findApiKeyByHash(keyHash);

  if (!apiKeyRecord || apiKeyRecord.status !== "ACTIVE") {
    return res.status(401).json({ success: false, message: "Invalid API key" });
  }

  const customer = await findUserByIdInternal(apiKeyRecord.userId);

  if (!customer) {
    return res.status(401).json({ success: false, message: "Invalid API key" });
  }

  if (customer.status === "DEACTIVATED") {
    return res.status(403).json({
      success: false,
      message: "This account has been deactivated",
    });
  }

  const whatsapp = await findWhatsAppConnectionByUserId(customer.id);

  // Best-effort — do not fail the request if this write fails.
  touchApiKeyLastUsed(apiKeyRecord.id).catch(() => {});

  req.apiKey = apiKeyRecord;
  req.customer = customer;
  req.whatsapp = whatsapp;

  next();
};
