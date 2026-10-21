import {
  upsertWhatsAppConnection,
  findWhatsAppConnectionSafeByUserId,
  findWhatsAppConnectionByUserId,
  markWhatsAppDisconnected,
} from "../model/whatsappModel.js";
import {
  exchangeCodeForToken,
  getSharedWabaId,
  getWabaPhoneNumbers,
  getWabaDetails,
  getPhoneNumberDetails,
  subscribeAppToWaba,
  sendWhatsAppMessage as sendMetaWhatsAppMessage,
} from "../services/metaService.js";
import { encryptSecret , decryptSecret} from "../utils/crypto.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

/**
 * CONNECT WHATSAPP — completes the Meta Embedded Signup flow.
 *
 * The Meta Embedded Signup JS SDK runs in the customer's browser and,
 * on success, returns to the frontend:
 *   - an authorization `code` (to exchange server-side for a token)
 *   - `wabaId` and `phoneNumberId` chosen/created during signup
 *
 * The frontend forwards these to this endpoint. We NEVER trust a
 * customerId here — the connection is always tied to req.user.id from
 * the verified JWT. If the frontend/embedded-signup flow instead
 * already hands over a long-lived token directly, that is also
 * supported via the optional `accessToken` field for flexibility with
 * different Embedded Signup SDK integration styles.
 */
export const connectWhatsApp = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { code, wabaId, phoneNumberId, accessToken: providedToken } = req.body;

  if (!code && !providedToken) {
    throw new AppError(
      "Either 'code' (Embedded Signup authorization code) or 'accessToken' is required",
      400
    );
  }

  if (!wabaId || !phoneNumberId) {
    throw new AppError("'wabaId' and 'phoneNumberId' are required", 400);
  }

  // Step 1: obtain a business/system-user access token.
  const businessToken = providedToken || (await exchangeCodeForToken(code));

  if (!businessToken) {
    throw new AppError("Failed to obtain access token from Meta", 502);
  }

  // Step 2 (best-effort verification): confirm the WABA is actually
  // reachable with this token, and enrich the connection with the
  // business name / display phone number from Meta.
  let businessName = null;
  let displayPhoneNumber = null;

  try {
    const wabaDetails = await getWabaDetails(wabaId, businessToken);
    businessName = wabaDetails?.name || null;
  } catch (err) {
    // Non-fatal — connection can proceed without the friendly name.
    console.error("Could not fetch WABA details:", err.message);
  }

  try {
    const phoneDetails = await getPhoneNumberDetails(phoneNumberId, businessToken);
    displayPhoneNumber = phoneDetails?.display_phone_number || null;
    businessName = businessName || phoneDetails?.verified_name || null;
  } catch (err) {
    console.error("Could not fetch phone number details:", err.message);
  }

  // Step 3: subscribe our app to this WABA so webhook events (message
  // status, incoming messages) start flowing to us.
  try {
    await subscribeAppToWaba(wabaId, businessToken);
  } catch (err) {
    console.error("Could not subscribe app to WABA:", err.message);
  }

  // Step 4: persist, encrypting the access token at rest. The
  // connection always belongs to the authenticated customer.
  const accessTokenEncrypted = encryptSecret(businessToken);

  const connection = await upsertWhatsAppConnection({
    userId,
    wabaId,
    phoneNumberId,
    businessName,
    displayPhoneNumber,
    accessTokenEncrypted,
  });

  return res.status(201).json({
    message: "WhatsApp connected successfully",
    whatsapp: {
      wabaId: connection.wabaId,
      phoneNumberId: connection.phoneNumberId,
      businessName: connection.businessName,
      displayPhoneNumber: connection.displayPhoneNumber,
      status: connection.status,
      connectedAt: connection.connectedAt,
    },
  });
});

// GET /api/whatsapp/status — safe projection only, never the token.
export const getWhatsAppStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const whatsapp = await findWhatsAppConnectionSafeByUserId(userId);

  if (!whatsapp) {
    return res.status(200).json({ connected: false });
  }

  return res.status(200).json({
    connected: whatsapp.status === "CONNECTED",
    businessName: whatsapp.businessName,
    displayPhoneNumber: whatsapp.displayPhoneNumber,
    status: whatsapp.status,
    connectedAt: whatsapp.connectedAt,
    disconnectedAt: whatsapp.disconnectedAt,
  });
});

// POST /api/whatsapp/disconnect
export const disconnectWhatsApp = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const whatsapp = await findWhatsAppConnectionByUserId(userId);

  if (!whatsapp) {
    throw new AppError("No WhatsApp account connected", 404);
  }

  if (whatsapp.status === "DISCONNECTED") {
    return res.status(200).json({ message: "WhatsApp is already disconnected" });
  }

  await markWhatsAppDisconnected(userId);

  return res.status(200).json({ message: "WhatsApp disconnected successfully" });
});


export const sendWhatsAppTextMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { to, type, message } = req.body;

  // Validate recipient
  if (!to) {
    throw new AppError("'to' is required", 400);
  }

  // Validate message type
  if (!type) {
    throw new AppError("'type' is required", 400);
  }

  if (!["text", "template"].includes(type)) {
    throw new AppError(
      "Supported message types are text and template",
      400
    );
  }

  // Validate message
  if (!message) {
    throw new AppError("'message' is required", 400);
  }

  // Get customer's WhatsApp connection
  const whatsapp = await findWhatsAppConnectionByUserId(userId);

  if (!whatsapp) {
    throw new AppError(
      "WhatsApp account is not connected",
      404
    );
  }

  if (whatsapp.status !== "CONNECTED") {
    throw new AppError(
      "WhatsApp account is disconnected",
      400
    );
  }

  if (!whatsapp.phoneNumberId) {
    throw new AppError(
      "WhatsApp phone number ID is missing",
      400
    );
  }

  if (!whatsapp.accessTokenEncrypted) {
    throw new AppError(
      "WhatsApp access token is missing",
      400
    );
  }

  // Decrypt customer's Meta access token
  const accessToken = decryptSecret(
    whatsapp.accessTokenEncrypted
  );

  if (!accessToken) {
    throw new AppError(
      "Unable to decrypt WhatsApp access token",
      500
    );
  }

  // Send through Meta WhatsApp Cloud API
  const result = await sendMetaWhatsAppMessage({
    phoneNumberId: whatsapp.phoneNumberId,
    accessToken,
    to,
    type,
    message,
  });

  return res.status(200).json({
    success: true,
    message: "WhatsApp message sent successfully",
    data: result,
  });
});