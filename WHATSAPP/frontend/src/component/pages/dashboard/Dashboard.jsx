import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import {
  getWhatsAppStatus,
  connectWhatsApp,
  disconnectWhatsApp,
} from "../../../services/whatsappservice";
import {
  generateApiKey,
  listApiKeys,
  revokeApiKey,
  regenerateApiKey,
} from "../../../services/apikeyservice";
import { sendTestMessage } from "../../../services/messageservice";
import "../../../styles/shell.css";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

/* ------------------------------- WhatsApp card ------------------------------ */

function WhatsAppCard({ status, loading, error, onConnected, onDisconnected }) {
  const [form, setForm] = useState({ wabaId: "", phoneNumberId: "", accessToken: "" });
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnectError("");
    if (!form.wabaId || !form.phoneNumberId || !form.accessToken) {
      setConnectError("WABA ID, Phone Number ID and Access Token are all required.");
      return;
    }
    setConnecting(true);
    try {
      await connectWhatsApp(form);
      setForm({ wabaId: "", phoneNumberId: "", accessToken: "" });
      onConnected();
    } catch (err) {
      setConnectError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectWhatsApp();
      setConfirmOpen(false);
      onDisconnected();
    } catch (err) {
      setConnectError(err.message);
    } finally {
      setDisconnecting(false);
    }
  };

  const connected = Boolean(status?.connected);

  return (
    <div className="w-card">
      <div className="w-card__head">
        <div>
          <p className="w-eyebrow">Step 1</p>
          <h2 className="w-card__title">WhatsApp Business connection</h2>
          <p className="w-card__subtitle">
            Connect your WhatsApp Business Account (WABA) so Waply can send
            messages on your behalf via the WhatsApp Cloud API.
          </p>
        </div>
        <span className={`w-badge ${connected ? "w-badge--on" : "w-badge--off"}`}>
          <span className="w-badge__dot" />
          {connected ? "Connected" : "Not connected"}
        </span>
      </div>

      {error && <div className="w-alert w-alert--error">{error}</div>}
      {connectError && <div className="w-alert w-alert--error">{connectError}</div>}

      {loading ? (
        <p className="w-hint">Checking connection status…</p>
      ) : connected ? (
        <>
          <div className="w-grid-2">
            <div className="w-field">
              <span className="w-label">Business name</span>
              <p style={{ margin: 0, fontSize: 14.5 }}>{status.businessName || "—"}</p>
            </div>
            <div className="w-field">
              <span className="w-label">Phone number</span>
              <p style={{ margin: 0, fontSize: 14.5 }}>{status.displayPhoneNumber || "—"}</p>
            </div>
            <div className="w-field">
              <span className="w-label">Status</span>
              <p style={{ margin: 0, fontSize: 14.5 }}>{status.status}</p>
            </div>
            <div className="w-field">
              <span className="w-label">Connected at</span>
              <p style={{ margin: 0, fontSize: 14.5 }}>{formatDate(status.connectedAt)}</p>
            </div>
          </div>

          {!confirmOpen ? (
            <button
              type="button"
              className="w-btn w-btn--danger w-btn--sm"
              onClick={() => setConfirmOpen(true)}
            >
              Disconnect WhatsApp
            </button>
          ) : (
            <div className="w-alert w-alert--info" style={{ display: "block" }}>
              <p style={{ margin: "0 0 12px" }}>
                Are you sure you want to disconnect this WhatsApp Business account?
                Your API key will stop being able to send messages.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="w-btn w-btn--outline w-btn--sm"
                  onClick={() => setConfirmOpen(false)}
                  disabled={disconnecting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="w-btn w-btn--danger w-btn--sm"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? "Disconnecting…" : "Yes, disconnect"}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleConnect}>
          <p className="w-hint" style={{ marginBottom: 18 }}>
            Embedded Signup (one-click via Meta) requires a registered Meta
            App ID, which isn't configured on this deployment yet. In the
            meantime, connect manually using the WABA ID, Phone Number ID
            and a system-user access token from{" "}
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--w-ink)", fontWeight: 600 }}
            >
              Meta for Developers
            </a>
            .
          </p>

          <div className="w-grid-2">
            <div className="w-field">
              <label className="w-label" htmlFor="wabaId">
                WhatsApp Business Account ID
              </label>
              <input
                id="wabaId"
                name="wabaId"
                className="w-input"
                placeholder="e.g. 102938475610234"
                value={form.wabaId}
                onChange={handleChange}
              />
            </div>
            <div className="w-field">
              <label className="w-label" htmlFor="phoneNumberId">
                Phone Number ID
              </label>
              <input
                id="phoneNumberId"
                name="phoneNumberId"
                className="w-input"
                placeholder="e.g. 109876543219876"
                value={form.phoneNumberId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="w-field">
            <label className="w-label" htmlFor="accessToken">
              Access token
            </label>
            <input
              id="accessToken"
              name="accessToken"
              type="password"
              className="w-input"
              placeholder="System-user or temporary access token"
              value={form.accessToken}
              onChange={handleChange}
              autoComplete="off"
            />
            <p className="w-hint">
              Stored encrypted at rest. Never shown again after this form.
            </p>
          </div>

          <button type="submit" className="w-btn w-btn--primary" disabled={connecting}>
            {connecting ? "Connecting…" : "Connect WhatsApp"}
          </button>
        </form>
      )}
    </div>
  );
}

