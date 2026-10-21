import {
  listCustomers,
  findCustomerDetailById,
  updateUserStatus,
  countUsersByRole,
  countUsersByRoleAndStatus,
} from "../model/userModel.js";
import { countWhatsAppByStatus } from "../model/whatsappModel.js";
import mongoose from "../config/db.js";
import {
  listUsageByUser,
  getUsageStatsByUser,
  getGlobalUsageStats,
} from "../model/apiUsageModel.js";
import {
  getPlatformAnalytics,
  listGlobalUsage,
  listAllApiKeys,
  listAllWhatsApp,
  findApiKeyById,
  updateUserPassword,
  getSystemSnapshot,
} from "../model/adminAnalyticsModel.js";
import { revokeApiKey } from "../model/apiKeyModel.js";
import { markWhatsAppDisconnected, findWhatsAppConnectionByUserId } from "../model/whatsappModel.js";
import { recordAudit, listAuditLogs } from "../model/auditLogModel.js";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

// GET /api/admin/customers
export const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await listCustomers();

  const shaped = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    status: c.status,
    createdAt: c.createdAt,
    whatsapp: c.whatsapp
      ? {
          status: c.whatsapp.status,
          businessName: c.whatsapp.businessName,
          displayPhoneNumber: c.whatsapp.displayPhoneNumber,
        }
      : null,
    apiUsageCount: c._count.apiUsage,
    apiKeyCount: c._count.apiKeys,
  }));

  return res.status(200).json({ customers: shaped });
});

// GET /api/admin/customers/:id
export const getCustomerById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid customer id", 400);

  const customer = await findCustomerDetailById(id);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return res.status(200).json({ customer });
});

// PATCH /api/admin/customers/:id/status
export const updateCustomerStatus = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid customer id", 400);

  const { status } = req.body;

  if (!["ACTIVE", "DEACTIVATED"].includes(status)) {
    throw new AppError("'status' must be ACTIVE or DEACTIVATED", 400);
  }

  const customer = await findCustomerDetailById(id);
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const updated = await updateUserStatus(id, status);

  await recordAudit(req, {
    action: status === "ACTIVE" ? "CUSTOMER_ACTIVATED" : "CUSTOMER_DEACTIVATED",
    targetType: "CUSTOMER",
    targetId: id,
    targetLabel: customer.email,
  });

  return res.status(200).json({
    message: `Customer ${status === "ACTIVE" ? "activated" : "deactivated"} successfully`,
    customer: updated,
  });
});

// GET /api/admin/customers/:id/usage
export const getCustomerUsage = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid customer id", 400);

  const customer = await findCustomerDetailById(id);
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const [stats, recent] = await Promise.all([
    getUsageStatsByUser(id),
    listUsageByUser(id, { take: 100 }),
  ]);

  return res.status(200).json({
    stats,
    recentUsage: recent.map((u) => ({
      id: u.id,
      endpoint: u.endpoint,
      method: u.method,
      statusCode: u.statusCode,
      success: u.success,
      messageType: u.messageType,
      metaMessageId: u.metaMessageId,
      error: u.error,
      createdAt: u.createdAt,
    })),
  });
});

// GET /api/admin/stats
export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalCustomers,
    activeCustomers,
    deactivatedCustomers,
    connectedWhatsApp,
    disconnectedWhatsApp,
    usageStats,
  ] = await Promise.all([
    countUsersByRole("CUSTOMER"),
    countUsersByRoleAndStatus("CUSTOMER", "ACTIVE"),
    countUsersByRoleAndStatus("CUSTOMER", "DEACTIVATED"),
    countWhatsAppByStatus("CONNECTED"),
    countWhatsAppByStatus("DISCONNECTED"),
    getGlobalUsageStats(),
  ]);

  return res.status(200).json({
    totalCustomers,
    activeCustomers,
    deactivatedCustomers,
    connectedWhatsAppAccounts: connectedWhatsApp,
    disconnectedWhatsAppAccounts: disconnectedWhatsApp,
    ...usageStats,
  });
});

// GET /api/admin/analytics?days=30
export const getAnalytics = asyncHandler(async (req, res) => {
  const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
  const data = await getPlatformAnalytics(days);
  return res.status(200).json(data);
});

