import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Smartphone, Search } from "lucide-react";
import { Card, StatCard, Badge, statusTone, Segmented, Avatar, fmtDateTime, EmptyState, Skeleton, stagger, rise, ErrorBanner, useAsync, useToast } from "../components/ui";
import Confirm from "../components/Confirm";
import { listAllWhatsApp, disconnectCustomerWhatsApp } from "../../../services/adminservice";

export default function WhatsAppPage({ ctx }) {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(listAllWhatsApp, []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [target, setTarget] = useState(null);
  const list = data || [];

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return list.filter((c) => (status === "ALL" || c.status === status) && (!n || [c.businessName, c.displayPhoneNumber, c.wabaId, c.owner.email, c.owner.name].some((v) => (v || "").toLowerCase().includes(n))));
  }, [list, q, status]);

  const connected = list.filter((c) => c.status === "CONNECTED").length;

  const disconnect = async () => {
    try {
      await disconnectCustomerWhatsApp(target.owner.id);
      toast.push("WhatsApp account disconnected.");
      reload();
      ctx.reloadAll();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  return (
    <motion.div className="adm-stack" variants={stagger} initial="hidden" animate="show">
      <div className="adm-grid adm-grid--3">
        <StatCard label="Linked accounts" value={list.length} icon={Smartphone} />
        <StatCard label="Connected" value={connected} icon={Smartphone} accent />
        <StatCard label="Disconnected" value={list.length - connected} icon={Smartphone} dark />
      </div>
      <ErrorBanner message={error} onRetry={reload} />
      <Card eyebrow="Meta Cloud API" title="WhatsApp Business connections" subtitle="Access tokens are encrypted and never shown here." flush>
        <div className="adm-toolbar">
          <label className="adm-search"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search business, phone, WABA or owner…" /></label>
          <Segmented id="ws" value={status} onChange={setStatus} options={[{ value: "ALL", label: "All" }, { value: "CONNECTED", label: "Connected" }, { value: "DISCONNECTED", label: "Disconnected" }]} />
        </div>
        {loading && !list.length ? <div className="adm-pad"><Skeleton h={120} r={16} /></div>
          : rows.length === 0 ? <EmptyState icon={Smartphone} title="No connections" text="Customers who link WhatsApp will appear here." />
          : (
            <motion.div className="adm-cards" variants={stagger} initial="hidden" animate="show" key={status + q}>
              {rows.map((c) => (
                <motion.article key={c.id} variants={rise} className="adm-conn" whileHover={{ y: -3 }}>
                  <div className="adm-conn__top">
                    <span className="adm-conn__icon"><Smartphone size={18} /></span>
                    <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                  </div>
                  <h4>{c.businessName || "Unnamed business"}</h4>
                  <p className="mono">{c.displayPhoneNumber || "No number"}</p>
                  <dl className="adm-dl adm-dl--sm">
                    <div><dt>WABA</dt><dd className="mono">{c.wabaId}</dd></div>
                    <div><dt>Phone ID</dt><dd className="mono">{c.phoneNumberId}</dd></div>
                    <div><dt>{c.status === "CONNECTED" ? "Connected" : "Disconnected"}</dt><dd>{fmtDateTime(c.status === "CONNECTED" ? c.connectedAt : c.disconnectedAt)}</dd></div>
                  </dl>
                  <div className="adm-conn__owner"><Avatar name={c.owner.name} size={26} /><span>{c.owner.email}</span></div>
                  {c.status === "CONNECTED" && <button className="adm-btn adm-btn--danger adm-btn--sm adm-btn--block" onClick={() => setTarget(c)}>Disconnect</button>}
                </motion.article>
              ))}
            </motion.div>
          )}
      </Card>
      <Confirm open={Boolean(target)} onClose={() => setTarget(null)} danger title="Disconnect this WhatsApp account?" text={`${target?.owner.email} will lose message-sending until they reconnect. Their stored token is erased.`} confirmLabel="Disconnect" onConfirm={disconnect} />
    </motion.div>
  );
}
