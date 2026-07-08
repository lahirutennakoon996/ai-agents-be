import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  messages:  {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    expires: 24*60*60, // TTL: 24h
  },
});

export default mongoose.model("session", sessionSchema);