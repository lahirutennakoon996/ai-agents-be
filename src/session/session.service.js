import SessionModel from "./session.model.js";

export const saveSession = async (sessionId, messages) => {
  await SessionModel.findOneAndUpdate(
    { sessionId },
    { messages, updatedAt: new Date() },
    { upsert: true }  // creates doc if it doesn't exist yet
  );
}

export const loadSession = async (sessionId) => {
  const doc = await SessionModel.findOne({ sessionId }).lean();
  return doc?.messages ?? [];
}