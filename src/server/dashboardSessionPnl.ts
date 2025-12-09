// src/server/dashboardSessionPnl.ts
import { app } from "./tvWebhookTest";
import { dashboardHtml } from "./dashboardLayout";

app.get("/dashboard/pnl", (_req, res) => {
  res.send(dashboardHtml("pnl"));
});
