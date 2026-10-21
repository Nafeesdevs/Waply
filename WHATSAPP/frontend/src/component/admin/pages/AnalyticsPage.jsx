import React from "react";
import { motion } from "motion/react";
import { Card, StatCard, stagger, Skeleton, fmtNum, fmtCompact, fmtDateTime, EmptyState } from "../components/ui";
import { TimeChart, Legend, Donut, BarList, Heatmap, Gauge } from "../components/charts";
import { Activity, Clock, Gauge as GaugeIcon, UserPlus } from "lucide-react";

export default function AnalyticsPage({ ctx }) {
  const { analytics: a, loading, days } = ctx;
  if (loading && !a) return <Skeleton h={500} r={20} />;
  if (!a) return <EmptyState title="No analytics available" />;
  const k = a.kpis;

  const statusColors = { "2xx": "#10B981", "3xx": "#4F7CFF", "4xx": "#E8A33D", "5xx": "#D9483B" };
  const statusSegs = a.statusClasses.map((s) => ({ label: s.label, value: s.count, color: statusColors[s.label] }));
  const statusTotal = statusSegs.reduce((s, x) => s + x.value, 0);

  return (
    <motion.div className="adm-stack" variants={stagger} initial="hidden" animate="show">
      <div className="adm-grid adm-grid--4">
        <StatCard label="Avg latency" value={k.avgLatencyMs} format={(v) => `${Math.round(v)}ms`} icon={Clock} hint="per API call" />
        <StatCard label="p95 latency" value={k.p95LatencyMs} format={(v) => `${Math.round(v)}ms`} icon={GaugeIcon} hint={`max ${fmtNum(k.maxLatencyMs)}ms`} />
        <StatCard label="Active tenants" value={k.activeUsersWindow} icon={Activity} hint={`of ${fmtNum(k.totalCustomers)} total`} dark />
        <StatCard label="New sign-ups" value={k.signupsWindow} icon={UserPlus} delta={k.signupsGrowth} hint={`last ${days}d`} accent />
      </div>

      <div className="adm-grid adm-grid--2">
        <Card eyebrow="Messaging" title="WhatsApp messages per day" subtitle="Calls that returned a Meta message id" action={<Legend items={[{ label: "Messages", color: "#10B981" }]} />}>
          <TimeChart data={a.series} type="bars" series={[{ key: "messages", label: "Messages", color: "#10B981" }]} height={240} />
        </Card>
        <Card eyebrow="Growth" title="Customer sign-ups per day" action={<Legend items={[{ label: "Sign-ups", color: "#0A0A0A" }]} />}>
          <TimeChart data={a.series} type="bars" series={[{ key: "signups", label: "Sign-ups", color: "#0A0A0A" }]} height={240} />
        </Card>
      </div>

      <div className="adm-grid adm-grid--2">
        <Card eyebrow="Performance" title="Average response time" subtitle="Milliseconds per day" action={<Legend items={[{ label: "Avg ms", color: "#4F7CFF" }]} />}>
          <TimeChart data={a.series} series={[{ key: "avgMs", label: "Avg ms", color: "#4F7CFF" }]} height={240} valueFormat={(v) => `${v}ms`} />
        </Card>
        <Card eyebrow="Reliability" title="HTTP status classes">
          <div className="adm-donut-row">
            <Donut
              segments={statusSegs}
              center={
                <>
                  <strong>{statusTotal ? Math.round((statusSegs[0].value / statusTotal) * 100) : 0}%</strong>
                  <span>2xx</span>
                </>
              }
            />
            <ul className="adm-split adm-split--grow">
              {statusSegs.map((s) => (
                <li key={s.label}>
                  <i style={{ background: s.color }} />
                  {s.label}
                  <b>{fmtNum(s.value)}</b>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="adm-grid adm-grid--main">
        <Card eyebrow="Patterns" title="Traffic heatmap" subtitle="When your platform is busiest (day × hour)">
          <Heatmap matrix={a.heatmap} />
        </Card>
        <Card eyebrow="Health" title="Success gauge">
          <div className="adm-center adm-gauges">
            <Gauge value={k.successRate} label="Period success" />
            <Gauge value={k.allTimeCalls ? Math.round((k.allTimeSuccess / k.allTimeCalls) * 1000) / 10 : 0} label="All-time success" color="#4F7CFF" />
          </div>
        </Card>
      </div>

      <div className="adm-grid adm-grid--3">
        <Card eyebrow="Routes" title="Endpoint performance">
          {a.endpoints.length === 0 ? <EmptyState title="No requests yet" /> : (
            <BarList items={a.endpoints.map((e) => ({ label: `${e.method} ${e.path.replace(/^\/api/, "")}`, value: e.calls, sub: `${e.avgMs}ms avg · ${e.failed} failed` }))} />
          )}
        </Card>
        <Card eyebrow="Content" title="Message types">
          {a.messageTypes.length === 0 ? <EmptyState title="No messages yet" /> : (
            <BarList color="#4F7CFF" items={a.messageTypes.map((m) => ({ label: m.label, value: m.count }))} />
          )}
        </Card>
        <Card eyebrow="Debugging" title="Top errors">
          {a.topErrors.length === 0 ? <EmptyState title="No errors 🎉" text="Nothing failed in this period." /> : (
            <ul className="adm-list adm-list--err">
              {a.topErrors.map((e) => (
                <li key={e.error}>
                  <div className="adm-list__main">
                    <strong title={e.error}>{e.error}</strong>
                    <span>last {fmtDateTime(e.last)}</span>
                  </div>
                  <div className="adm-list__end"><b>{fmtCompact(e.count)}</b></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
