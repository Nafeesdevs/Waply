import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import userRoute from "./route/userRoute.js";
import whatsappRoute from "./route/whatsappRoute.js";
import apiKeyRoute from "./route/apiKeyRoute.js";
import messageRoute from "./route/messageRoute.js";
import adminRoute from "./route/adminRoute.js";
import webhookRoute from "./route/webhookRoute.js";

import { generalApiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// Secure HTTP headers.
app.use(helmet());

// CORS is restricted to the configured frontend origin(s). Set
// FRONTEND_URL (comma-separated for multiple origins) in .env.
// const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
//   .split(",")
//   .map((origin) => origin.trim())
//   .filter(Boolean);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow non-browser tools (no Origin header) and configured origins.
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }
//       return callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   })
// );


app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Waply API is running",
  });
});

// Health check — useful for uptime monitors / container orchestration.
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Webhooks are called by Meta directly (no CORS/browser involved) and
// have no general rate limit, since Meta may burst-deliver events.
app.use("/api", webhookRoute);

// Everything else authenticated/dashboard-facing gets a general limiter.
app.use("/api", generalApiRateLimiter, userRoute);
app.use("/api", generalApiRateLimiter, whatsappRoute);
app.use("/api", generalApiRateLimiter, apiKeyRoute);
app.use("/api", generalApiRateLimiter, adminRoute);

// The external, API-key-authenticated message API has its own
// dedicated rate limiter (see route/messageRoute.js).
app.use("/api", messageRoute);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
