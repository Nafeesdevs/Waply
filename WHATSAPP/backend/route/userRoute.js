import express from "express";
import { login, register, getMe } from "../controller/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/auth/register", authRateLimiter, register);
router.post("/auth/login", authRateLimiter, login);
router.get("/auth/me", authenticate, getMe);

// Backward-compatible aliases matching the project's original routes.
router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);

export default router;
