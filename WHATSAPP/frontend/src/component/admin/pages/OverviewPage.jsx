import React from "react";
import { motion } from "motion/react";
import { Users, Activity, MessageSquare, ShieldCheck, Key, Smartphone, Zap, ArrowUpRight, UserPlus } from "lucide-react";
import { Card, StatCard, Badge, statusTone, Avatar, fmtNum, fmtCompact, fmtDate, timeAgo, stagger, rise, Skeleton, EmptyState, CountUp } from "../components/ui";
import { TimeChart, Legend, Donut, BarList, Sparkline } from "../components/charts";

const COLORS = { success: "#10B981", failed: "#D9483B", ink: "#0A0A0A", blue: "#4F7CFF", amber: "#E8A33D" };

export default function OverviewPage({ ctx }) {
  const { analytics: a, loading, user, go, openCustomer, days } = ctx;
  const k = a?.kpis;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (loading && !a) return <OverviewSkeleton />;
  if (!a) return <EmptyState title="No analytics yet" text="Data will appear once customers start using the API." />;

  const spark = (key) => a.series.slice(-14).map((d) => d[key]);
  const statusSegs = [
    { label: "Active", value: k.activeCustomers, color: COLORS.success },
    { label: "Deactivated", value: k.deactivatedCustomers, color: COLORS.failed },
  ];

  return (
    <motion.div className="adm-stack" variants={stagger} initial="hidden" animate="show">
      {/* ---------- Hero ---------- */}
      <motion.section variants={rise} className="adm-hero">
        <div className="adm-hero__dots" aria-hidden />
        <div className="adm-hero__body">
          <p className="adm-eyebrow adm-eyebrow--light">Mission control · last {days} days</p>
          <h2>
            {greet}, {user?.name?.split(" ")[0] || "Admin"}.
          </h2>
          <p className="adm-hero__sub">
            Your platform handled <b><CountUp value={k.callsWindow} format={fmtNum} /></b> API calls with a{" "}
            <b>{k.successRate}%</b> success rate across <b>{fmtNum(k.totalCustomers)}</b> customers.
          </p>
          <div className="adm-hero__actions">
            <button className="adm-btn adm-btn--emerald" onClick={() => go("customers")}>
              <Users size={15} /> Manage customers
            </button>
            <button className="adm-btn adm-btn--glass" onClick={() => go("analytics")}>
              Deep analytics <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
        <div className="adm-hero__side">
          <div className="adm-hero__pill">
            <span className="adm-live" /> {k.whatsappConnected} WhatsApp live
          </div>
          <div className="adm-hero__pill">
            <Zap size={13} /> {k.avgLatencyMs}ms avg
          </div>
          <div className="adm-hero__pill">
            <Key size={13} /> {k.apiKeysActive} active keys
          </div>
        </div>
      </motion.section>

      {/* ---------- KPIs ---------- */}
      <div className="adm-grid adm-grid--4">
        <StatCard label="Customers" value={k.totalCustomers} icon={Users} delta={k.signupsGrowth} hint={`+${k.signupsWindow} new`} />
        <StatCard label="API calls" value={k.callsWindow} format={fmtCompact} icon={Activity} delta={k.callsGrowth} hint="vs previous period" />
        <StatCard
          label="Success rate"
          value={k.successRate}
          format={(v) => `${Number(v).toFixed(1)}%`}
          icon={ShieldCheck}
          delta={Math.round((k.successRate - k.prevSuccessRate) * 10) / 10}
          hint={`${fmtNum(k.failedWindow)} failed`}
          dark
        />
        <StatCard label="WhatsApp messages" value={k.messagesWindow} format={fmtCompact} icon={MessageSquare} delta={k.messagesGrowth} hint="delivered to Meta" accent />
      </div>

      {/* ---------- Traffic + customers donut ---------- */}
      <div className="adm-grid adm-grid--main">
        <Card
          eyebrow="Traffic"
          title="API requests over time"
          subtitle="Successful vs failed calls across every tenant"
          action={<Legend items={[{ label: "Success", color: COLORS.success }, { label: "Failed", color: COLORS.failed }]} />}
        >
          <TimeChart
            data={a.series}
            series={[
              { key: "success", label: "Success", color: COLORS.success },
              { key: "failed", label: "Failed", color: COLORS.failed },
            ]}
          />
        </Card>

        <Card eyebrow="Accounts" title="Customer health" subtitle="Active vs deactivated">
          <div className="adm-center">
            <Donut
              segments={statusSegs}
              center={
                <>
                  <strong><CountUp value={k.totalCustomers} /></strong>
                  <span>total</span>
                </>
              }
            />
          </div>
          <ul className="adm-split">
            {statusSegs.map((s) => (
              <li key={s.label}>
                <i style={{ background: s.color }} />
                {s.label}
                <b>{fmtNum(s.value)}</b>
              </li>
            ))}
            <li>
              <i style={{ background: COLORS.blue }} />
              Active in period
              <b>{fmtNum(k.activeUsersWindow)}</b>
            </li>
          </ul>
        </Card>
      </div>

      {/* ---------- Top customers / signups / endpoints ---------- */}
      <div className="adm-grid adm-grid--3">
        <Card eyebrow="Leaderboard" title="Top customers" subtitle="By API calls in period" action={<button className="adm-link" onClick={() => go("customers")}>View all</button>}>
          {a.topCustomers.length === 0 ? (
            <EmptyState title="No traffic yet" />
          ) : (
            <ul className="adm-list">
              {a.topCustomers.map((c, i) => (
                <motion.li key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }} onClick={() => openCustomer(c.id)} className="is-click">
                  <Avatar name={c.name} />
                  <div className="adm-list__main">
                    <strong>{c.name}</strong>
                    <span>{c.email}</span>
                  </div>
                  <div className="adm-list__end">
                    <b>{fmtCompact(c.calls)}</b>
                    <span>{c.successRate}% ok</span>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>

        <Card eyebrow="Growth" title="Newest customers" subtitle="Latest sign-ups" action={<Sparkline values={spark("signups")} />}>
          {a.recentSignups.length === 0 ? (
            <EmptyState icon={UserPlus} title="No customers yet" />
          ) : (
            <ul className="adm-list">
              {a.recentSignups.map((c, i) => (
                <motion.li key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }} onClick={() => openCustomer(c.id)} className="is-click">
                  <Avatar name={c.name} />
                  <div className="adm-list__main">
                    <strong>{c.name}</strong>
                    <span>{timeAgo(c.createdAt)}</span>
                  </div>
                  <Badge tone={statusTone(c.status)}>{c.status === "ACTIVE" ? "Active" : "Off"}</Badge>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>

        <Card eyebrow="Routes" title="Busiest endpoints" subtitle="Share of API traffic">
          {a.endpoints.length === 0 ? (
            <EmptyState title="No requests yet" />
          ) : (
            <BarList
              items={a.endpoints.slice(0, 5).map((e) => ({
                label: `${e.method} ${e.path.replace(/^\/api/, "")}`,
                value: e.calls,
                sub: `${e.avgMs}ms avg · ${e.failed} failed`,
              }))}
            />
          )}
        </Card>
      </div>

      {/* ---------- WhatsApp strip ---------- */}
      <motion.div variants={rise} className="adm-strip">
        <div>
          <Smartphone size={18} />
          <span>
            <b>{k.whatsappConnected}</b> connected · <b>{k.whatsappDisconnected}</b> disconnected WhatsApp accounts
          </span>
        </div>
        <button className="adm-link" onClick={() => go("whatsapp")}>
          Inspect connections →
        </button>
      </motion.div>
    </motion.div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="adm-stack">
      <Skeleton h={190} r={24} />
      <div className="adm-grid adm-grid--4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} h={128} r={20} />
        ))}
      </div>
      <Skeleton h={330} r={20} />
    </div>
  );
}
