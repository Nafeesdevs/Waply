import mongoose from "../config/db.js";
import { applyJsonTransform } from "../utils/schemaPlugin.js";

const apiUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      default: null,
      index: true,
    },

    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    statusCode: { type: Number, required: true },
    success: { type: Boolean, required: true },

    messageType: { type: String, default: null },
    metaMessageId: { type: String, default: null },
    error: { type: String, default: null },

    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    responseTimeMs: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
apiUsageSchema.index({ createdAt: 1 });
applyJsonTransform(apiUsageSchema);

export const ApiUsage = mongoose.models.ApiUsage || mongoose.model("ApiUsage", apiUsageSchema);

export const recordApiUsage = async ({
  userId,
  apiKeyId = null,
  endpoint,
  method,
  statusCode,
  success,
  messageType = null,
  metaMessageId = null,
  error = null,
  ipAddress = null,
  userAgent = null,
  responseTimeMs = null,
}) => {
  return ApiUsage.create({
    userId,
    apiKeyId,
    endpoint,
    method,
    statusCode,
    success,
    messageType,
    metaMessageId,
    error: error ? String(error).slice(0, 480) : null,
    ipAddress,
    userAgent: userAgent ? String(userAgent).slice(0, 480) : null,
    responseTimeMs,
  });
};

export const listUsageByUser = async (userId, { take = 100 } = {}) => {
  const rows = await ApiUsage.find({ userId }).sort({ createdAt: -1 }).limit(take).lean();
  return rows.map((r) => ({ ...r, id: String(r._id) }));
};

export const getUsageStatsByUser = async (userId) => {
  const [total, success, failed] = await Promise.all([
    ApiUsage.countDocuments({ userId }),
    ApiUsage.countDocuments({ userId, success: true }),
    ApiUsage.countDocuments({ userId, success: false }),
  ]);

  return { totalCalls: total, successfulCalls: success, failedCalls: failed };
};

export const getGlobalUsageStats = async () => {
  const [total, success, failed, messagesSent] = await Promise.all([
    ApiUsage.countDocuments(),
    ApiUsage.countDocuments({ success: true }),
    ApiUsage.countDocuments({ success: false }),
    ApiUsage.countDocuments({ metaMessageId: { $ne: null } }),
  ]);

  return {
    totalApiCalls: total,
    successfulApiCalls: success,
    failedApiCalls: failed,
    totalWhatsAppMessages: messagesSent,
  };
};
