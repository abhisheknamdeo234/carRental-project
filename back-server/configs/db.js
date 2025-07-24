// configs/db.js
import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB connected`);
  } catch (err) {
    console.error(`❌ DB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDb;
