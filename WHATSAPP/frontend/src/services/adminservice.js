import api from "./api";

const extractMessage = (err, fallback) =>
  err?.response?.data?.message || fallback;

/**
 * GET /api/admin/stats
 * -> { totalCustomers, activeCustomers, deactivatedCustomers,
 *      connectedWhatsAppAccounts, disconnectedWhatsAppAccounts, ...usageStats }
 */
export const getAdminStats = async () => {
  try {
    const { data } = await api.get("/admin/stats");
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to load dashboard stats."));
  }
};

/**
 * GET /api/admin/customers
 * -> { customers: [{ id, name, email, status, createdAt, whatsapp, apiUsageCount, apiKeyCount }] }
 */
export const listCustomers = async () => {
  try {
    const { data } = await api.get("/admin/customers");
    return data.customers || [];
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to load customers."));
  }
};

/**
 * GET /api/admin/customers/:id
 * -> { customer }
 */
export const getCustomerById = async (id) => {
  try {
    const { data } = await api.get(`/admin/customers/${id}`);
    return data.customer;
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to load this customer."));
  }
};

/**
 * PATCH /api/admin/customers/:id/status
 * Body: { status: 'ACTIVE' | 'DEACTIVATED' }
 * -> { message, customer }
 */
export const updateCustomerStatus = async (id, status) => {
  try {
    const { data } = await api.patch(`/admin/customers/${id}/status`, { status });
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to update this customer's status."));
  }
};

/**
 * GET /api/admin/customers/:id/usage
 * -> { stats, recentUsage: [...] }
 */
export const getCustomerUsage = async (id) => {
  try {
    const { data } = await api.get(`/admin/customers/${id}/usage`);
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to load usage for this customer."));
  }
};

const wrap = (fallback, fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    throw new Error(extractMessage(err, fallback));
  }
};

/** GET /api/admin/analytics?days=7|30|90 -> { kpis, series, endpoints, ... } */
export const getAnalytics = wrap("Unable to load analytics.", async (days = 30) => {
  const { data } = await api.get("/admin/analytics", { params: { days } });
  return data;
});

/** GET /api/admin/usage -> { rows, total, page, pages } */
export const getGlobalUsage = wrap("Unable to load API logs.", async (params = {}) => {
  const { data } = await api.get("/admin/usage", { params });
  return data;
});

/** GET /api/admin/api-keys -> [{ id, keyId, name, status, owner, calls, ... }] */
export const listAllApiKeys = wrap("Unable to load API keys.", async () => {
  const { data } = await api.get("/admin/api-keys");
  return data.keys || [];
});

/** PATCH /api/admin/api-keys/:id/revoke */
export const revokeApiKeyAsAdmin = wrap("Unable to revoke this API key.", async (id) => {
  const { data } = await api.patch(`/admin/api-keys/${id}/revoke`);
  return data;
});

/** GET /api/admin/whatsapp -> [{ status, businessName, owner, ... }] */
export const listAllWhatsApp = wrap("Unable to load WhatsApp connections.", async () => {
  const { data } = await api.get("/admin/whatsapp");
  return data.connections || [];
});

/** PATCH /api/admin/customers/:id/whatsapp/disconnect */
export const disconnectCustomerWhatsApp = wrap("Unable to disconnect WhatsApp.", async (id) => {
  const { data } = await api.patch(`/admin/customers/${id}/whatsapp/disconnect`);
  return data;
});

/** POST /api/admin/customers/:id/reset-password */
export const resetCustomerPassword = wrap("Unable to reset the password.", async (id, password) => {
  const { data } = await api.post(`/admin/customers/${id}/reset-password`, { password });
  return data;
});

/** GET /api/admin/audit -> [{ action, adminEmail, targetLabel, createdAt }] */
export const getAuditLog = wrap("Unable to load the audit log.", async (limit = 100) => {
  const { data } = await api.get("/admin/audit", { params: { limit } });
  return data.logs || [];
});

/** GET /api/admin/system */
export const getSystemHealth = wrap("Unable to load system health.", async () => {
  const { data } = await api.get("/admin/system");
  return data;
});

export default {
  getAdminStats,
  listCustomers,
  getCustomerById,
  updateCustomerStatus,
  getCustomerUsage,
  getAnalytics,
  getGlobalUsage,
  listAllApiKeys,
  revokeApiKeyAsAdmin,
  listAllWhatsApp,
  disconnectCustomerWhatsApp,
  resetCustomerPassword,
  getAuditLog,
  getSystemHealth,
};
