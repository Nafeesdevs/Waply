import mongoose from "../config/db.js";
import { applyJsonTransform } from "../utils/schemaPlugin.js";

const whatsappSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    wabaId: { type: String, required: true, index: true },
    phoneNumberId: { type: String, required: true, index: true },
    businessName: { type: String, default: null },
    displayPhoneNumber: { type: String, default: null },

    // Meta access token, encrypted at rest (AES-256-GCM). Never returned to clients.
    accessTokenEncrypted: { type: String, default: "" },

    status: {
      type: String,
      enum: ["CONNECTED", "DISCONNECTED"],
      default: "CONNECTED",
      index: true,
    },

    connectedAt: { type: Date, default: null },
    disconnectedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
applyJsonTransform(whatsappSchema);

export const WhatsAppConnection =
  mongoose.models.WhatsAppConnection ||
  mongoose.model("WhatsAppConnection", whatsappSchema);

export const upsertWhatsAppConnection = async ({
  userId,
  wabaId,
  phoneNumberId,
  businessName,
  displayPhoneNumber,
  accessTokenEncrypted,
}) => {
  const now = new Date();

  return WhatsAppConnection.findOneAndUpdate(
    { userId },
    {
      $set: {
        wabaId,
        phoneNumberId,
        businessName,
        displayPhoneNumber,
        accessTokenEncrypted,
        status: "CONNECTED",
        connectedAt: now,
        disconnectedAt: null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const findWhatsAppConnectionByUserId = async (userId) => {
  return WhatsAppConnection.findOne({ userId });
};

// Used by the Meta webhook to resolve the owning customer.
export const findWhatsAppConnectionByPhoneNumberId = async (phoneNumberId) => {
  return WhatsAppConnection.findOne({ phoneNumberId });
};

// Safe projection — never includes accessTokenEncrypted.
export const findWhatsAppConnectionSafeByUserId = async (userId) => {
  return WhatsAppConnection.findOne({ userId })
    .select(
      "wabaId phoneNumberId businessName displayPhoneNumber status connectedAt disconnectedAt createdAt updatedAt"
    )
    .lean()
    .then((w) => w && { id: String(w._id), ...w, _id: undefined });
};

export const countWhatsAppByStatus = async (status) => {
  return WhatsAppConnection.countDocuments({ status });
};

export const markWhatsAppDisconnected = async (userId) => {
  return WhatsAppConnection.findOneAndUpdate(
    { userId },
    {
      $set: {
        status: "DISCONNECTED",
        disconnectedAt: new Date(),
        // Overwrite the stored credential so a disconnected connection can
        // never be used to send messages again, even if re-read directly.
        accessTokenEncrypted: "",
      },
    },
    { new: true }
  );
};
