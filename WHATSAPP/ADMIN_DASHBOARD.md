# Waply Admin Dashboard — setup guide

## 1. Seed the admin account (backend)
In `backend/.env` set (values are yours to choose):

    ADMIN_EMAIL=admin@yourdomain.com
    ADMIN_PASSWORD=a-strong-password-here

Start the backend (`cd backend && npm install && npm run dev`). On every boot `scripts/seedAdmin.js`
creates the ADMIN user, or promotes + resets the password of the existing user with that email.

## 2. Run the frontend
    cd frontend && npm install && npm run dev      # http://localhost:5173
Log in at `/login` with the admin email/password -> you are redirected to `/admin`.
(Customers are redirected to `/dashboard`; non-admins cannot open `/admin` and the API returns 403.)

## 3. What was added
Backend (all under `/api/admin/*`, ADMIN-only, role re-checked in the DB on every request)
- GET  /admin/analytics?days=7|30|90   KPIs, daily series, endpoints, status classes, heatmap, top customers, errors, latency (avg / p95)
- GET  /admin/usage                    paginated global request log (filters: success, search, days, userId)
- GET  /admin/api-keys                 every key + owner + call counts (hashes never returned)
- PATCH /admin/api-keys/:id/revoke
- GET  /admin/whatsapp                 every WhatsApp connection (tokens never returned)
- PATCH /admin/customers/:id/whatsapp/disconnect
- POST /admin/customers/:id/reset-password   { password }  (min 8 chars)
- GET  /admin/audit                    audit trail (every admin mutation is recorded in the `auditlogs` collection)
- GET  /admin/system                   uptime, DB ping, memory, config checklist, collection sizes
- (existing) /admin/stats, /admin/customers, /admin/customers/:id, /admin/customers/:id/usage, PATCH .../status

Frontend (`frontend/src/component/admin/`)
- AdminDashboard.jsx + AdminDashboard.css   shell: sidebar, topbar, hash routing (#/customers), live refresh, Ctrl/Cmd+K palette
- pages/   Overview, Analytics, Customers, ApiKeys, Logs, WhatsApp, Billing (estimates), Audit, System
- components/   ui.jsx (primitives, toasts, modals), charts.jsx (SVG charts), CustomerDrawer.jsx, CommandPalette.jsx, Confirm.jsx
- services/adminservice.js   new API calls
- index.html   loads the Satoshi font used by the rest of the site

## 4. Notes
- Revenue page is an ESTIMATE (no payment provider exists in the backend): messages x price + connected accounts x platform fee. Rates are editable and saved in the browser.
- No new npm dependencies: uses the `motion`, `lucide-react`, `react-router-dom` packages you already have.
- Requires MongoDB 4.4+ (aggregation `$dateToString` with timezone, `$dayOfWeek`/`$hour` with timezone).
