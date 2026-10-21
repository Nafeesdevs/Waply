import api from "./api";

const extractMessage = (err, fallback) =>
  err?.response?.data?.message || fallback;

/**
 * GET /api/whatsapp/status
 * -> { connected: false }
 *  | { connected, businessName, displayPhoneNumber, status, connectedAt, disconnectedAt }
 */
export const getWhatsAppStatus = async () => {
  try {
    const { data } = await api.get("/whatsapp/status");
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to check your WhatsApp connection."));
  }
};

/**
 * POST /api/whatsapp/connect
 * Body: { wabaId, phoneNumberId, accessToken } (or { code } instead of accessToken
 * if you have a Meta embedded-signup auth code wired up).
 * -> { message, whatsapp: { wabaId, phoneNumberId, businessName, displayPhoneNumber, status, connectedAt } }
 */
export const connectWhatsApp = async ({ wabaId, phoneNumberId, accessToken, code }) => {
  try {
    const { data } = await api.post("/whatsapp/connect", {
      wabaId,
      phoneNumberId,
      ...(accessToken ? { accessToken } : {}),
      ...(code ? { code } : {}),
    });
    return data;
  } catch (err) {
    throw new Error(
      extractMessage(err, "We couldn't connect your WhatsApp Business account.")
    );
  }
};

/**
 * POST /api/whatsapp/disconnect
 * -> { message }
 */
export const disconnectWhatsApp = async () => {
  try {
    const { data } = await api.post("/whatsapp/disconnect");
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to disconnect WhatsApp. Please try again."));
  }
};

export default { getWhatsAppStatus, connectWhatsApp, disconnectWhatsApp };
