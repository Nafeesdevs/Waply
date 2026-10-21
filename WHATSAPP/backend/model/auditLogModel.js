import mongoose from "../config/db.js";
import { applyJsonTransform } from "../utils/schemaPlugin.js";

// Immutable record of every state-changing action an admin performs.
const auditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true, index: true }, // e.g. CUSTOMER_STATUS_CHANGED
    targetType: { type: String, default: null }, // CUSTOMER | API_KEY | WHATSAPP
    targetId: { type: String, default: null },
    targetLabel: { type: String, default: null },
    details: { type: String, default: null },
    ipAddress: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
auditLogSchema.index({ createdAt: -1 });
applyJsonTransform(auditLogSchema);

export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export const recordAudit = async (req, { action, targetType, targetId, targetLabel, details }) => {
  try {
    await AuditLog.create({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action,
      targetType: targetType ?? null,
      targetId: targetId ? String(targetId) : null,
      targetLabel: targetLabel ?? null,
      details: details ?? null,
      ipAddress: req.ip ?? null,
    });
  } catch (err) {
    // Never fail the admin action just because the audit write failed.
    console.error("Failed to write audit log:", err.message);
  }
};

export const listAuditLogs = async ({ limit = 100 } = {}) => {
  const rows = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  return rows.map((r) => ({ ...r, id: String(r._id), _id: undefined, __v: undefined }));
};
