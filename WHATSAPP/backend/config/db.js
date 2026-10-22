import "dotenv/config";
import mongoose from "mongoose";

export const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is missing. Check your backend/.env file."
    );
  }

  const conn = await mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 5,
  });

  await mongoose.connection.db.admin().ping();

  console.log(
    "MongoDB Connected with server:",
    conn.connection.host
  );
};

export default mongoose;