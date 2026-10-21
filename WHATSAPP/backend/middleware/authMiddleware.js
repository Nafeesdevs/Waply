import jwt from "jsonwebtoken";
import { findUserByIdInternal } from "../model/userModel.js";

/**
 * Verifies the JWT and loads the CURRENT user from the database (never
 * trusts stale claims from the token body for role/status), then
 * attaches a safe user object to req.user.
 *
 * This is what "identify the authenticated customer" means throughout
 * the app — every customer-scoped route/query uses req.user.id, NEVER
 * a customerId taken from the request body/params.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await findUserByIdInternal(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (user.status === "DEACTIVATED") {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/** Restricts a route to ADMIN accounts only. Use after `authenticate`. */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/** Restricts a route to CUSTOMER accounts only. Use after `authenticate`. */
export const requireCustomer = (req, res, next) => {
  if (!req.user || req.user.role !== "CUSTOMER") {
    return res
      .status(403)
      .json({ message: "This endpoint is only available to customers" });
  }
  next();
};