// GET /api/admin/usage?page=1&limit=25&success=true|false&search=&userId=&days=
export const getGlobalUsage = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(5, parseInt(req.query.limit, 10) || 25));
  const data = await listGlobalUsage({
    page,
    limit,
    success: req.query.success,
    search: req.query.search,
    userId: req.query.userId,
    days: req.query.days,
  });
  return res.status(200).json(data);
});

// GET /api/admin/api-keys
export const getAllApiKeys = asyncHandler(async (req, res) => {
  const keys = await listAllApiKeys();
  return res.status(200).json({ keys });
});

// PATCH /api/admin/api-keys/:id/revoke
export const adminRevokeApiKey = asyncHandler(async (req, res) => {
  const key = await findApiKeyById(req.params.id);
  if (!key) throw new AppError("API key not found", 404);
  if (key.status === "REVOKED") throw new AppError("API key is already revoked", 409);

  await revokeApiKey(key._id);
  await recordAudit(req, {
    action: "API_KEY_REVOKED",
    targetType: "API_KEY",
    targetId: key.keyId,
    targetLabel: key.name || key.keyId,
  });

  return res.status(200).json({ message: "API key revoked" });
});

// GET /api/admin/whatsapp
export const getAllWhatsApp = asyncHandler(async (req, res) => {
  const connections = await listAllWhatsApp();
  return res.status(200).json({ connections });
});

// PATCH /api/admin/customers/:id/whatsapp/disconnect
export const adminDisconnectWhatsApp = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid customer id", 400);

  const customer = await findCustomerDetailById(id);
  if (!customer) throw new AppError("Customer not found", 404);

  const conn = await findWhatsAppConnectionByUserId(id);
  if (!conn || conn.status === "DISCONNECTED") {
    throw new AppError("This customer has no connected WhatsApp account", 409);
  }

  await markWhatsAppDisconnected(id);
  await recordAudit(req, {
    action: "WHATSAPP_DISCONNECTED",
    targetType: "WHATSAPP",
    targetId: id,
    targetLabel: customer.email,
  });

  return res.status(200).json({ message: "WhatsApp account disconnected" });
});

// POST /api/admin/customers/:id/reset-password   Body: { password }
export const adminResetPassword = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid customer id", 400);

  const { password } = req.body;
  if (typeof password !== "string" || password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const customer = await findCustomerDetailById(id);
  if (!customer) throw new AppError("Customer not found", 404);

  await updateUserPassword(id, await bcrypt.hash(password, 12));
  await recordAudit(req, {
    action: "CUSTOMER_PASSWORD_RESET",
    targetType: "CUSTOMER",
    targetId: id,
    targetLabel: customer.email,
  });

  return res.status(200).json({ message: "Password updated" });
});

// GET /api/admin/audit?limit=100
export const getAuditLog = asyncHandler(async (req, res) => {
  const limit = Math.min(300, Math.max(10, parseInt(req.query.limit, 10) || 100));
  const logs = await listAuditLogs({ limit });
  return res.status(200).json({ logs });
});

// GET /api/admin/system
export const getSystemHealth = asyncHandler(async (req, res) => {
  const started = Date.now();
  let dbPingMs = null;
  try {
    await mongoose.connection.db.admin().ping();
    dbPingMs = Date.now() - started;
  } catch {
    dbPingMs = null;
  }

  const mem = process.memoryUsage();
  const counts = await getSystemSnapshot();

  return res.status(200).json({
    status: dbPingMs === null ? "degraded" : "ok",
    uptimeSeconds: Math.round(process.uptime()),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "development",
    db: {
      state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
      name: mongoose.connection.name,
      pingMs: dbPingMs,
    },
    memory: {
      rssMb: Math.round(mem.rss / 1048576),
      heapUsedMb: Math.round(mem.heapUsed / 1048576),
      heapTotalMb: Math.round(mem.heapTotal / 1048576),
    },
    config: {
      metaApiVersion: process.env.META_API_VERSION || "v21.0",
      metaAppConfigured: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
      webhookVerifyTokenSet: Boolean(process.env.META_VERIFY_TOKEN),
      adminSeedConfigured: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD),
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    },
    counts,
    serverTime: new Date().toISOString(),
  });
});
