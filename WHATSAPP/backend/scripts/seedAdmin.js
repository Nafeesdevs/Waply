import bcrypt from "bcryptjs";
import { findUserByEmail, createUser, promoteUserToAdmin } from "../model/userModel.js";

/**
 * Ensures exactly one ADMIN user exists ONLY IF environment variables
 * ADMIN_EMAIL and ADMIN_PASSWORD are set.
 * If not set, it safely skips seeding.
 */
export async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  const cleanEmail = adminEmail.toLowerCase().trim();
  const existing = await findUserByEmail(cleanEmail);

  if (existing) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    existing.role = "ADMIN";
    existing.password = hashedPassword;
    existing.status = "ACTIVE";
    await existing.save();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await createUser("Admin", cleanEmail, hashedPassword, "ADMIN");
}
