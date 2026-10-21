import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { IndianRupee, TrendingUp, Users, Receipt, Info } from "lucide-react";
import { Card, StatCard, stagger, fmtMoney, fmtNum, Skeleton, EmptyState } from "../components/ui";
import { TimeChart, Legend, BarList } from "../components/charts";

const KEY = "waply.admin.pricing_inr";
const DEFAULTS = { perMessage: 0.40, platformFee: 3999 };

const load = () => {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
};

export default function BillingPage({ ctx }) {
  const { analytics: a, loading, days } = ctx;
  const [p, setP] = useState(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
  }, [p]);

  const calc = useMemo(() => {
    if (!a) return null;
    const k = a.kpis;
    const usageRev = k.messagesWindow * p.perMessage;
    const subs = k.whatsappConnected * p.platformFee * (days / 30);
    const total = usageRev + subs;
    const mrr = k.whatsappConnected * p.platformFee + (k.messagesWindow / days) * 30 * p.perMessage;
    return {
      usageRev, subs, total, mrr,
      arpu: k.activeCustomers ? total / k.activeCustomers : 0,
      series: a.series.map((d) => ({ date: d.date, usage: d.messages * p.perMessage, subs: (k.whatsappConnected * p.platformFee) / 30 })),
      top: a.topCustomers.map((c) => ({ label: c.name, value: c.messages * p.perMessage, sub: `${fmtNum(c.messages)} messages` })),
    };
  }, [a, p, days]);

  if (loading && !a) return <Skeleton h={400} r={20} />;
  if (!a || !calc) return <EmptyState title="No data" />;

  const set = (key) => (e) => setP((s) => ({ ...s, [key]: Math.max(0, parseFloat(e.target.value) || 0) }));

  return (
    <motion.div className="adm-stack" variants={stagger} initial="hidden" animate="show">
      <div className="adm-note">
        <Info size={16} />
        <span>
          <b>Live Data Integration.</b> Revenue calculations are powered in real-time by your actual backend message dispatches and
          connected WhatsApp numbers, calculated in Indian Rupees (INR ₹).
        </span>
      </div>

      <div className="adm-grid adm-grid--4">
        <StatCard label={`Est. revenue · ${days}d`} value={calc.total} format={fmtMoney} icon={IndianRupee} dark />
        <StatCard label="Est. MRR" value={calc.mrr} format={fmtMoney} icon={TrendingUp} accent />
        <StatCard label="Usage revenue" value={calc.usageRev} format={fmtMoney} icon={Receipt} hint={`${fmtNum(a.kpis.messagesWindow)} messages`} />
        <StatCard label="ARPU" value={calc.arpu} format={fmtMoney} icon={Users} hint="per active customer" />
      </div>

      <div className="adm-grid adm-grid--main">
        <Card eyebrow="Revenue" title="Estimated revenue per day (INR)" action={<Legend items={[{ label: "Usage", color: "#10B981" }, { label: "Platform fees", color: "#0A0A0A" }]} />}>
          <TimeChart data={calc.series} type="bars" stacked valueFormat={fmtMoney}
            series={[{ key: "subs", label: "Platform fees", color: "#0A0A0A" }, { key: "usage", label: "Usage", color: "#10B981" }]} />
        </Card>
        <Card eyebrow="Pricing model" title="Adjust rates (INR ₹)">
          <div className="adm-form">
            <label>
              <span>Price per message (INR ₹)</span>
              <input type="number" step="0.05" min="0" className="adm-input" value={p.perMessage} onChange={set("perMessage")} />
            </label>
            <label>
              <span>Platform fee per connected account / month (INR ₹)</span>
              <input type="number" step="100" min="0" className="adm-input" value={p.platformFee} onChange={set("platformFee")} />
            </label>
            <button className="adm-btn adm-btn--outline adm-btn--sm" onClick={() => setP(DEFAULTS)}>Reset to defaults</button>
          </div>
        </Card>
      </div>

      <Card eyebrow="Customers" title="Top estimated spenders" subtitle="Message-based revenue by customer">
        {calc.top.length === 0 ? <EmptyState title="No usage yet" /> : <BarList valueFormat={fmtMoney} items={calc.top} />}
      </Card>
    </motion.div>
  );
}
