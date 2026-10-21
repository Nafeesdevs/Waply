import { AppError } from "../utils/AppError.js";

// Thin wrapper around Meta's Graph API for everything the SaaS platform
// needs from the WhatsApp Cloud API + Embedded Signup flow.
//
// Global SaaS-level credentials (belong to OUR Meta app, not the
// customer) come from environment variables:
//   META_APP_ID, META_APP_SECRET, META_CONFIG_ID,
//   META_VERIFY_TOKEN, META_API_VERSION, META_REDIRECT_URI
//
// Customer-specific values (WABA id, phone number id, access token)
// are never read from env — they are stored per WhatsAppConnection row.

function getApiVersion() {
  return process.env.META_API_VERSION || "v21.0";
}

function getGraphBaseUrl() {
  return `https://graph.facebook.com/${getApiVersion()}`;
}

async function graphFetch(path, { method = "GET", token, body, query } = {}) {
  const url = new URL(`${getGraphBaseUrl()}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new AppError(
      `Unable to reach Meta Graph API: ${networkErr.message}`,
      502
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const metaMessage =
      data?.error?.message || `Meta API request failed (${response.status})`;
    const err = new AppError(metaMessage, 502);
    err.metaError = data?.error || null;
    throw err;
  }

  return data;
}

/**
 * Step of the Embedded Signup flow: exchange the short-lived
 * authorization `code` returned by the Meta JS SDK for a long-lived
 * system-user / business access token, using OUR app's id + secret.
 */
export async function exchangeCodeForToken(code) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !appSecret) {
    throw new AppError(
      "Meta integration is not configured on the server (META_APP_ID/META_APP_SECRET missing)",
      500
    );
  }

  const data = await graphFetch("/oauth/access_token", {
    method: "GET",
    query: {
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    },
  });

  return data.access_token;
}

/**
 * Given a business access token returned by Embedded Signup, discover
 * the WhatsApp Business Account(s) shared with our app, and the phone
 * number(s) attached to it. Embedded Signup normally also delivers the
 * waba_id / phone_number_id directly to the frontend callback; this is
 * used as a server-side fallback/verification step.
 */
export async function getSharedWabaId(businessToken) {
  const data = await graphFetch("/me", {
    method: "GET",
    token: businessToken,
    query: {
      fields: "id",
    },
  });
  return data?.id || null;
}

export async function getWabaPhoneNumbers(wabaId, token) {
  const data = await graphFetch(`/${wabaId}/phone_numbers`, {
    method: "GET",
    token,
  });
  return data?.data || [];
}

export async function getWabaDetails(wabaId, token) {
  const data = await graphFetch(`/${wabaId}`, {
    method: "GET",
    token,
    query: { fields: "id,name,timezone_id" },
  });
  return data;
}

export async function getPhoneNumberDetails(phoneNumberId, token) {
  const data = await graphFetch(`/${phoneNumberId}`, {
    method: "GET",
    token,
    query: { fields: "verified_name,display_phone_number,quality_rating" },
  });
  return data;
}

/**
 * Subscribes our app to receive webhook events for this WABA. Required
 * so incoming messages / status updates start flowing to our webhook.
 */
export async function subscribeAppToWaba(wabaId, token) {
  return graphFetch(`/${wabaId}/subscribed_apps`, {
    method: "POST",
    token,
  });
}

/**
 * Sends a WhatsApp message on behalf of a customer, using that
 * customer's own phoneNumberId + decrypted access token.
 */
export async function sendWhatsAppMessage({
  phoneNumberId,
  accessToken,
  to,
  type,
  message,
}) {
  let payload;

  if (type === "template") {
    payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: message,
    };
  } else {
    payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    };
  }

  const data = await graphFetch(`/${phoneNumberId}/messages`, {
    method: "POST",
    token: accessToken,
    body: payload,
  });

  const metaMessageId = data?.messages?.[0]?.id || null;
  return { metaMessageId, raw: data };
}