/* -------------------------------- API keys card ------------------------------ */

function ApiKeysCard({ keys, loading, error, onChanged }) {
  const [name, setName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [revealed, setRevealed] = useState(null); // { keyId, apiKey, name }
  const [copied, setCopied] = useState(false);
  const [busyKeyId, setBusyKeyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    setActionError("");
    setGenerating(true);
    try {
      const data = await generateApiKey(name.trim() || undefined);
      setRevealed({ keyId: data.keyId, apiKey: data.apiKey, name: data.name });
      setName("");
      onChanged();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (keyId) => {
    setActionError("");
    setBusyKeyId(keyId);
    try {
      await revokeApiKey(keyId);
      onChanged();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyKeyId(null);
    }
  };

  const handleRegenerate = async (keyId) => {
    setActionError("");
    setBusyKeyId(keyId);
    try {
      const data = await regenerateApiKey(keyId);
      setRevealed({ keyId: data.keyId, apiKey: data.apiKey, name: data.name });
      onChanged();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyKeyId(null);
    }
  };

  const copyRevealed = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="w-card">
      <div className="w-card__head">
        <div>
          <p className="w-eyebrow">Step 2</p>
          <h2 className="w-card__title">API keys</h2>
          <p className="w-card__subtitle">
            Use a key to call <code>POST /api/v1/whatsapp/messages</code> from
            your own backend.
          </p>
        </div>
      </div>

      {error && <div className="w-alert w-alert--error">{error}</div>}
      {actionError && <div className="w-alert w-alert--error">{actionError}</div>}

      {revealed && (
        <div className="w-alert w-alert--success" style={{ display: "block" }}>
          <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
            New key generated{revealed.name ? ` — ${revealed.name}` : ""}. Copy it now,
            it won't be shown again.
          </p>
          <div className="w-reveal-box">
            <span style={{ flex: 1 }}>{revealed.apiKey}</span>
            <button type="button" className="w-copy-btn" onClick={copyRevealed} aria-label="Copy key">
              {copied ? "✓" : "⧉"}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate} style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        <input
          className="w-input"
          placeholder="Key name (optional), e.g. Production server"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="w-btn w-btn--emerald" disabled={generating} style={{ flexShrink: 0 }}>
          {generating ? "Generating…" : "Generate key"}
        </button>
      </form>

      {loading ? (
        <p className="w-hint">Loading keys…</p>
      ) : keys.length === 0 ? (
        <div className="w-empty">No API keys yet. Generate one above to get started.</div>
      ) : (
        <div>
          {keys.map((k) => (
            <div className="w-key-row" key={k.keyId}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{k.name || "Unnamed key"}</span>
                  <span
                    className={`w-badge ${k.status === "ACTIVE" ? "w-badge--on" : "w-badge--danger"}`}
                  >
                    <span className="w-badge__dot" />
                    {k.status}
                  </span>
                </div>
                <div className="w-key-meta">
                  <span className="w-key-code">{k.keyId}</span> · created{" "}
                  {formatDate(k.createdAt)} · last used {formatDate(k.lastUsedAt)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="w-btn w-btn--outline w-btn--sm"
                  disabled={busyKeyId === k.keyId}
                  onClick={() => handleRegenerate(k.keyId)}
                >
                  {busyKeyId === k.keyId ? "Working…" : "Regenerate"}
                </button>
                {k.status === "ACTIVE" && (
                  <button
                    type="button"
                    className="w-btn w-btn--danger w-btn--sm"
                    disabled={busyKeyId === k.keyId}
                    onClick={() => handleRevoke(k.keyId)}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Send test message card ----------------------- */

function SendMessageCard({ connected }) {
  const [apiKey, setApiKey] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { ok, text }

  const handleSend = async (e) => {
    e.preventDefault();
    setResult(null);
    if (!apiKey || !to || !message) {
      setResult({ ok: false, text: "API key, recipient number and message are all required." });
      return;
    }
    setSending(true);
    try {
      const data = await sendTestMessage({ apiKey, to, type: "text", message });
      setResult({ ok: true, text: `Sent! Message ID: ${data.messageId}` });
    } catch (err) {
      setResult({ ok: false, text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-card">
      <div className="w-card__head">
        <div>
          <p className="w-eyebrow">Step 3</p>
          <h2 className="w-card__title">Send a test message</h2>
          <p className="w-card__subtitle">
            Paste one of your API keys and send a real WhatsApp text message,
            exactly the way an external app would call your API.
          </p>
        </div>
      </div>

      {!connected && (
        <div className="w-alert w-alert--info">
          Connect WhatsApp above first — sends will fail with a 409 until a
          connection is active.
        </div>
      )}

      {result && (
        <div className={`w-alert ${result.ok ? "w-alert--success" : "w-alert--error"}`}>
          {result.text}
        </div>
      )}

      <form onSubmit={handleSend}>
        <div className="w-field">
          <label className="w-label" htmlFor="apiKey">
            API key
          </label>
          <input
            id="apiKey"
            className="w-input"
            placeholder="wply_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="w-field">
          <label className="w-label" htmlFor="to">
            Recipient phone number
          </label>
          <input
            id="to"
            className="w-input"
            placeholder="e.g. 15551234567 (digits only, no +)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="w-field">
          <label className="w-label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            className="w-textarea"
            placeholder="Hi! This is a test message from Waply."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button type="submit" className="w-btn w-btn--primary" disabled={sending}>
          {sending ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}

/* ----------------------------------- Page ------------------------------------ */

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");

  const [keys, setKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [keysError, setKeysError] = useState("");

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError("");
    try {
      const data = await getWhatsAppStatus();
      setStatus(data);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const fetchKeys = useCallback(async () => {
    setKeysLoading(true);
    setKeysError("");
    try {
      const data = await listApiKeys();
      setKeys(data);
    } catch (err) {
      setKeysError(err.message);
    } finally {
      setKeysLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchKeys();
  }, [fetchStatus, fetchKeys]);

  return (
    <div className="w-shell">
      <Navbar />
      <div className="w-container" style={{ paddingTop: 36, paddingBottom: 64 }}>
        <p className="w-eyebrow">Dashboard</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Connect WhatsApp, get an API key, start sending.
        </h1>
        <p style={{ color: "var(--w-muted)", marginBottom: 32, maxWidth: 620 }}>
          Three steps: connect your WhatsApp Business account, generate an
          API key, then hit our messaging API from your own app.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <WhatsAppCard
            status={status}
            loading={statusLoading}
            error={statusError}
            onConnected={fetchStatus}
            onDisconnected={fetchStatus}
          />
          <ApiKeysCard keys={keys} loading={keysLoading} error={keysError} onChanged={fetchKeys} />
          <SendMessageCard connected={Boolean(status?.connected)} />
        </div>
      </div>
    </div>
  );
}
