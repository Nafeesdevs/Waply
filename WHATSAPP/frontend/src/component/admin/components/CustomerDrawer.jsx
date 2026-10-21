import React, { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { X, Power, KeyRound, Smartphone, Mail, CalendarDays, Activity, CheckCircle2, XCircle, Lock } from "lucide-react";
import { Drawer, Avatar, Badge, statusTone, fmtDate, fmtDateTime, timeAgo, fmtNum, Skeleton, useToast, CountUp } from "./ui";
import { Donut as DonutChart } from "./charts";
import Confirm from "./Confirm";
import {
  getCustomerById,
  getCustomerUsage,
  updateCustomerStatus,
  resetCustomerPassword,
  disconnectCustomerWhatsApp,
  revokeApiKeyAsAdmin,
  listAllApiKeys,
} from "../../../services/adminservice";

export default function CustomerDrawer({ customerId, onClose, onChanged }) {
  const toast = useToast();
  const [customer, setCustomer] = useState(null);
  const [usage, setUsage] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'status' | 'disconnect' | {revoke: id}
  const [pw, setPw] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const load = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const [c, u, allKeys] = await Promise.all([getCustomerById(customerId), getCustomerUsage(customerId), listAllApiKeys()]);
      setCustomer(c);
      setUsage(u);
      setKeys(allKeys.filter((k) => k.owner.id === customerId));
    } catch (e) {
      toast.push(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [customerId, toast]);

  useEffect(() => {
    if (!customerId) return;
    setCustomer(null);
    setUsage(null);
    setPw("");
    load();
  }, [customerId, load]);

  const changed = async () => {
    await load();
    onChanged?.();
  };

  const toggleStatus = async () => {
    const next = customer.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    await updateCustomerStatus(customer.id, next).then(() => toast.push(`${customer.name} is now ${next.toLowerCase()}.`)).catch((e) => toast.push(e.message, "error"));
    await changed();
  };

  const disconnect = async () => {
    await disconnectCustomerWhatsApp(customer.id).then(() => toast.push("WhatsApp disconnected.")).catch((e) => toast.push(e.message, "error"));
    await changed();
  };

  const revoke = async (id) => {
    await revokeApiKeyAsAdmin(id).then(() => toast.push("API key revoked.")).catch((e) => toast.push(e.message, "error"));
    await changed();
  };

  const submitPw = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return toast.push("Password must be at least 8 characters.", "error");
    setPwBusy(true);
    try {
      await resetCustomerPassword(customer.id, pw);
      toast.push("Password reset. Share it with the customer securely.");
      setPw("");
      onChanged?.();
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setPwBusy(false);
    }
  };

  const s = usage?.stats;
  const rate = s?.totalCalls ? Math.round((s.successfulCalls / s.totalCalls) * 1000) / 10 : 0;

  return (
    <>
      <Drawer open={Boolean(customerId)} onClose={onClose}>
        <div className="adm-drawer__head">
          <span className="adm-eyebrow">Customer profile</span>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        {!customer ? (
          <div className="adm-drawer__body"><Skeleton h={80} r={16} /><Skeleton h={140} r={16} /><Skeleton h={200} r={16} /></div>
        ) : (
          <div className="adm-drawer__body">
            <div className="adm-profile">
              <Avatar name={customer.name} size={56} />
              <div>
                <h3>{customer.name}</h3>
                <p><Mail size={13} /> {customer.email}</p>
                <p><CalendarDays size={13} /> Joined {fmtDate(customer.createdAt)}</p>
              </div>
              <Badge tone={statusTone(customer.status)}>{customer.status}</Badge>
            </div>

            <div className="adm-actions">
              <button className={`adm-btn ${customer.status === "ACTIVE" ? "adm-btn--danger" : "adm-btn--emerald"}`} onClick={() => setConfirm("status")}>
                <Power size={15} /> {customer.status === "ACTIVE" ? "Deactivate account" : "Activate account"}
              </button>
              {customer.whatsapp?.status === "CONNECTED" && (
                <button className="adm-btn adm-btn--outline" onClick={() => setConfirm("disconnect")}>
                  <Smartphone size={15} /> Disconnect WhatsApp
                </button>
              )}
            </div>

            <section className="adm-panel">
              <h4>API usage</h4>
              {loading && !s ? <Skeleton h={90} /> : (
                <div className="adm-usage">
                  <DonutChart
                    size={110}
                    thickness={12}
                    segments={[
                      { label: "ok", value: s?.successfulCalls || 0, color: "#10B981" },
                      { label: "failed", value: s?.failedCalls || 0, color: "#D9483B" },
                    ]}
                    center={<><strong>{rate}%</strong><span>ok</span></>}
                  />
                  <div className="adm-usage__nums">
                    <div><b><CountUp value={s?.totalCalls || 0} /></b><span>Total calls</span></div>
                    <div><b className="ok">{fmtNum(s?.successfulCalls)}</b><span>Successful</span></div>
                    <div><b className="bad">{fmtNum(s?.failedCalls)}</b><span>Failed</span></div>
                  </div>
                </div>
              )}
            </section>

            <section className="adm-panel">
              <h4>WhatsApp connection</h4>
              {customer.whatsapp ? (
                <dl className="adm-dl">
                  <div><dt>Status</dt><dd><Badge tone={statusTone(customer.whatsapp.status)}>{customer.whatsapp.status}</Badge></dd></div>
                  <div><dt>Business</dt><dd>{customer.whatsapp.businessName || "—"}</dd></div>
                  <div><dt>Phone</dt><dd>{customer.whatsapp.displayPhoneNumber || "—"}</dd></div>
                  <div><dt>WABA ID</dt><dd className="mono">{customer.whatsapp.wabaId}</dd></div>
                  <div><dt>Phone ID</dt><dd className="mono">{customer.whatsapp.phoneNumberId}</dd></div>
                  <div><dt>Connected</dt><dd>{fmtDateTime(customer.whatsapp.connectedAt)}</dd></div>
                </dl>
              ) : <p className="adm-muted">No WhatsApp account linked.</p>}
            </section>

            <section className="adm-panel">
              <h4>API keys <span className="adm-count">{keys.length}</span></h4>
              {keys.length === 0 ? <p className="adm-muted">This customer has not generated any keys.</p> : (
                <ul className="adm-list adm-list--tight">
                  {keys.map((k) => (
                    <li key={k.id}>
                      <div className="adm-list__main">
                        <strong>{k.name || "Unnamed key"} <span className="mono adm-faint">{k.keyId}</span></strong>
                        <span>{fmtNum(k.calls)} calls · last used {timeAgo(k.lastUsedAt)}</span>
                      </div>
                      {k.status === "ACTIVE" ? (
                        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => setConfirm({ revoke: k.id })}>Revoke</button>
                      ) : <Badge tone="danger">Revoked</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="adm-panel">
              <h4>Recent requests</h4>
              {!usage?.recentUsage?.length ? <p className="adm-muted">No API activity recorded.</p> : (
                <ul className="adm-list adm-list--tight">
                  {usage.recentUsage.slice(0, 8).map((u) => (
                    <li key={u.id}>
                      {u.success ? <CheckCircle2 size={16} className="ok" /> : <XCircle size={16} className="bad" />}
                      <div className="adm-list__main">
                        <strong className="mono">{u.method} {u.endpoint.split("?")[0].replace(/^\/api/, "")}</strong>
                        <span>{u.error || u.messageType || "OK"} · {timeAgo(u.createdAt)}</span>
                      </div>
                      <span className={`adm-code ${u.success ? "" : "is-bad"}`}>{u.statusCode}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="adm-panel">
              <h4><Lock size={14} /> Reset password</h4>
              <form onSubmit={submitPw} className="adm-inline-form">
                <input type="text" className="adm-input" placeholder="New temporary password (min 8 chars)" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" />
                <button className="adm-btn adm-btn--ink" disabled={pwBusy || pw.length < 8}>{pwBusy ? "Saving…" : "Set password"}</button>
              </form>
            </section>
          </div>
        )}
      </Drawer>

      <Confirm
        open={confirm === "status"}
        onClose={() => setConfirm(null)}
        danger={customer?.status === "ACTIVE"}
        title={customer?.status === "ACTIVE" ? "Deactivate this customer?" : "Activate this customer?"}
        text={customer?.status === "ACTIVE" ? "They will be signed out on their next request and cannot log in or use the API until re-activated." : "They will be able to log in and use the API again."}
        confirmLabel={customer?.status === "ACTIVE" ? "Deactivate" : "Activate"}
        onConfirm={toggleStatus}
      />
      <Confirm open={confirm === "disconnect"} onClose={() => setConfirm(null)} danger title="Disconnect WhatsApp?" text="The stored Meta access token is erased. The customer must reconnect to send messages again." confirmLabel="Disconnect" onConfirm={disconnect} />
      <Confirm open={Boolean(confirm?.revoke)} onClose={() => setConfirm(null)} danger title="Revoke this API key?" text="Any integration using this key will immediately stop working. This cannot be undone." confirmLabel="Revoke key" onConfirm={() => revoke(confirm.revoke)} />
    </>
  );
}
