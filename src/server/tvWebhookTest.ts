// src/server/tvWebhookTest.ts
import express from "express";
import { TV_WEBHOOK_PATH, tvWebhookHandler } from "./tvWebhookHandler";
export const app = express();

const PORT = Number(process.env.PORT) || 3000;

console.log("Bootstrapping TV TEST webhook server...");
console.log("Using PORT:", PORT);

// Middleware
app.use(express.json());
app.use(express.text({ type: "*/*" }));

// Route
app.post(TV_WEBHOOK_PATH, tvWebhookHandler);

// Health endpoint (optional but handy for debugging)
app.get("/health", (_req, res) => {
  console.log("💓 Health check hit");
  res.json({ ok: true, status: "healthy" });
});

// Start server
app.listen(PORT, () => {
  
  console.log(
    `✅ TV TEST webhook running at http://localhost:${PORT}${TV_WEBHOOK_PATH}`
  );
});
