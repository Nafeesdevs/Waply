import mongoose from "../config/db.js";
import { User } from "./userModel.js";
import { ApiUsage } from "./apiUsageModel.js";
import { ApiKey } from "./apiKeyModel.js";
import { WhatsAppConnection } from "./whatsappModel.js";

const DAY = 24 * 60 * 60 * 1000;

const startOfUtcDay = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const dayKey = (d) => d.toISOString().slice(0, 10);

// Builds [{date:'2026-10-01'}, ...] for the last `days` days (inclusive of today).
const buildDayRange = (days) => {
  const today = startOfUtcDay(new Date());
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    out.push(dayKey(new Date(today.getTime() - i * DAY)));
  }
  return out;
};

const pct = (num, den) => (den ? Math.round((num / den) * 1000) / 10 : 0);

/**
 * Everything the admin "Overview" and "Analytics" pages need, computed
 * from real collections. `days` is the analysis window (7 / 30 / 90).
 */
export const getPlatformAnalytics = async (days = 30) => {
  const now = new Date();
  const today = startOfUtcDay(now);
  const since = new Date(today.getTime() - (days - 1) * DAY);
  const prevSince = new Date(since.getTime() - days * DAY);

  const windowMatch = { createdAt: { $gte: since } };
  const prevMatch = { createdAt: { $gte: prevSince, $lt: since } };

  const [
    dailyUsage,
    dailySignups,
    windowTotals,
    prevTotals,
    endpoints,
    statusClasses,
    messageTypes,
    topCustomers,
    heatmap,
    topErrors,
    latency,
    customerCounts,
    keyCounts,
    waCounts,
    signupsPrev,
    messagesWindow,
    messagesPrev,
    recentCustomers,
    allTime,
  ] = await Promise.all([
    ApiUsage.aggregate([
      { $match: windowMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
          calls: { $sum: 1 },
          success: { $sum: { $cond: ["$success", 1, 0] } },
          failed: { $sum: { $cond: ["$success", 0, 1] } },
          messages: { $sum: { $cond: [{ $ne: ["$metaMessageId", null] }, 1, 0] } },
          avgMs: { $avg: "$responseTimeMs" },
        },
      },
    ]),
    User.aggregate([
      { $match: { role: "CUSTOMER", ...windowMatch } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
          signups: { $sum: 1 },
        },
      },
    ]),
    ApiUsage.aggregate([
      { $match: windowMatch },
      {
        $group: {
          _id: null,
          calls: { $sum: 1 },
          success: { $sum: { $cond: ["$success", 1, 0] } },
          failed: { $sum: { $cond: ["$success", 0, 1] } },
          activeUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: { _id: 0, calls: 1, success: 1, failed: 1, activeUsers: { $size: "$activeUsers" } },
      },
    ]),
    ApiUsage.aggregate([
      { $match: prevMatch },
      {
        $group: {
          _id: null,
          calls: { $sum: 1 },
          success: { $sum: { $cond: ["$success", 1, 0] } },
        },
      },
    ]),
    ApiUsage.aggregate([
      { $match: windowMatch },
      {
        $group: {
          _id: {
            method: "$method",
            path: { $arrayElemAt: [{ $split: ["$endpoint", "?"] }, 0] },
          },
          calls: { $sum: 1 },
          failed: { $sum: { $cond: ["$success", 0, 1] } },
          avgMs: { $avg: "$responseTimeMs" },
        },
      },
      { $sort: { calls: -1 } },
      { $limit: 8 },
    ]),
    ApiUsage.aggregate([
      { $match: windowMatch },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ["$statusCode", 500] }, then: "5xx" },
                { case: { $gte: ["$statusCode", 400] }, then: "4xx" },
                { case: { $gte: ["$statusCode", 300] }, then: "3xx" },
              ],
              default: "2xx",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    ApiUsage.aggregate([
      { $match: { ...windowMatch, messageType: { $ne: null } } },
      { $group: { _id: "$messageType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ApiUsage.aggregate([
      { $match: windowMatch },
      {
        $group: {
          _id: "$userId",
          calls: { $sum: 1 },
          failed: { $sum: { $cond: ["$success", 0, 1] } },
          messages: { $sum: { $cond: [{ $ne: ["$metaMessageId", null] }, 1, 0] } },
        },
      },
      { $sort: { calls: -1 } },
      { $limit: 6 },
    ]),
    ApiUsage.aggregate([
      { $match: windowMatch },
      {
        $group: {
          _id: {
            dow: { $dayOfWeek: { date: "$createdAt", timezone: "UTC" } }, // 1=Sun
            hour: { $hour: { date: "$createdAt", timezone: "UTC" } },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    ApiUsage.aggregate([
      { $match: { ...windowMatch, success: false, error: { $ne: null } } },
      { $group: { _id: "$error", count: { $sum: 1 }, last: { $max: "$createdAt" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    ApiUsage.aggregate([
      { $match: { ...windowMatch, responseTimeMs: { $ne: null } } },
      {
        $group: {
          _id: null,
          avg: { $avg: "$responseTimeMs" },
          max: { $max: "$responseTimeMs" },
          count: { $sum: 1 },
        },
      },
    ]),
    User.aggregate([
      { $match: { role: "CUSTOMER" } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    ApiKey.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    WhatsAppConnection.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    User.countDocuments({ role: "CUSTOMER", ...prevMatch }),
    ApiUsage.countDocuments({ ...windowMatch, metaMessageId: { $ne: null } }),
    ApiUsage.countDocuments({ ...prevMatch, metaMessageId: { $ne: null } }),
    User.find({ role: "CUSTOMER" })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("name email status createdAt")
      .lean(),
    ApiUsage.aggregate([
      {
        $group: {
          _id: null,
          calls: { $sum: 1 },
          success: { $sum: { $cond: ["$success", 1, 0] } },
          failed: { $sum: { $cond: ["$success", 0, 1] } },
          messages: { $sum: { $cond: [{ $ne: ["$metaMessageId", null] }, 1, 0] } },
        },
      },
    ]),
  ]);

  // ---- timeseries (fill gaps with zeros) ---------------------------------
  const usageByDay = new Map(dailyUsage.map((d) => [d._id, d]));
  const signupsByDay = new Map(dailySignups.map((d) => [d._id, d.signups]));
  const series = buildDayRange(days).map((date) => {
    const u = usageByDay.get(date);
    return {
      date,
      calls: u?.calls ?? 0,
      success: u?.success ?? 0,
      failed: u?.failed ?? 0,
      messages: u?.messages ?? 0,
      avgMs: u?.avgMs ? Math.round(u.avgMs) : 0,
      signups: signupsByDay.get(date) ?? 0,
    };
  });

  // ---- KPIs --------------------------------------------------------------
  const wt = windowTotals[0] || { calls: 0, success: 0, failed: 0, activeUsers: 0 };
  const pt = prevTotals[0] || { calls: 0, success: 0 };
  const growth = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 1000) / 10 : cur ? 100 : 0);

  const customerMap = Object.fromEntries(customerCounts.map((c) => [c._id, c.count]));
  const keyMap = Object.fromEntries(keyCounts.map((c) => [c._id, c.count]));
  const waMap = Object.fromEntries(waCounts.map((c) => [c._id, c.count]));
  const totalCustomers = (customerMap.ACTIVE || 0) + (customerMap.DEACTIVATED || 0);
  const signupsWindow = series.reduce((s, d) => s + d.signups, 0);

  // ---- latency (p95 via sorted skip, scales without loading all rows) ----
  const lat = latency[0];
  let p95 = 0;
  if (lat?.count) {
    const [row] = await ApiUsage.find({ ...windowMatch, responseTimeMs: { $ne: null } })
      .sort({ responseTimeMs: 1 })
      .skip(Math.min(lat.count - 1, Math.floor(lat.count * 0.95)))
      .limit(1)
      .select("responseTimeMs")
      .lean();
    p95 = row?.responseTimeMs ?? 0;
  }

  // ---- top customers (join names) ---------------------------------------
  const topIds = topCustomers.map((t) => t._id);
  const topUsers = await User.find({ _id: { $in: topIds } }).select("name email status").lean();
  const topUserMap = new Map(topUsers.map((u) => [String(u._id), u]));
  const top = topCustomers.map((t) => {
    const u = topUserMap.get(String(t._id));
    return {
      id: String(t._id),
      name: u?.name ?? "Deleted user",
      email: u?.email ?? "",
      status: u?.status ?? "DEACTIVATED",
      calls: t.calls,
      failed: t.failed,
      messages: t.messages,
      successRate: pct(t.calls - t.failed, t.calls),
    };
  });

  // ---- heatmap matrix [dow 0-6 (Mon..Sun)][hour 0-23] --------------------
  const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
  heatmap.forEach((h) => {
    const monFirst = (h._id.dow + 5) % 7; // Mongo: 1=Sun -> Mon=0 ... Sun=6
    matrix[monFirst][h._id.hour] = h.count;
  });

  const at = allTime[0] || { calls: 0, success: 0, failed: 0, messages: 0 };

  return {
    windowDays: days,
    generatedAt: now.toISOString(),
    kpis: {
      totalCustomers,
      activeCustomers: customerMap.ACTIVE || 0,
      deactivatedCustomers: customerMap.DEACTIVATED || 0,
      signupsWindow,
      signupsGrowth: growth(signupsWindow, signupsPrev),
      callsWindow: wt.calls,
      callsGrowth: growth(wt.calls, pt.calls),
      successRate: pct(wt.success, wt.calls),
      prevSuccessRate: pct(pt.success, pt.calls),
      failedWindow: wt.failed,
      messagesWindow,
      messagesGrowth: growth(messagesWindow, messagesPrev),
      activeUsersWindow: wt.activeUsers,
      apiKeysActive: keyMap.ACTIVE || 0,
      apiKeysRevoked: keyMap.REVOKED || 0,
      whatsappConnected: waMap.CONNECTED || 0,
      whatsappDisconnected: waMap.DISCONNECTED || 0,
      avgLatencyMs: Math.round(lat?.avg || 0),
      p95LatencyMs: Math.round(p95),
      maxLatencyMs: Math.round(lat?.max || 0),
      allTimeCalls: at.calls,
      allTimeSuccess: at.success,
      allTimeFailed: at.failed,
      allTimeMessages: at.messages,
    },
    series,
    endpoints: endpoints.map((e) => ({
      method: e._id.method,
      path: e._id.path,
      calls: e.calls,
      failed: e.failed,
      avgMs: Math.round(e.avgMs || 0),
    })),
    statusClasses: ["2xx", "3xx", "4xx", "5xx"].map((k) => ({
      label: k,
      count: statusClasses.find((s) => s._id === k)?.count ?? 0,
    })),
    messageTypes: messageTypes.map((m) => ({ label: m._id, count: m.count })),
    topCustomers: top,
    heatmap: matrix,
    topErrors: topErrors.map((e) => ({ error: e._id, count: e.count, last: e.last })),
    recentSignups: recentCustomers.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      status: u.status,
      createdAt: u.createdAt,
    })),
  };
};

/**
 * Paginated global API usage log with optional filters.
 */
export const listGlobalUsage = async ({
  page = 1,
  limit = 25,
  success,
  search,
  userId,
  days,
} = {}) => {
  const match = {};
  if (success === "true") match.success = true;
  if (success === "false") match.success = false;
  if (userId && mongoose.isValidObjectId(userId)) match.userId = new mongoose.Types.ObjectId(userId);
  if (days) match.createdAt = { $gte: new Date(Date.now() - Number(days) * DAY) };

  if (search) {
    const safe = String(search).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(safe, "i");
    const matchingUsers = await User.find({ $or: [{ name: rx }, { email: rx }] })
      .select("_id")
      .limit(200)
      .lean();
    match.$or = [
      { endpoint: rx },
      { error: rx },
      { messageType: rx },
      { metaMessageId: rx },
      { userId: { $in: matchingUsers.map((u) => u._id) } },
    ];
  }

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    ApiUsage.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ApiUsage.countDocuments(match),
  ]);

  const users = await User.find({ _id: { $in: rows.map((r) => r.userId) } })
    .select("name email")
    .lean();
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  return {
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
    rows: rows.map((r) => ({
      id: String(r._id),
      userId: String(r.userId),
      userName: userMap.get(String(r.userId))?.name ?? "Deleted user",
      userEmail: userMap.get(String(r.userId))?.email ?? "",
      endpoint: r.endpoint,
      method: r.method,
      statusCode: r.statusCode,
      success: r.success,
      messageType: r.messageType,
      metaMessageId: r.metaMessageId,
      error: r.error,
      ipAddress: r.ipAddress,
      responseTimeMs: r.responseTimeMs,
      createdAt: r.createdAt,
    })),
  };
};

/** Every API key on the platform with its owner and lifetime call count. */
export const listAllApiKeys = async () => {
  const keys = await ApiKey.find().sort({ createdAt: -1 }).select("-keyHash").lean();
  const userIds = [...new Set(keys.map((k) => String(k.userId)))];
  const [users, usage] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select("name email status").lean(),
    ApiUsage.aggregate([
      { $match: { apiKeyId: { $in: keys.map((k) => k._id) } } },
      { $group: { _id: "$apiKeyId", calls: { $sum: 1 }, failed: { $sum: { $cond: ["$success", 0, 1] } } } },
    ]),
  ]);
  const userMap = new Map(users.map((u) => [String(u._id), u]));
  const usageMap = new Map(usage.map((u) => [String(u._id), u]));

  return keys.map((k) => ({
    id: String(k._id),
    keyId: k.keyId,
    name: k.name ?? null,
    status: k.status,
    lastUsedAt: k.lastUsedAt ?? null,
    revokedAt: k.revokedAt ?? null,
    createdAt: k.createdAt,
    owner: {
      id: String(k.userId),
      name: userMap.get(String(k.userId))?.name ?? "Deleted user",
      email: userMap.get(String(k.userId))?.email ?? "",
      status: userMap.get(String(k.userId))?.status ?? "DEACTIVATED",
    },
    calls: usageMap.get(String(k._id))?.calls ?? 0,
    failed: usageMap.get(String(k._id))?.failed ?? 0,
  }));
};

/** Every WhatsApp connection (never includes the encrypted token). */
export const listAllWhatsApp = async () => {
  const conns = await WhatsAppConnection.find()
    .select("-accessTokenEncrypted")
    .sort({ updatedAt: -1 })
    .lean();
  const users = await User.find({ _id: { $in: conns.map((c) => c.userId) } })
    .select("name email status")
    .lean();
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  return conns.map((c) => ({
    id: String(c._id),
    status: c.status,
    wabaId: c.wabaId,
    phoneNumberId: c.phoneNumberId,
    businessName: c.businessName ?? null,
    displayPhoneNumber: c.displayPhoneNumber ?? null,
    connectedAt: c.connectedAt ?? null,
    disconnectedAt: c.disconnectedAt ?? null,
    owner: {
      id: String(c.userId),
      name: userMap.get(String(c.userId))?.name ?? "Deleted user",
      email: userMap.get(String(c.userId))?.email ?? "",
      status: userMap.get(String(c.userId))?.status ?? "DEACTIVATED",
    },
  }));
};

export const findApiKeyById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return ApiKey.findById(id);
};

export const updateUserPassword = async (id, hashedPassword) => {
  return User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
};

export const getSystemSnapshot = async () => {
  const [users, admins, keys, conns, usage] = await Promise.all([
    User.countDocuments({ role: "CUSTOMER" }),
    User.countDocuments({ role: "ADMIN" }),
    ApiKey.countDocuments(),
    WhatsAppConnection.countDocuments(),
    ApiUsage.countDocuments(),
  ]);
  return { users, admins, keys, conns, usage };
};
