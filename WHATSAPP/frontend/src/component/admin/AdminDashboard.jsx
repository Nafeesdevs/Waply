import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, BarChart3, Users, Key, Smartphone, ScrollText, Wallet, ShieldCheck, Server,
  Menu, X, LogOut, RefreshCw, Search, ArrowUpRight, Command,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAnalytics, listCustomers } from "../../services/adminservice";
import { ToastProvider, Segmented, Avatar } from "./components/ui";
import CommandPalette from "./components/CommandPalette";
import CustomerDrawer from "./components/CustomerDrawer";
import OverviewPage from "./pages/OverviewPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CustomersPage from "./pages/CustomersPage";
import ApiKeysPage from "./pages/ApiKeysPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import LogsPage from "./pages/LogsPage";
import BillingPage from "./pages/BillingPage";
import AuditPage from "./pages/AuditPage";
import SystemPage from "./pages/SystemPage";
import "./AdminDashboard.css";

const NAV = [
  { group: "Insights", items: [
    { id: "overview", label: "Overview", icon: LayoutDashboard, title: "Mission control", Page: OverviewPage },
    { id: "analytics", label: "Analytics", icon: BarChart3, title: "Platform analytics", Page: AnalyticsPage },
  ]},
  { group: "Manage", items: [
    { id: "customers", label: "Customers", icon: Users, title: "Customers", Page: CustomersPage },
    { id: "keys", label: "API keys", icon: Key, title: "API keys", Page: ApiKeysPage },
    { id: "whatsapp", label: "WhatsApp", icon: Smartphone, title: "WhatsApp connections", Page: WhatsAppPage },
    { id: "logs", label: "Request logs", icon: ScrollText, title: "API request logs", Page: LogsPage },
  ]},
  { group: "Business", items: [
    { id: "billing", label: "Revenue", icon: Wallet, title: "Revenue estimates", Page: BillingPage },
  ]},
  { group: "Platform", items: [
    { id: "audit", label: "Audit trail", icon: ShieldCheck, title: "Audit trail", Page: AuditPage },
    { id: "system", label: "System", icon: Server, title: "System health", Page: SystemPage },
  ]},
];
const ALL = NAV.flatMap((g) => g.items);
const RANGE_PAGES = ["overview", "analytics", "billing"];

const readHash = () => {
  const id = window.location.hash.replace(/^#\/?/, "");
  return ALL.some((p) => p.id === id) ? id : "overview";
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState(readHash);
  const [days, setDays] = useState(30);
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [live, setLive] = useState(true);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      setAnalytics(await getAnalytics(days));
      setAnalyticsError("");
    } catch (e) {
      setAnalyticsError(e.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      setCustomers(await listCustomers());
      setCustomersError("");
    } catch (e) {
      setCustomersError(e.message);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const reloadAll = useCallback(() => {
    loadAnalytics();
    loadCustomers();
  }, [loadAnalytics, loadCustomers]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  // Live mode: quietly refresh every 45s while the tab is visible.
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => { if (!document.hidden) reloadAll(); }, 45000);
    return () => clearInterval(t);
  }, [live, reloadAll]);

  // Hash routing so refresh / back button / deep links work.
  useEffect(() => {
    const onHash = () => setPage(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((id) => {
    window.location.hash = `/${id}`;
    setPage(id);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Ctrl/⌘ + K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = ALL.find((p) => p.id === page) || ALL[0];
  const Page = current.Page;

  const ctx = useMemo(
    () => ({
      user, days, analytics, loading, analyticsError,
      customers, customersLoading, customersError,
      reloadAll, reloadCustomers: loadCustomers,
      go, openCustomer: setCustomerId,
    }),
    [user, days, analytics, loading, analyticsError, customers, customersLoading, customersError, reloadAll, loadCustomers, go]
  );

  return (
    <ToastProvider>
      <div className="adm-shell">
        <AnimatePresence>
          {navOpen && (
            <motion.div className="adm-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNavOpen(false)} />
          )}
        </AnimatePresence>

        {/* ------------------------------ sidebar ------------------------------ */}
        <aside className={`adm-side ${navOpen ? "is-open" : ""}`}>
          <Link to="/" className="adm-brand">
            <span className="adm-brand__mark">W</span>
            <span className="adm-brand__text">waply<span>.</span></span>
            <span className="adm-brand__tag">admin</span>
          </Link>

          <nav className="adm-nav">
            {NAV.map((g) => (
              <div key={g.group} className="adm-nav__group">
                <p>{g.group}</p>
                {g.items.map((it) => {
                  const Icon = it.icon;
                  const active = page === it.id;
                  return (
                    <button key={it.id} className={`adm-nav__item ${active ? "is-active" : ""}`} onClick={() => go(it.id)}>
                      {active && <motion.span layoutId="nav-pill" className="adm-nav__pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                      <Icon size={17} />
                      <span>{it.label}</span>
                      {it.id === "customers" && customers.length > 0 && <em>{customers.length}</em>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="adm-side__foot">
            <Avatar name={user?.name || "Admin"} size={34} />
            <div>
              <strong>{user?.name || "Admin"}</strong>
              <span>{user?.email}</span>
            </div>
            <button className="adm-icon-btn adm-icon-btn--dark" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={15} /></button>
          </div>
        </aside>

        {/* ------------------------------- main -------------------------------- */}
        <div className="adm-main">
          <header className="adm-top">
            <button className="adm-icon-btn adm-burger" onClick={() => setNavOpen((o) => !o)} aria-label="Menu">
              {navOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="adm-top__title">
              <p className="adm-eyebrow">Admin / {current.label}</p>
              <h1>{current.title}</h1>
            </div>

            <div className="adm-top__right">
              <button className="adm-search-btn" onClick={() => setPaletteOpen(true)}>
                <Search size={14} />
                <span>Search…</span>
                <kbd><Command size={10} />K</kbd>
              </button>

              {RANGE_PAGES.includes(page) && (
                <Segmented id="range" value={days} onChange={setDays} options={[{ value: 7, label: "7d" }, { value: 30, label: "30d" }, { value: 90, label: "90d" }]} />
              )}

              <button className={`adm-live-btn ${live ? "is-on" : ""}`} onClick={() => setLive((l) => !l)} title="Auto-refresh every 45s">
                <span className="adm-live" /> <span className="adm-hide-sm">Live</span>
              </button>

              <button className="adm-icon-btn" onClick={reloadAll} title="Refresh data" aria-label="Refresh">
                <RefreshCw size={15} className={loading || customersLoading ? "spin" : ""} />
              </button>

              <Link to="/" className="adm-btn adm-btn--ink adm-btn--sm adm-hide-sm">
                Site <ArrowUpRight size={14} />
              </Link>
            </div>
          </header>

          <main className="adm-content">
            {analyticsError && RANGE_PAGES.includes(page) && (
              <div className="adm-alert">
                <span>{analyticsError}</span>
                <button className="adm-link" onClick={loadAnalytics}>Retry</button>
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <Page ctx={ctx} />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          pages={ALL}
          customers={customers}
          onPage={go}
          onCustomer={setCustomerId}
        />
        <CustomerDrawer customerId={customerId} onClose={() => setCustomerId(null)} onChanged={reloadAll} />
      </div>
    </ToastProvider>
  );
}
