import "dotenv/config";
import mongoose from "mongoose";

// MongoDB connection (replaces the previous MySQL/Prisma client).
// DATABASE_URL example: mongodb://127.0.0.1:27017/waply
export const connectDB = async () => {
  await mongoose.connect(process.env.DATABASE_URL, {
    maxPoolSize: 5,
  });
  console.log("MongoDB connected");
};

export default mongoose;
