import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, CornerDownLeft } from "lucide-react";
import { Avatar } from "./ui";

export default function CommandPalette({ open, onClose, pages, customers, onPage, onCustomer }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const items = useMemo(() => {
    const n = q.trim().toLowerCase();
    const p = pages.filter((x) => !n || x.label.toLowerCase().includes(n)).map((x) => ({ type: "page", ...x }));
    const c = n
      ? customers.filter((x) => x.name?.toLowerCase().includes(n) || x.email?.toLowerCase().includes(n)).slice(0, 6).map((x) => ({ type: "customer", ...x }))
      : [];
    return [...p, ...c];
  }, [q, pages, customers]);

  useEffect(() => setIdx(0), [q]);

  const pick = (it) => {
    if (!it) return;
    onClose();
    it.type === "page" ? onPage(it.id) : onCustomer(it.id);
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    if (e.key === "Enter") pick(items[idx]);
    if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="adm-overlay adm-overlay--top" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className="adm-cmd" initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", stiffness: 380, damping: 30 }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="adm-cmd__input">
              <Search size={16} />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Jump to a page or find a customer…" />
              <kbd>esc</kbd>
            </div>
            <ul className="adm-cmd__list">
              {items.length === 0 && <li className="adm-cmd__empty">Nothing found</li>}
              {items.map((it, i) => {
                const Icon = it.icon;
                return (
                  <li key={`${it.type}-${it.id}`} className={i === idx ? "is-sel" : ""} onMouseEnter={() => setIdx(i)} onClick={() => pick(it)}>
                    {it.type === "page" ? <Icon size={16} /> : <Avatar name={it.name} size={22} />}
                    <span>{it.type === "page" ? it.label : it.name}</span>
                    <small>{it.type === "page" ? "Page" : it.email}</small>
                    {i === idx && <CornerDownLeft size={13} />}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
