import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Power, Key, Smartphone, Lock, User } from "lucide-react";
import { Card, fmtDateTime, timeAgo, EmptyState, Skeleton, stagger, rise, ErrorBanner, useAsync, Segmented } from "../components/ui";
import { getAuditLog } from "../../../services/adminservice";

const META = {
  CUSTOMER_ACTIVATED: { icon: Power, label: "Activated customer", tone: "good" },
  CUSTOMER_DEACTIVATED: { icon: Power, label: "Deactivated customer", tone: "bad" },
  CUSTOMER_PASSWORD_RESET: { icon: Lock, label: "Reset password", tone: "warn" },
  API_KEY_REVOKED: { icon: Key, label: "Revoked API key", tone: "bad" },
  WHATSAPP_DISCONNECTED: { icon: Smartphone, label: "Disconnected WhatsApp", tone: "bad" },
};

export default function AuditPage() {
  const { data, loading, error, reload } = useAsync(() => getAuditLog(200), []);
  const [filter, setFilter] = useState("ALL");
  const logs = (data || []).filter((l) => filter === "ALL" || l.targetType === filter);

  return (
    <motion.div className="adm-stack" variants={stagger} initial="hidden" animate="show">
      <ErrorBanner message={error} onRetry={reload} />
      <Card eyebrow="Compliance" title="Admin audit trail" subtitle="Every sensitive change made from this dashboard, recorded permanently."
        action={<Segmented id="au" value={filter} onChange={setFilter} options={[{ value: "ALL", label: "All" }, { value: "CUSTOMER", label: "Customers" }, { value: "API_KEY", label: "Keys" }, { value: "WHATSAPP", label: "WhatsApp" }]} />}>
        {loading && !data ? <Skeleton h={200} r={16} /> : logs.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No admin actions yet" text="Activations, revocations and resets will be logged here." />
        ) : (
          <motion.ol className="adm-timeline" variants={stagger} initial="hidden" animate="show" key={filter}>
            {logs.map((l) => {
              const m = META[l.action] || { icon: User, label: l.action, tone: "warn" };
              const Icon = m.icon;
              return (
                <motion.li key={l.id} variants={rise} className={`is-${m.tone}`}>
                  <span className="adm-timeline__dot"><Icon size={14} /></span>
                  <div>
                    <strong>{m.label}</strong>
                    <p><span className="mono">{l.targetLabel || l.targetId}</span> · by {l.adminEmail}</p>
                  </div>
                  <time title={fmtDateTime(l.createdAt)}>{timeAgo(l.createdAt)}</time>
                </motion.li>
              );
            })}
          </motion.ol>
        )}
      </Card>
    </motion.div>
  );
}
