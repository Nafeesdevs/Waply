import express from "express";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";
import {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
  getCustomerUsage,
  getAdminStats,
  getAnalytics,
  getGlobalUsage,
  getAllApiKeys,
  adminRevokeApiKey,
  getAllWhatsApp,
  adminDisconnectWhatsApp,
  adminResetPassword,
  getAuditLog,
  getSystemHealth,
} from "../controller/adminController.js";

const router = express.Router();

// Every /api/admin/* route requires a valid JWT AND the ADMIN role
// (re-checked against the database on every request).
router.use("/admin", authenticate, requireAdmin);

router.get("/admin/stats", getAdminStats);
router.get("/admin/analytics", getAnalytics);
router.get("/admin/system", getSystemHealth);
router.get("/admin/audit", getAuditLog);

router.get("/admin/customers", getAllCustomers);
router.get("/admin/customers/:id", getCustomerById);
router.patch("/admin/customers/:id/status", updateCustomerStatus);
router.get("/admin/customers/:id/usage", getCustomerUsage);
router.post("/admin/customers/:id/reset-password", adminResetPassword);
router.patch("/admin/customers/:id/whatsapp/disconnect", adminDisconnectWhatsApp);

router.get("/admin/usage", getGlobalUsage);
router.get("/admin/api-keys", getAllApiKeys);
router.patch("/admin/api-keys/:id/revoke", adminRevokeApiKey);
router.get("/admin/whatsapp", getAllWhatsApp);

export default router;
