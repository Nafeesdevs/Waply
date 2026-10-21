# Meta / WhatsApp Cloud API Setup

This document explains every Meta-related credential this backend uses,
where it comes from, and — critically — **which ones are global platform
credentials vs. which ones are customer-specific and must never be
shared across tenants.**

## 1. Global SaaS platform credentials (`.env`)

These belong to **your** Meta App (the SaaS platform itself), created once
in the [Meta Developer Dashboard](https://developers.facebook.com/apps).
They are the same for every customer and are stored only in `.env` /
server environment variables — never in the database, never per-customer.

| Variable | Where it comes from | Purpose |
|---|---|---|
| `META_APP_ID` | Meta Developer Dashboard → Your App → Settings → Basic → App ID | Identifies your app to Meta during OAuth/Embedded Signup |
| `META_APP_SECRET` | Meta Developer Dashboard → Your App → Settings → Basic → App Secret | Used server-side only, to exchange the Embedded Signup `code` for an access token. Never exposed to the frontend. |
| `META_CONFIG_ID` | Meta Developer Dashboard → Your App → WhatsApp → Embedded Signup → Configuration ID | Identifies the Embedded Signup configuration (permissions, business verification requirements) the frontend's Embedded Signup JS SDK should launch |
| `META_VERIFY_TOKEN` | Any string YOU choose | A shared secret you invent and enter both in `.env` and in the Meta Dashboard's Webhook configuration, used to verify webhook subscription requests originate from Meta |
| `META_API_VERSION` | Meta Graph API changelog | Controls which Graph API version all requests use (e.g. `v21.0`). Update this periodically as Meta deprecates old versions — never hardcode it in application code |
| `META_REDIRECT_URI` | The URL your frontend Embedded Signup flow redirects back to | Used during the OAuth code exchange |

**None of these identify or grant access to any individual customer's
WhatsApp account.** They only identify *your app* to Meta.

## 2. Customer-specific data (database, `WhatsAppConnection` table)

Every customer connects their **own** WhatsApp Business Account (WABA)
through Embedded Signup. The following values are unique per customer and
are **stored only in the `WhatsAppConnection` row for that customer** —
never in `.env`, never shared:

| Field | Description |
|---|---|
| `wabaId` | The customer's own WhatsApp Business Account ID, selected/created during their Embedded Signup flow |
| `phoneNumberId` | The specific phone number ID within that WABA the customer registered |
| `businessName` / `displayPhoneNumber` | Human-readable info fetched from Meta about that customer's number, shown back to the customer safely |
| `accessTokenEncrypted` | The customer's own long-lived Meta access token, obtained via `exchangeCodeForToken`, **encrypted at rest with `ENCRYPTION_KEY`**. Never returned in any API response. |

## 3. Why this separation matters

If a customer-specific WABA ID or access token were ever put in `.env`,
**every customer's messages would be sent through that one WhatsApp
number**, breaking multi-tenancy and potentially exposing one customer's
WhatsApp Business Account to every other customer. This backend enforces
the separation by:

- Only ever reading `META_APP_ID` / `META_APP_SECRET` / `META_CONFIG_ID` /
  `META_VERIFY_TOKEN` / `META_API_VERSION` / `META_REDIRECT_URI` from
  `process.env` (see `services/metaService.js`).
- Only ever reading `wabaId`, `phoneNumberId`, and the encrypted access
  token from the authenticated customer's own `WhatsAppConnection`
  database row (see `middleware/apiKeyAuth.js` and
  `controller/messageController.js`).

## 4. Embedded Signup flow, end to end

1. Frontend loads the Meta JS SDK and launches Embedded Signup using
   `META_APP_ID` and `META_CONFIG_ID` (both public/global, safe to expose
   to the frontend as `NEXT_PUBLIC_*`/`VITE_*` style variables if needed).
2. The customer logs into their own Meta/Facebook Business account,
   selects or creates a WhatsApp Business Account and phone number.
3. Meta's SDK returns an authorization `code`, plus the chosen `wabaId`
   and `phoneNumberId`, to the frontend.
4. The frontend calls this backend's `POST /api/whatsapp/connect` with
   `{ code, wabaId, phoneNumberId }`, authenticated as the logged-in
   customer (JWT).
5. The backend exchanges `code` for a business access token using
   `META_APP_ID` + `META_APP_SECRET` (global credentials), fetches the
   WABA/phone number details, subscribes the app to webhook events for
   that WABA, encrypts the token, and stores everything on that
   customer's `WhatsAppConnection` row.
6. From then on, that customer's SaaS API key maps to exactly that
   connection — see `docs/API.md`.

## 5. Webhooks

Configure your Meta App's webhook URL as:

```
https://your-domain.com/api/webhooks/meta
```

with the **Verify Token** set to the same value as `META_VERIFY_TOKEN`.
Subscribe to at minimum the `messages` field. Meta will call
`GET /api/webhooks/meta` once to verify (see `controller/webhookController.js`),
then `POST /api/webhooks/meta` for every event afterward.
