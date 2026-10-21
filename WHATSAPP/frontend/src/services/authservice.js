import api from "./api";

const extractMessage = (err, fallback) =>
  err?.response?.data?.message || fallback;

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * -> { message, user: { id, name, email, role, status } }
 * (Backend always creates CUSTOMER accounts here — admins are seeded
 * server-side from ADMIN_EMAIL / ADMIN_PASSWORD.)
 */
export const registerUser = async (payload) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, "Something went wrong. Please try again."));
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 * -> { message, token, user: { id, name, email, role, status, ... } }
 */
export const loginUser = async (payload) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data;
  } catch (err) {
    throw new Error(
      extractMessage(err, "Invalid email or password. Please try again.")
    );
  }
};

/**
 * GET /api/auth/me (requires Authorization: Bearer <jwt>)
 * -> { user }
 */
export const getMe = async () => {
  try {
    const { data } = await api.get("/auth/me");
    return data.user;
  } catch (err) {
    throw new Error(extractMessage(err, "Unable to load your account."));
  }
};

export default { registerUser, loginUser, getMe };
