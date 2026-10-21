import express from "express";
import { verifyWebhook, handleWebhookEvent } from "../controller/webhookController.js";

const router = express.Router();

router.get("/webhooks/meta", verifyWebhook);
router.post("/webhooks/meta", handleWebhookEvent);

export default router;
