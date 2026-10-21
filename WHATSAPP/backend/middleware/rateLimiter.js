import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Protects login/register from brute-force / credential stuffing.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});

// Generic limiter for the external, API-key-authenticated message API.
// Keyed by API key when available so one customer's traffic can't
// exhaust another customer's allowance.
export const messageApiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const authHeader = req.headers.authorization || "";
    return authHeader || ipKeyGenerator(req.ip);
  },
  message: {
    success: false,
    message: "Rate limit exceeded, please slow down",
  },
});

// Looser limiter applied globally to authenticated SaaS dashboard APIs.
export const generalApiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
