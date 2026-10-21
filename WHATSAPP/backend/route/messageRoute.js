import express from "express";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";
import { usageLogger } from "../middleware/usageLogger.js";
import { messageApiRateLimiter } from "../middleware/rateLimiter.js";
import { sendMessage } from "../controller/messageController.js";

const router = express.Router();

router.post(
  "/v1/whatsapp/messages",
  messageApiRateLimiter,
  apiKeyAuth,
  usageLogger,
  sendMessage
);

export default router;
