import "dotenv/config";
import mongoose from "mongoose";

// Connect once, reuse the connection across requests
if (mongoose.connection.readyState === 0) {
  await mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to Mongodb');
    })
    .catch((err) => {
      console.error('Error connecting to Mongodb:', err);
    });
}