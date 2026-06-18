import express from "express";

import { runAgent } from "./agent.js";

const app = express();
app.use(express.json());

app.post("/api/agent", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }
  try {
    const reply = await runAgent(message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent failed" });
  }
});

app.listen(3000, () => console.log("Agent running on http://localhost:3000"));