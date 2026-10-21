import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { fmtCompact, fmtNum } from "./ui";

/* Measures the width of a container so SVG charts stay fully responsive. */
function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.floor(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

const niceMax = (v) => {
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};

const shortDate = (iso) => {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

/* -------------------------------------------------------------------------
   TimeChart — multi-series area/line chart or grouped bars, with hover
   crosshair + tooltip and an animated draw-in.
   ------------------------------------------------------------------------- */
export function TimeChart({
  data,
  series,
  height = 260,
  type = "area",
  stacked = false,
  valueFormat = fmtNum,
}) {
  const [ref, width] = useWidth();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(null);

  const pad = { t: 14, r: 12, b: 28, l: 44 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const n = data.length;

  const maxVal = useMemo(() => {
    let m = 0;
    data.forEach((d) => {
      if (stacked) m = Math.max(m, series.reduce((s, k) => s + (d[k.key] || 0), 0));
      else series.forEach((k) => (m = Math.max(m, d[k.key] || 0)));
    });
    return niceMax(m);
  }, [data, series, stacked]);

  const x = (i) => pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v) => pad.t + ih - (v / maxVal) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxVal);
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 70))));

  const smooth = (pts) => {
    if (pts.length < 2) return `M${pts[0]?.[0] ?? 0},${pts[0]?.[1] ?? 0}`;
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    return d;
  };

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const i = Math.round(((px - pad.l) / iw) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  const barW = Math.max(3, Math.min(26, (iw / n) * 0.62 / (stacked ? 1 : series.length)));

  return (
    <div ref={ref} className="adm-chart" style={{ height }}>
      <svg
        width={width}
        height={height}
        onMouseMove={onMove}
        onTouchMove={onMove}
        onMouseLeave={() => setHover(null)}
        onTouchEnd={() => setHover(null)}
        role="img"
        aria-label="Time series chart"
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} className="adm-grid-line" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="adm-axis">
              {fmtCompact(t)}
            </text>
          </g>
        ))}

        {data.map(
          (d, i) =>
            i % labelEvery === 0 && (
              <text key={d.date} x={x(i)} y={height - 8} textAnchor="middle" className="adm-axis">
                {shortDate(d.date)}
              </text>
            )
        )}

        {type === "area" &&
          series.map((s, si) => {
            const pts = data.map((d, i) => [x(i), y(d[s.key] || 0)]);
            const line = smooth(pts);
            const area = `${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`;
            return (
              <g key={s.key}>
                <motion.path
                  d={area}
                  fill={`url(#g-${s.key})`}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.3 + si * 0.1 }}
                />
                <motion.path
                  d={line}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: si * 0.1 }}
                />
              </g>
            );
          })}

        {type === "bars" &&
          data.map((d, i) => {
            let acc = 0;
            return series.map((s, si) => {
              const v = d[s.key] || 0;
              const h = (v / maxVal) * ih;
              const bx = stacked ? x(i) - barW / 2 : x(i) - (barW * series.length) / 2 + si * barW;
              const by = stacked ? y(acc + v) : y(v);
              acc += v;
              return (
                <motion.rect
                  key={`${d.date}-${s.key}`}
                  x={bx}
                  y={by}
                  width={barW - 1}
                  height={Math.max(h, 0)}
                  rx={3}
                  fill={s.color}
                  style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.7, delay: Math.min(i * 0.012, 0.5), ease: [0.22, 1, 0.36, 1] }}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              );
            });
          })}

        {hover !== null && data[hover] && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} className="adm-crosshair" />
            {type === "area" &&
              series.map((s) => (
                <circle key={s.key} cx={x(hover)} cy={y(data[hover][s.key] || 0)} r={4.5} fill="#fff" stroke={s.color} strokeWidth={2.25} />
              ))}
          </g>
        )}
      </svg>

      {hover !== null && data[hover] && (
        <div
          className="adm-tooltip"
          style={{ left: Math.min(Math.max(x(hover), 80), width - 80), top: 6 }}
        >
          <strong>{shortDate(data[hover].date)}</strong>
          {series.map((s) => (
            <div key={s.key}>
              <i style={{ background: s.color }} />
              <span>{s.label}</span>
              <b>{valueFormat(data[hover][s.key] || 0)}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Legend({ items }) {
  return (
    <div className="adm-legend">
      {items.map((i) => (
        <span key={i.label}>
          <i style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/* -------------------------------- Donut ---------------------------------- */
export function Donut({ segments, size = 168, thickness = 18, center }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const grown = useGrown();
  let offset = 0;
  return (
    <div className="adm-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--adm-line)" strokeWidth={thickness} />
        {total > 0 &&
          segments.map((s, i) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDashoffset={-offset}
                strokeDasharray={grown ? `${Math.max(len - 2, 0)} ${c}` : `0 ${c}`}
                style={{ transition: `stroke-dasharray .9s cubic-bezier(.22,1,.36,1) ${0.12 * i}s` }}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="adm-donut__center">{center}</div>
    </div>
  );
}

// Flips to true right after mount so CSS transitions can play the "grow" animation.
function useGrown() {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return grown;
}

/* ------------------------------ Bar list ---------------------------------- */
export function BarList({ items, color = "var(--adm-emerald)", valueFormat = fmtNum }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="adm-barlist">
      {items.map((i, idx) => (
        <div key={i.label} className="adm-barlist__row">
          <div className="adm-barlist__meta">
            <span title={i.label}>{i.label}</span>
            <b>{valueFormat(i.value)}</b>
          </div>
          <div className="adm-barlist__track">
            <motion.div
              className="adm-barlist__fill"
              style={{ background: i.color || color }}
              initial={{ width: 0 }}
              animate={{ width: `${(i.value / max) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.08 * idx, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {i.sub && <small>{i.sub}</small>}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Heatmap ----------------------------------- */
export function Heatmap({ matrix }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const max = Math.max(1, ...matrix.flat());
  return (
    <div className="adm-heat">
      <div className="adm-heat__hours">
        <span />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h}>{h % 6 === 0 ? `${h}` : ""}</span>
        ))}
      </div>
      {matrix.map((row, d) => (
        <div key={d} className="adm-heat__row">
          <span className="adm-heat__day">{days[d]}</span>
          {row.map((v, h) => (
            <motion.i
              key={h}
              title={`${days[d]} ${String(h).padStart(2, "0")}:00 UTC — ${fmtNum(v)} calls`}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (d * 24 + h) * 0.002, duration: 0.3 }}
              style={{ background: v ? `color-mix(in srgb, var(--adm-emerald) ${12 + (v / max) * 88}%, transparent)` : "var(--adm-line)" }}
            />
          ))}
        </div>
      ))}
      <p className="adm-heat__note">UTC · darker = more API calls</p>
    </div>
  );
}

/* ------------------------------ Sparkline --------------------------------- */
export function Sparkline({ values, color = "var(--adm-emerald)", height = 34, width = 110 }) {
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * width, height - 3 - (v / max) * (height - 6)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} className="adm-spark" aria-hidden>
      <motion.path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
    </svg>
  );
}

/* ------------------------------ Gauge ------------------------------------- */
export function Gauge({ value, label, color = "var(--adm-emerald)", size = 120 }) {
  const r = (size - 14) / 2;
  const c = Math.PI * r; // half circle length
  const v = Math.min(100, Math.max(0, value));
  const grown = useGrown();
  const d = `M7,${size / 2} A${r},${r} 0 0 1 ${size - 7},${size / 2}`;
  return (
    <div className="adm-gauge" style={{ width: size }}>
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
        <path d={d} fill="none" stroke="var(--adm-line)" strokeWidth={10} strokeLinecap="round" />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={grown ? `${(v / 100) * c} ${c}` : `0 ${c}`}
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="adm-gauge__val">{v}%</div>
      <div className="adm-gauge__label">{label}</div>
    </div>
  );
}
