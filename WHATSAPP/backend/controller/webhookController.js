import { findWhatsAppConnectionByPhoneNumberId } from "../model/whatsappModel.js";

// GET /api/webhooks/meta — Meta's webhook subscription verification
// handshake. Meta calls this once when you configure the webhook URL
// in the App Dashboard.
export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

// POST /api/webhooks/meta — receives message status updates (sent,
// delivered, read, failed) and incoming messages from customers'
// connected WhatsApp Business Accounts.
//
// Meta always expects a fast 200 response; we acknowledge immediately
// and process events without ever exposing internal errors back to
// Meta (which could leak details in webhook delivery logs).
export const handleWebhookEvent = async (req, res) => {
  // Acknowledge immediately per Meta's requirements.
  res.sendStatus(200);

  try {
    const entries = req.body?.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        const value = change.value || {};
        const phoneNumberId = value.metadata?.phone_number_id;

        if (!phoneNumberId) continue;

        // Identify which customer this event belongs to via their
        // stored phoneNumberId — never trust any tenant id in the
        // payload itself, since Meta's payload has no notion of our
        // tenants.
        const connection = await findWhatsAppConnectionByPhoneNumberId(phoneNumberId);

        if (!connection) continue;

        // Message status updates: sent / delivered / read / failed
        const statuses = value.statuses || [];
        for (const status of statuses) {
          console.log(
            `[meta-webhook] customer=${connection.userId} message=${status.id} status=${status.status}`
          );
        }

        // Incoming customer messages
        const messages = value.messages || [];
        for (const message of messages) {
          console.log(
            `[meta-webhook] customer=${connection.userId} incoming message from=${message.from} type=${message.type}`
          );
        }
      }
    }
  } catch (error) {
    // Never rethrow — the response has already been sent to Meta.
    console.error("Error processing Meta webhook event:", error.message);
  }
};
