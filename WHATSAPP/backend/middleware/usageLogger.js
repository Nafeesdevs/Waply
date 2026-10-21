import { recordApiUsage } from "../model/apiUsageModel.js";

/**
 * Attaches req.logUsage(extra) which controllers call right before
 * responding, and also guarantees a fallback log entry is written even
 * if a controller forgets or an unexpected error occurs — based on
 * whatever req.customer / req.apiKey were resolved by apiKeyAuth.
 */
export const usageLogger = (req, res, next) => {
  const start = Date.now();
  let logged = false;

  req.logUsage = async (extra = {}) => {
    if (logged) return;
    logged = true;

    if (!req.customer) return; // nothing to attribute the call to

    try {
      await recordApiUsage({
        userId: req.customer.id,
        apiKeyId: req.apiKey?.id ?? null,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: extra.statusCode ?? res.statusCode,
        success: extra.success ?? res.statusCode < 400,
        messageType: extra.messageType ?? null,
        metaMessageId: extra.metaMessageId ?? null,
        error: extra.error ?? null,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        responseTimeMs: Date.now() - start,
      });
    } catch (err) {
      console.error("Failed to record API usage:", err.message);
    }
  };

  res.on("finish", () => {
    if (!logged) {
      req.logUsage();
    }
  });

  next();
};
