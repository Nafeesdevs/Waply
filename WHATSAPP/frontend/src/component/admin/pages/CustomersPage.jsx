import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Download, Users, Smartphone, ArrowUpDown } from "lucide-react";
import { Card, Badge, statusTone, Avatar, Segmented, fmtNum, fmtDate, downloadCsv, EmptyState, Skeleton, stagger, ErrorBanner, Pagination } from "../components/ui";

const PAGE = 12;

export default function CustomersPage({ ctx }) {
  const { customers, customersLoading, customersError, reloadCustomers, openCustomer } = ctx;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [wa, setWa] = useState("ALL");
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = customers.filter((c) => {
      const m = !needle || c.name?.toLowerCase().includes(needle) || c.email?.toLowerCase().includes(needle);
      const s = status === "ALL" || c.status === status;
      const w = wa === "ALL" || (wa === "CONNECTED" ? c.whatsapp?.status === "CONNECTED" : c.whatsapp?.status !== "CONNECTED");
      return m && s && w;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    r = [...r].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
    });
    return r;
  }, [customers, q, status, wa, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const view = rows.slice((page - 1) * PAGE, page * PAGE);

  const sortBy = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
    setPage(1);
  };

  const exportCsv = () =>
    downloadCsv(
      "customers.csv",
      rows.map((c) => ({
        name: c.name,
        email: c.email,
        status: c.status,
        whatsapp: c.whatsapp?.status || "NONE",
        phone: c.whatsapp?.displayPhoneNumber || "",
        api_keys: c.apiKeyCount,
        api_calls: c.apiUsageCount,
        joined: c.createdAt,
      }))
    );

  const Th = ({ k, children }) => (
    <th onClick={() => sortBy(k)} className="is-sort">
      {children}
      <ArrowUpDown size={11} className={sort.key === k ? "on" : ""} />
    </th>
  );

  return (
    <motion.div className="adm-stack" variants={stagger} initial="hidden" animate="show">
      <ErrorBanner message={customersError} onRetry={reloadCustomers} />
      <Card
        eyebrow="Directory"
        title="Customers"
        subtitle={`${fmtNum(rows.length)} of ${fmtNum(customers.length)} accounts`}
        action={
          <button className="adm-btn adm-btn--outline adm-btn--sm" onClick={exportCsv} disabled={!rows.length}>
            <Download size={14} /> Export CSV
          </button>
        }
        flush
      >
        <div className="adm-toolbar">
          <label className="adm-search">
            <Search size={15} />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name or email…" />
          </label>
          <Segmented id="cs" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: "ALL", label: "All" }, { value: "ACTIVE", label: "Active" }, { value: "DEACTIVATED", label: "Deactivated" }]} />
          <Segmented id="cw" value={wa} onChange={(v) => { setWa(v); setPage(1); }} options={[{ value: "ALL", label: "Any WhatsApp" }, { value: "CONNECTED", label: "Connected" }, { value: "NONE", label: "Not connected" }]} />
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table adm-table--stack">
            <thead>
              <tr>
                <Th k="name">Customer</Th>
                <Th k="status">Status</Th>
                <th>WhatsApp</th>
                <Th k="apiKeyCount">Keys</Th>
                <Th k="apiUsageCount">API calls</Th>
                <Th k="createdAt">Joined</Th>
              </tr>
            </thead>
            <tbody>
              {customersLoading && !customers.length ? (
                [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}><td colSpan={6}><Skeleton h={34} /></td></tr>
                ))
              ) : view.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Users} title="No customers match" text="Try a different search or filter." /></td></tr>
              ) : (
                <AnimatePresence initial={false}>
                  {view.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.025 }}
                      onClick={() => openCustomer(c.id)}
                      className="is-click"
                    >
                      <td data-label="Customer">
                        <div className="adm-cell-user">
                          <Avatar name={c.name} />
                          <div><strong>{c.name}</strong><span>{c.email}</span></div>
                        </div>
                      </td>
                      <td data-label="Status"><Badge tone={statusTone(c.status)}>{c.status === "ACTIVE" ? "Active" : "Deactivated"}</Badge></td>
                      <td data-label="WhatsApp">
                        {c.whatsapp?.status === "CONNECTED" ? (
                          <Badge tone="on"><Smartphone size={11} />{c.whatsapp.displayPhoneNumber || c.whatsapp.businessName || "Connected"}</Badge>
                        ) : <Badge tone="off">{c.whatsapp ? "Disconnected" : "None"}</Badge>}
                      </td>
                      <td data-label="Keys" className="mono">{c.apiKeyCount}</td>
                      <td data-label="API calls" className="mono"><b>{fmtNum(c.apiUsageCount)}</b></td>
                      <td data-label="Joined" className="adm-faint">{fmtDate(c.createdAt)}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} total={rows.length} onChange={setPage} />
      </Card>
    </motion.div>
  );
}
