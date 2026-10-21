# Waply SaaS Backend — API Documentation

Base URL (local): `http://localhost:5000`

All request/response bodies are JSON. Authenticated dashboard endpoints
use `Authorization: Bearer <JWT>`. The external message API uses
`Authorization: Bearer <SaaS API key>` — a completely different, customer
generated credential (see [API keys](#api-keys)).

---

## Authentication

### Register

```
POST /api/auth/register
```

```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```

Response `201`:

```json
{
  "message": "Registration successful",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "CUSTOMER", "status": "ACTIVE" }
}
```

Every account registered through this endpoint is created as `CUSTOMER`.
Admin accounts are never created here (see the Admin section below).

### Login

```
POST /api/auth/login
```

```json
{ "email": "jane@example.com", "password": "secret123" }
```

Response `200`:

```json
{
  "message": "Login successful",
  "token": "<JWT>",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "CUSTOMER", "status": "ACTIVE" }
}
```

### Current user

```
GET /api/auth/me
Authorization: Bearer <JWT>
```

Response `200`: `{ "user": { ... } }`. Identity always comes from the
verified JWT — never from a client-supplied id.

---

## WhatsApp connection (customer-scoped)

All routes below require `Authorization: Bearer <JWT>` for a `CUSTOMER`
account, and always operate on the authenticated customer's own
connection.

### Connect (Embedded Signup)

```
POST /api/whatsapp/connect
```

```json
{ "code": "AQD...", "wabaId": "1234567890", "phoneNumberId": "9876543210" }
```

Response `201`:

```json
{
  "message": "WhatsApp connected successfully",
  "whatsapp": {
    "wabaId": "1234567890",
    "phoneNumberId": "9876543210",
    "businessName": "Example Business",
    "displayPhoneNumber": "+971XXXXXXXXX",
    "status": "CONNECTED",
    "connectedAt": "2026-09-05T12:00:00.000Z"
  }
}
```

The Meta access token is never present in this or any other response.

### Status

```
GET /api/whatsapp/status
```

Response `200`:

```json
{
  "connected": true,
  "businessName": "Example Business",
  "displayPhoneNumber": "+971XXXXXXXXX",
  "status": "CONNECTED",
  "connectedAt": "2026-09-05T12:00:00.000Z",
  "disconnectedAt": null
}
```

### Disconnect

```
POST /api/whatsapp/disconnect
```

Response `200`: `{ "message": "WhatsApp disconnected successfully" }`.
After this, any SaaS API key belonging to this customer will fail with
`409 Conflict` on the message API until reconnected.

---

## API keys

Customer-scoped, require `Authorization: Bearer <JWT>`.

### Generate

```
POST /api/keys
```

```json
{ "name": "Production key" }
```

Response `201`:

```json
{
  "message": "API key generated successfully. Store it securely — it will not be shown again.",
  "apiKey": "wply_ab12cd34ef56gh78_<secret>",
  "keyId": "ab12cd34ef56gh78",
  "name": "Production key"
}
```

The raw key is shown **only once**. Only its SHA-256 hash is stored.

### List

```
GET /api/keys
```

Returns metadata only (`keyId`, `name`, `status`, `lastUsedAt`, `createdAt`, ...) — never the raw key or its hash.

### Revoke

```
DELETE /api/keys/:keyId
```

### Regenerate

```
POST /api/keys/:keyId/regenerate
```

Revokes the existing key and returns a brand-new raw key under the same name.

---

## External message API

This is the API your customers call **from their own applications**.

```
POST /api/v1/whatsapp/messages
Authorization: Bearer <SaaS API key>
Content-Type: application/json
```

```json
{ "to": "919876543210", "type": "text", "message": "Hello from my application" }
```

For template messages, set `"type": "template"` and pass the WhatsApp
template object as `message` (`{ name, language, components }`).

### Success — `200`

```json
{
  "success": true,
  "message": "WhatsApp message sent successfully",
  "messageId": "wamid.META_MESSAGE_ID"
}
```

### Errors

| Condition | Status |
|---|---|
| Missing/invalid API key | `401 Unauthorized` |
| Customer account deactivated | `403 Forbidden` |
| WhatsApp not connected / disconnected | `409 Conflict` |
| Invalid request body (`to`, `type`, `message`) | `400 Bad Request` |
| Meta API failure | `502 Bad Gateway` |

Every call is recorded in the API usage log (see the Admin section).

---

## Admin

All routes require `Authorization: Bearer <JWT>` for an `ADMIN` account.
Admin accounts are only created via the environment-driven seed process
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`) — never through public registration.

### List customers

```
GET /api/admin/customers
```

### Customer details

```
GET /api/admin/customers/:id
```

Never includes password hashes, API key hashes, or Meta access tokens.

### Activate / deactivate

```
PATCH /api/admin/customers/:id/status
```

```json
{ "status": "DEACTIVATED" }
```

### Customer usage

```
GET /api/admin/customers/:id/usage
```

Returns aggregate stats plus the last 100 API usage log entries.

### Platform statistics

```
GET /api/admin/stats
```

```json
{
  "totalCustomers": 42,
  "activeCustomers": 39,
  "deactivatedCustomers": 3,
  "connectedWhatsAppAccounts": 30,
  "disconnectedWhatsAppAccounts": 12,
  "totalApiCalls": 10234,
  "successfulApiCalls": 9980,
  "failedApiCalls": 254,
  "totalWhatsAppMessages": 8500
}
```

---

## Webhooks (Meta)

### Verification

```
GET /api/webhooks/meta?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
```

Responds with the raw `hub.challenge` value if the verify token matches
`META_VERIFY_TOKEN`, otherwise `403`.

### Events

```
POST /api/webhooks/meta
```

Always responds `200` immediately (per Meta's requirements), then
processes message status updates (`sent`/`delivered`/`read`/`failed`)
and incoming messages, attributing each event to the correct customer
via their stored `phoneNumberId`.

---

## Tenant isolation

Every customer-scoped endpoint derives identity from the verified JWT
(`req.user.id`) or the validated SaaS API key (`req.customer`,
`req.whatsapp`) — never from any `customerId`/`userId` field the client
might include in a request body or query string. Admin endpoints require
`role = ADMIN` and can view/act on any customer by database id.
