import mongoose from "../config/db.js";
import { WhatsAppConnection } from "./whatsappModel.js";
import { ApiKey } from "./apiKeyModel.js";
import { ApiUsage } from "./apiUsageModel.js";
import { applyJsonTransform } from "../utils/schemaPlugin.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "CUSTOMER"], default: "CUSTOMER", index: true },
    status: { type: String, enum: ["ACTIVE", "DEACTIVATED"], default: "ACTIVE", index: true },
  },
  { timestamps: true }
);
applyJsonTransform(userSchema);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

// Fields that are safe to ever send back to a client (never the
// password hash).
const SAFE_USER_SELECT = "name email role status createdAt updatedAt";

const toSafeUser = (u) =>
  u && {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };

const toWhatsappSummary = (w) =>
  w
    ? {
        status: w.status,
        businessName: w.businessName ?? null,
        displayPhoneNumber: w.displayPhoneNumber ?? null,
        wabaId: w.wabaId,
        phoneNumberId: w.phoneNumberId,
        connectedAt: w.connectedAt ?? null,
        disconnectedAt: w.disconnectedAt ?? null,
      }
    : null;

export const createUser = async (name, email, password, role = "CUSTOMER") => {
  return User.create({ name, email, password, role });
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

export const findUserById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const user = await User.findById(id).select(SAFE_USER_SELECT).lean();
  return toSafeUser(user);
};

// Full record (including password hash) — only for internal use such
// as authentication middleware re-checking current status/role.
export const findUserByIdInternal = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return User.findById(id);
};

export const countUsersByRole = async (role) => {
  return User.countDocuments({ role });
};

export const countUsersByRoleAndStatus = async (role, status) => {
  return User.countDocuments({ role, status });
};

export const listCustomers = async () => {
  const users = await User.find({ role: "CUSTOMER" })
    .select(SAFE_USER_SELECT)
    .sort({ createdAt: -1 })
    .lean();

  const ids = users.map((u) => u._id);

  const [connections, usageCounts, keyCounts] = await Promise.all([
    WhatsAppConnection.find({ userId: { $in: ids } }).lean(),
    ApiUsage.aggregate([
      { $match: { userId: { $in: ids } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]),
    ApiKey.aggregate([
      { $match: { userId: { $in: ids } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]),
  ]);

  const connByUser = new Map(connections.map((w) => [String(w.userId), w]));
  const usageByUser = new Map(usageCounts.map((c) => [String(c._id), c.count]));
  const keysByUser = new Map(keyCounts.map((c) => [String(c._id), c.count]));

  return users.map((u) => ({
    ...toSafeUser(u),
    whatsapp: toWhatsappSummary(connByUser.get(String(u._id))),
    _count: {
      apiUsage: usageByUser.get(String(u._id)) || 0,
      apiKeys: keysByUser.get(String(u._id)) || 0,
    },
  }));
};

export const findCustomerDetailById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;

  const user = await User.findOne({ _id: id, role: "CUSTOMER" })
    .select(SAFE_USER_SELECT)
    .lean();
  if (!user) return null;

  const [connection, keys] = await Promise.all([
    WhatsAppConnection.findOne({ userId: user._id }).lean(),
    ApiKey.find({ userId: user._id })
      .select("keyId name status lastUsedAt revokedAt createdAt -_id")
      .lean(),
  ]);

  return {
    ...toSafeUser(user),
    whatsapp: toWhatsappSummary(connection),
    apiKeys: keys.map((k) => ({
      keyId: k.keyId,
      name: k.name ?? null,
      status: k.status,
      lastUsedAt: k.lastUsedAt ?? null,
      revokedAt: k.revokedAt ?? null,
      createdAt: k.createdAt,
    })),
  };
};

export const updateUserStatus = async (id, status) => {
  const user = await User.findByIdAndUpdate(id, { status }, { new: true })
    .select(SAFE_USER_SELECT)
    .lean();
  return toSafeUser(user);
};

// Used by the admin seed script.
export const promoteUserToAdmin = async (id) => {
  return User.findByIdAndUpdate(id, { role: "ADMIN" }, { new: true });
};
