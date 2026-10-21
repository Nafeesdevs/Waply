// import express from "express";
// import { authenticate, requireCustomer } from "../middleware/authMiddleware.js";
// import {
//   connectWhatsApp,
//   getWhatsAppStatus,
//   disconnectWhatsApp,
// } from "../controller/whatsappController.js";

// const router = express.Router();

// router.post("/whatsapp/connect", authenticate, requireCustomer, connectWhatsApp);
// router.get("/whatsapp/status", authenticate, requireCustomer, getWhatsAppStatus);
// router.post("/whatsapp/disconnect", authenticate, requireCustomer, disconnectWhatsApp);

// // Backward-compatible alias for the original DELETE-based disconnect route.
// router.delete("/whatsapp/disconnect", authenticate, requireCustomer, disconnectWhatsApp);

// export default router;



import express from "express";

import {
  authenticate,
  requireCustomer
} from "../middleware/authMiddleware.js";

import {
  connectWhatsApp,
  getWhatsAppStatus,
  disconnectWhatsApp,
  sendWhatsAppTextMessage,
} from "../controller/whatsappController.js";

const router = express.Router();

router.post(
  "/whatsapp/connect",
  authenticate,
  requireCustomer,
  connectWhatsApp
);

router.get(
  "/whatsapp/status",
  authenticate,
  requireCustomer,
  getWhatsAppStatus
);

router.post(
  "/whatsapp/disconnect",
  authenticate,
  requireCustomer,
  disconnectWhatsApp
);

router.delete(
  "/whatsapp/disconnect",
  authenticate,
  requireCustomer,
  disconnectWhatsApp
);

// Send WhatsApp message
router.post(
  "/whatsapp/messages",
  authenticate,
  requireCustomer,
  sendWhatsAppTextMessage
);

export default router;