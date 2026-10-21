import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedAdmin } from "./scripts/seedAdmin.js";

const PORT = process.env.PORT || 5000;

const REQUIRED_ENV_VARS = ["JWT_SECRET", "DATABASE_URL", "ENCRYPTION_KEY"];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}. See .env.example.`
    );
    process.exit(1);
  }
}

async function start() {
  validateEnv();

  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }

  try {
    await seedAdmin();
  } catch (error) {
    console.error("Failed to run admin seed:", error.message);
    // Do not crash the server over a seed failure (e.g. DB not yet
    // reachable during first boot) — log and continue.
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
