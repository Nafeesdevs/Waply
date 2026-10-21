import { AppError } from "../utils/AppError.js";

const ALLOWED_TYPES = ["text", "template"];

export function validateSendMessagePayload(body) {
  const { to, type, message } = body || {};

  if (!to || typeof to !== "string") {
    throw new AppError("'to' is required and must be a string (E.164-style phone number)", 400);
  }

  if (!/^\d{7,15}$/.test(to.replace(/^\+/, ""))) {
    throw new AppError("'to' must be a valid phone number, digits only (with optional leading +)", 400);
  }

  const messageType = type || "text";
  if (!ALLOWED_TYPES.includes(messageType)) {
    throw new AppError(`'type' must be one of: ${ALLOWED_TYPES.join(", ")}`, 400);
  }

  if (!message) {
    throw new AppError("'message' is required", 400);
  }

  if (messageType === "text" && typeof message !== "string") {
    throw new AppError("'message' must be a string when type is 'text'", 400);
  }

  if (messageType === "template" && typeof message !== "object") {
    throw new AppError(
      "'message' must be a template object ({ name, language, components }) when type is 'template'",
      400
    );
  }

  return { to: to.replace(/^\+/, ""), type: messageType, message };
}
