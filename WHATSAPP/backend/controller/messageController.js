import { sendWhatsAppMessage } from "../services/metaService.js";
import { decryptSecret } from "../utils/crypto.js";
import { validateSendMessagePayload } from "../validators/messageValidator.js";
import { AppError } from "../utils/AppError.js";

/**
 * POST /api/v1/whatsapp/messages
 *
 * Tenant identity comes ENTIRELY from req.customer / req.whatsapp,
 * both resolved by the apiKeyAuth middleware from the SaaS API key.
 * Nothing in the request body can influence which customer's
 * WhatsApp connection is used.
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { customer, whatsapp } = req;

    if (!whatsapp) {
      req.logUsage?.({ statusCode: 409, success: false, error: "No WhatsApp connection" });
      return res.status(409).json({
        success: false,
        message: "No WhatsApp account is connected for this account",
      });
    }

    if (whatsapp.status !== "CONNECTED") {
      req.logUsage?.({ statusCode: 409, success: false, error: "WhatsApp disconnected" });
      return res.status(409).json({
        success: false,
        message: "WhatsApp connection is not active. Please reconnect WhatsApp.",
      });
    }

    const { to, type, message } = validateSendMessagePayload(req.body);

    let accessToken;
    try {
      accessToken = decryptSecret(whatsapp.accessTokenEncrypted);
    } catch {
      accessToken = null;
    }

    if (!accessToken) {
      req.logUsage?.({ statusCode: 409, success: false, error: "Missing credentials" });
      return res.status(409).json({
        success: false,
        message: "WhatsApp connection credentials are unavailable. Please reconnect WhatsApp.",
      });
    }

    let result;
    try {
      result = await sendWhatsAppMessage({
        phoneNumberId: whatsapp.phoneNumberId,
        accessToken,
        to,
        type,
        message,
      });
    } catch (metaError) {
      const statusCode = metaError.statusCode || 502;
      req.logUsage?.({
        statusCode,
        success: false,
        messageType: type,
        error: metaError.message,
      });
      return res.status(statusCode).json({
        success: false,
        message: "Failed to send message via WhatsApp" + (metaError.message ? `: ${metaError.message}` : "")  ,
        
      });
     console.log("token prefix:", accessToken?.slice(0, 12), "len:", accessToken?.length);
    }

    req.logUsage?.({
      statusCode: 200,
      success: true,
      messageType: type,
      metaMessageId: result.metaMessageId,
    });

    return res.status(200).json({
      success: true,
      message: "WhatsApp message sent successfully",
      messageId: result.metaMessageId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      req.logUsage?.({ statusCode: error.statusCode, success: false, error: error.message });
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};
