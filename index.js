import express from "express";
import { randomUUID } from "crypto";

import './config/session.db.config.js';
import { runAgent } from "./agent.js";

const app = express();
app.use(express.json());

app.post("/api/agent", async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  // If client doesn't send a sessionId, create a new one.
  // Client should persist and reuse this UUID for the whole conversation.
  const sId = sessionId ?? randomUUID();

  try {
    const reply = await runAgent(message, sId);

    // Return sessionId so the client can use it in the next request
    res.json({ reply, sessionId: sId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent failed" });
  }
});

app.listen(3000, () => console.log("Agent running on http://localhost:3000"));