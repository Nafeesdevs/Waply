import React, { useState } from "react";
import { Modal } from "./ui";

/** Reusable confirm dialog. `onConfirm` may be async; the button shows progress. */
export default function Confirm({ open, title, text, confirmLabel = "Confirm", danger = false, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      footer={
        <>
          <button className="adm-btn adm-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className={`adm-btn ${danger ? "adm-btn--danger-solid" : "adm-btn--ink"}`} onClick={run} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </>
      }
    >
      <p className="adm-modal__text">{text}</p>
    </Modal>
  );
}
