import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Key, Search, Download } from "lucide-react";
import { Card, StatCard, Badge, statusTone, Segmented, Avatar, fmtNum, timeAgo, fmtDate, downloadCsv, EmptyState, Skeleton, stagger, ErrorBanner, useAsync, useToast } from "../components/ui";
import Confirm from "../components/Confirm";
import { listAllApiKeys, revokeApiKeyAsAdmin } from "../../../services/adminservice";

export default function ApiKeysPage({ ctx }) {
  const toast = useToast();
  const { data: keys = [], loading, error, reload } = useAsync(listAllApiKeys, []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [target, setTarget] = useState(null);

  const list = keys || [];
  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return list.filter(
      (k) =>
        (status === "ALL" || k.status === status) &&
        (!n || k.keyId.toLowerCase().includes(n) || (k.name || "").toLowerCase().includes(n) || k.owner.email.toLowerCase().includes(n) || k.owner.name.toLowerCase().includes(n))
    );
  }, [list, q, status]);

  const active = list.filter((k) => k.status === "ACTIVE").length;
  const stale = list.filter((k) => k.status === "ACTIVE" && (!k.lastUsedAt || Date.now() - new Date(k.lastUsedAt) > 30 * 864e5)).length;

  const revoke = async () => {
    try {
      await revokeApiKeyAsAdmin(target.id);
      toast.push("API key revoked.");
      reload();
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  return (
    <motion.div className="adm-stack" variants={stagger} initial="hidden" animate="show">
      <div className="adm-grid adm-grid--4">
        <StatCard label="Total keys" value={list.length} icon={Key} />
        <StatCard label="Active" value={active} icon={Key} accent />
        <StatCard label="Revoked" value={list.length - active} icon={Key} />
        <StatCard label="Unused 30d+" value={stale} icon={Key} hint="candidates to revoke" dark />
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <Card eyebrow="Security" title="All API keys" subtitle="Raw keys are never stored — only hashes. You can revoke, not view." flush
        action={<button className="adm-btn adm-btn--outline adm-btn--sm" disabled={!rows.length} onClick={() => downloadCsv("api-keys.csv", rows.map((k) => ({ key_id: k.keyId, name: k.name || "", owner: k.owner.email, status: k.status, calls: k.calls, failed: k.failed, last_used: k.lastUsedAt || "", created: k.createdAt })))}><Download size={14} /> Export</button>}>
        <div className="adm-toolbar">
          <label className="adm-search"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search key, name or owner…" /></label>
          <Segmented id="ks" value={status} onChange={setStatus} options={[{ value: "ALL", label: "All" }, { value: "ACTIVE", label: "Active" }, { value: "REVOKED", label: "Revoked" }]} />
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table adm-table--stack">
            <thead><tr><th>Key</th><th>Owner</th><th>Status</th><th>Calls</th><th>Last used</th><th>Created</th><th /></tr></thead>
            <tbody>
              {loading && !list.length ? [0, 1, 2].map((i) => <tr key={i}><td colSpan={7}><Skeleton h={34} /></td></tr>)
                : rows.length === 0 ? <tr><td colSpan={7}><EmptyState icon={Key} title="No keys found" /></td></tr>
                : rows.map((k, i) => (
                  <motion.tr key={k.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                    <td data-label="Key"><strong>{k.name || "Unnamed key"}</strong><br /><span className="mono adm-faint">{k.keyId}</span></td>
                    <td data-label="Owner"><div className="adm-cell-user"><Avatar name={k.owner.name} size={30} /><div><strong>{k.owner.name}</strong><span>{k.owner.email}</span></div></div></td>
                    <td data-label="Status"><Badge tone={statusTone(k.status)}>{k.status}</Badge></td>
                    <td data-label="Calls" className="mono">{fmtNum(k.calls)}{k.failed ? <span className="bad"> · {k.failed} err</span> : null}</td>
                    <td data-label="Last used" className="adm-faint">{timeAgo(k.lastUsedAt)}</td>
                    <td data-label="Created" className="adm-faint">{fmtDate(k.createdAt)}</td>
                    <td data-label="">{k.status === "ACTIVE" && <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => setTarget(k)}>Revoke</button>}</td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Confirm open={Boolean(target)} onClose={() => setTarget(null)} danger title="Revoke this API key?" text={`"${target?.name || target?.keyId}" owned by ${target?.owner.email} will stop working immediately. This cannot be undone.`} confirmLabel="Revoke key" onConfirm={revoke} />
    </motion.div>
  );
}
