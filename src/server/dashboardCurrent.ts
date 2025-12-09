// src/server/dashboardCurrent.ts
import { app } from "./tvWebhookTest";
import { dashboardHtml } from "./dashboardLayout";

app.get("/dashboard/current", (_req, res) => {
  res.send(dashboardHtml("current"));
});
