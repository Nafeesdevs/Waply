import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search, Download, CheckCircle2, XCircle, ScrollText } from "lucide-react";
import { Card, Segmented, fmtDateTime, downloadCsv, EmptyState, Skeleton, stagger, ErrorBanner, Pagination, useAsync, fmtNum } from "../components/ui";
import { getGlobalUsage } from "../../../services/adminservice";

export default function LogsPage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [success, setSuccess] = useState("");
  const [range, setRange] = useState("7");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(q); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const { data, loading, error, reload } = useAsync(
    () => getGlobalUsage({ page, limit: 20, search: debounced || undefined, success: success || undefined, days: range === "all" ? undefined : range }),
    [page, debounced, success, range]
  );
  const rows = data?.rows || [];

  return (
    <motion.div className="adm-stack" variants={stagger} initial="hidden" animate="show">
      <ErrorBanner message={error} onRetry={reload} />
      <Card eyebrow="Observability" title="API request log" subtitle="Every call made with a customer API key" flush
        action={<button className="adm-btn adm-btn--outline adm-btn--sm" disabled={!rows.length} onClick={() => downloadCsv("api-logs.csv", rows.map((r) => ({ time: r.createdAt, customer: r.userEmail, method: r.method, endpoint: r.endpoint, status: r.statusCode, ms: r.responseTimeMs ?? "", type: r.messageType || "", error: r.error || "", ip: r.ipAddress || "" })))}><Download size={14} /> Export page</button>}>
        <div className="adm-toolbar">
          <label className="adm-search"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search endpoint, error, customer, message id…" /></label>
          <Segmented id="lr" value={success} onChange={(v) => { setSuccess(v); setPage(1); }} options={[{ value: "", label: "All" }, { value: "true", label: "Success" }, { value: "false", label: "Failed" }]} />
          <Segmented id="ld" value={range} onChange={(v) => { setRange(v); setPage(1); }} options={[{ value: "1", label: "24h" }, { value: "7", label: "7d" }, { value: "30", label: "30d" }, { value: "all", label: "All" }]} />
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table adm-table--stack">
            <thead><tr><th>Result</th><th>Request</th><th>Customer</th><th>Type</th><th>Latency</th><th>Time</th></tr></thead>
            <tbody>
              {loading && !rows.length ? [0, 1, 2, 3, 4].map((i) => <tr key={i}><td colSpan={6}><Skeleton h={30} /></td></tr>)
                : rows.length === 0 ? <tr><td colSpan={6}><EmptyState icon={ScrollText} title="No requests found" text="Adjust the filters or time range." /></td></tr>
                : rows.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}>
                    <td data-label="Result"><span className={`adm-code ${r.success ? "" : "is-bad"}`}>{r.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {r.statusCode}</span></td>
                    <td data-label="Request"><span className="mono"><b>{r.method}</b> {r.endpoint.split("?")[0].replace(/^\/api/, "")}</span>{r.error && <div className="adm-errline" title={r.error}>{r.error}</div>}</td>
                    <td data-label="Customer"><strong>{r.userName}</strong><br /><span className="adm-faint">{r.userEmail}</span></td>
                    <td data-label="Type" className="adm-faint">{r.messageType || "—"}</td>
                    <td data-label="Latency" className="mono">{r.responseTimeMs != null ? `${r.responseTimeMs}ms` : "—"}</td>
                    <td data-label="Time" className="adm-faint">{fmtDateTime(r.createdAt)}</td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination page={data?.page || 1} pages={data?.pages || 1} total={data?.total || 0} onChange={setPage} />
      </Card>
    </motion.div>
  );
}
