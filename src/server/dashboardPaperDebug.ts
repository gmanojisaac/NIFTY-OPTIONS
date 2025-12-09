// src/server/dashboardPaperDebug.ts
import { app } from "./tvWebhookTest";
import { dashboardHtml } from "./dashboardLayout";

app.get("/dashboard/paper-debug", (_req, res) => {
  console.log(dashboardHtml("paper-debug"))
  res.send(dashboardHtml("paper-debug"));
});
