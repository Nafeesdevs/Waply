import express from "express";
import { authenticate, requireCustomer } from "../middleware/authMiddleware.js";
import {
  generateKey,
  listKeys,
  revokeKey,
  regenerateKey,
} from "../controller/apiKeyController.js";

const router = express.Router();

router.post("/keys", authenticate, requireCustomer, generateKey);
router.get("/keys", authenticate, requireCustomer, listKeys);
router.delete("/keys/:keyId", authenticate, requireCustomer, revokeKey);
router.post("/keys/:keyId/regenerate", authenticate, requireCustomer, regenerateKey);

export default router;
