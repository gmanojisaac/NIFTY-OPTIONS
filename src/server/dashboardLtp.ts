// src/server/dashboardLtp.ts
import { app } from "./tvWebhookTest";
import { dashboardHtml } from "./dashboardLayout";

app.get("/dashboard/ltp", (_req, res) => {
  res.send(dashboardHtml("ltp"));
});
