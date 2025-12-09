// src/server/dashboardAfterMarket.ts
import { app } from "./tvWebhookTest";
import { dashboardHtml } from "./dashboardLayout";

app.get("/dashboard/after-market", (_req, res) => {
  res.send(dashboardHtml("after-market"));
});
