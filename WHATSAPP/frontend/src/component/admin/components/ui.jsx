import React, { useEffect, useRef, useState, createContext, useContext, useCallback, useMemo } from "react";
import { motion, AnimatePresence, animate, useInView, useReducedMotion } from "motion/react";
import { X, CheckCircle2, AlertTriangle, Info, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ------------------------------ formatters -------------------------------- */

export const fmtNum = (n) => Number(n ?? 0).toLocaleString("en-US");

export const fmtCompact = (n) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(Number(n ?? 0));

export const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const fmtDateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const timeAgo = (v) => {
  if (!v) return "never";
  const s = Math.max(1, Math.floor((Date.now() - new Date(v).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(v);
};

export const fmtMoney = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(n ?? 0));

export const initials = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";

export const downloadCsv = (filename, rows) => {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/* ------------------------------ animation presets ------------------------- */

export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
export const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
};

/* ------------------------------ CountUp ----------------------------------- */

export function CountUp({ value = 0, format = fmtNum, duration = 1.0 }) {
  const ref = useRef(null);
  const fmtRef = useRef(format);
  fmtRef.current = format;
  const inView = useInView(ref, { margin: "-20px 0px" });
  const reduce = useReducedMotion();

  const target = Number(value) || 0;
  const whole = Number.isInteger(target);

  useEffect(() => {
    if (!ref.current) return;
    
    const paint = (v) => {
      if (ref.current) {
        ref.current.textContent = fmtRef.current(whole ? Math.round(v) : Math.round(v * 100) / 100);
      }
    };

    if (reduce) {
      paint(target);
      return;
    }

    if (!inView) {
      // When scrolled out of view, reset to 0 so it's primed to animate when scrolled back into view
      paint(0);
      return;
    }

    // Animate smoothly from 0 to target when entering viewport
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: paint,
    });

    return () => controls.stop();
  }, [target, inView, reduce, duration, whole]);

  return <span ref={ref}>{format(0)}</span>;
}

/* ------------------------------ small pieces ------------------------------ */

export function Badge({ tone = "off", children, dot = true }) {
  return (
    <span className={`adm-badge adm-badge--${tone}`}>
      {dot && <span className="adm-badge__dot" />}
      {children}
    </span>
  );
}

export const statusTone = (s) =>
  ({ ACTIVE: "on", CONNECTED: "on", DEACTIVATED: "danger", REVOKED: "danger", DISCONNECTED: "off" }[s] || "off");

export function Delta({ value, invert = false }) {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  const good = invert ? !up : up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`adm-delta ${good ? "is-good" : "is-bad"}`}>
      <Icon size={12} />
      {Math.abs(value)}%
    </span>
  );
}

export function Avatar({ name, size = 36 }) {
  const hue = [...(name || "?")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className="adm-avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        flexShrink: 0,
        background: `hsl(${hue} 30% 92%)`,
        color: `hsl(${hue} 45% 28%)`,
      }}
    >
      {initials(name)}
    </span>
  );
}

export function Card({ title, subtitle, eyebrow, action, children, className = "", delay = 0, flush = false }) {
  return (
    <motion.section
      className={`adm-card ${flush ? "adm-card--flush" : ""} ${className}`}
      variants={rise}
    >
      {(title || action) && (
        <header className="adm-card__head">
          <div>
            {eyebrow && <p className="adm-eyebrow">{eyebrow}</p>}
            {title && <h3 className="adm-card__title">{title}</h3>}
            {subtitle && <p className="adm-card__subtitle">{subtitle}</p>}
          </div>
          {action && <div className="adm-card__action">{action}</div>}
        </header>
      )}
      {children}
    </motion.section>
  );
}

export function StatCard({ label, value, format, icon: Icon, delta, invertDelta, hint, accent, dark }) {
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`adm-stat ${dark ? "adm-stat--dark" : ""} ${accent ? "adm-stat--accent" : ""}`}
    >
      <div className="adm-stat__top">
        <span className="adm-stat__label">{label}</span>
        {Icon && (
          <span className="adm-stat__icon">
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="adm-stat__value">
        <CountUp value={value} format={format} />
      </div>
      <div className="adm-stat__foot">
        {delta !== undefined && <Delta value={delta} invert={invertDelta} />}
        {hint && <span>{hint}</span>}
      </div>
    </motion.div>
  );
}

export function Skeleton({ h = 16, w = "100%", r = 8 }) {
  return <span className="adm-skel" style={{ height: h, width: w, borderRadius: r }} />;
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="adm-empty">
      {Icon && <Icon size={28} />}
      <strong>{title}</strong>
      {text && <span>{text}</span>}
    </div>
  );
}

export function Pagination({ page, pages, total, onChange }) {
  if (pages <= 1) return total ? <div className="adm-pager"><span>{fmtNum(total)} records</span></div> : null;
  return (
    <div className="adm-pager">
      <span>
        Page {page} of {pages} · {fmtNum(total)} records
      </span>
      <div>
        <button className="adm-icon-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        <button className="adm-icon-btn" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function Segmented({ options, value, onChange, id }) {
  return (
    <div className="adm-seg" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={value === o.value ? "is-active" : ""}
          onClick={() => onChange(o.value)}
        >
          {value === o.value && <motion.span layoutId={`seg-${id}`} className="adm-seg__pill" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Modal / Drawer ----------------------------- */

export function Modal({ open, onClose, title, children, footer, width = 440 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="adm-overlay adm-overlay--center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            className="adm-modal"
            style={{ maxWidth: width }}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="adm-modal__head">
              <h3>{title}</h3>
              <button className="adm-icon-btn" onClick={onClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="adm-modal__body">{children}</div>
            {footer && <div className="adm-modal__foot">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Drawer({ open, onClose, children, width = 560 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="adm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.aside
            className="adm-drawer"
            style={{ maxWidth: width }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ Toasts ------------------------------------ */

const ToastCtx = createContext({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setItems((p) => [...p, { id, message, tone }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 4200);
  }, []);

  const Icon = { success: CheckCircle2, error: AlertTriangle, info: Info };
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="adm-toasts" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => {
            const I = Icon[t.tone] || Info;
            return (
              <motion.div
                key={t.id}
                layout
                className={`adm-toast adm-toast--${t.tone}`}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
              >
                <I size={16} />
                <span>{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------ data hook --------------------------------- */

// Small fetch hook: { data, loading, error, reload } with stale-while-reload.
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const alive = useRef(true);
  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await fn();
      if (alive.current) setState({ data, loading: false, error: "" });
    } catch (e) {
      if (alive.current) setState((s) => ({ ...s, loading: false, error: e.message }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    alive.current = true;
    run();
    return () => {
      alive.current = false;
    };
  }, [run]);
  return { ...state, reload: run };
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="adm-alert">
      <AlertTriangle size={16} />
      <span>{message}</span>
      {onRetry && (
        <button className="adm-link" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
