import React from "react";
import { motion } from "motion/react";
import { Server, Database, Cpu, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Card, StatCard, Skeleton, stagger, ErrorBanner, useAsync, fmtNum, Badge } from "../components/ui";
import { getSystemHealth } from "../../../services/adminservice";

const uptime = (s) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
};

export default function SystemPage() {
  const { data: s, loading, error, reload } = useAsync(getSystemHealth, []);
  if (loading && !s) return <Skeleton h={400} r={20} />;

  const Check = ({ ok, label, value }) => (
    <li>
      {ok ? <CheckCircle2 size={16} className="ok" /> : <XCircle size={16} className="bad" />}
      <span>{label}</span>
      <b>{value}</b>
    </li>
  );

  return (
    <motion.div className="adm-stack" variants={stagger} initial="hidden" animate="show">
      <ErrorBanner message={error} onRetry={reload} />
      {s && (
        <>
          <div className="adm-grid adm-grid--4">
            <StatCard label="API status" value={s.status === "ok" ? 100 : 0} format={() => (s.status === "ok" ? "Healthy" : "Degraded")} icon={Server} dark />
            <StatCard label="Uptime" value={s.uptimeSeconds} format={uptime} icon={Clock} />
            <StatCard label="DB latency" value={s.db.pingMs ?? 0} format={(v) => (s.db.pingMs === null ? "n/a" : `${Math.round(v)}ms`)} icon={Database} accent />
            <StatCard label="Memory (RSS)" value={s.memory.rssMb} format={(v) => `${Math.round(v)} MB`} icon={Cpu} hint={`heap ${s.memory.heapUsedMb}/${s.memory.heapTotalMb} MB`} />
          </div>

          <div className="adm-grid adm-grid--2">
            <Card eyebrow="Runtime" title="Environment" action={<button className="adm-btn adm-btn--outline adm-btn--sm" onClick={reload}><RefreshCw size={13} className={loading ? "spin" : ""} /> Refresh</button>}>
              <dl className="adm-dl">
                <div><dt>Node</dt><dd className="mono">{s.nodeVersion}</dd></div>
                <div><dt>Environment</dt><dd className="mono">{s.environment}</dd></div>
                <div><dt>Database</dt><dd className="mono">{s.db.name} · <Badge tone={s.db.state === "connected" ? "on" : "danger"}>{s.db.state}</Badge></dd></div>
                <div><dt>Server time</dt><dd className="mono">{new Date(s.serverTime).toISOString()}</dd></div>
                <div><dt>Frontend origin</dt><dd className="mono">{s.config.frontendUrl}</dd></div>
                <div><dt>JWT lifetime</dt><dd className="mono">{s.config.jwtExpiresIn}</dd></div>
              </dl>
            </Card>
            <Card eyebrow="Configuration" title="Integration checklist">
              <ul className="adm-checks">
                <Check ok label="Meta API version" value={s.config.metaApiVersion} />
                <Check ok={s.config.metaAppConfigured} label="Meta app credentials" value={s.config.metaAppConfigured ? "Configured" : "Missing"} />
                <Check ok={s.config.webhookVerifyTokenSet} label="Webhook verify token" value={s.config.webhookVerifyTokenSet ? "Set" : "Missing"} />
                <Check ok={s.config.adminSeedConfigured} label="Admin seed (.env)" value={s.config.adminSeedConfigured ? "Configured" : "Not set"} />
              </ul>
            </Card>
          </div>

          <Card eyebrow="Database" title="Collection sizes">
            <div className="adm-grid adm-grid--5">
              {[["Customers", s.counts.users], ["Admins", s.counts.admins], ["API keys", s.counts.keys], ["WhatsApp links", s.counts.conns], ["API log rows", s.counts.usage]].map(([l, v]) => (
                <div key={l} className="adm-mini"><b>{fmtNum(v)}</b><span>{l}</span></div>
              ))}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
}
