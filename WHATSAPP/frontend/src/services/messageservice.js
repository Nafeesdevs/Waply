import axios from "axios";
import { SERVER_URL } from "./api";

/**
 * POST /api/v1/whatsapp/messages
 *
 * This is the PUBLIC, external messaging endpoint — the one a developer
 * integrating with Waply would call from their own backend. It is
 * authenticated with a raw SaaS API key (Authorization: Bearer <key>),
 * NEVER the dashboard JWT. We deliberately use a bare axios call here
 * instead of the shared `api` instance so the dashboard token is never
 * sent alongside it.
 *
 * Body: { to, type: 'text' | 'template', message }
 * -> { success, message, messageId }
 */
export const sendTestMessage = async ({ apiKey, to, type = "text", message }) => {
  try {
    const { data } = await axios.post(
      `${SERVER_URL}/api/v1/whatsapp/messages`,
      { to, type, message },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return data;
  } catch (err) {
    const message =
      err?.response?.data?.message || "Unable to send the message. Please try again.";
    throw new Error(message);
  }
};

export default { sendTestMessage };
