// src/server/dashboardLiveSimDebug.ts
import { app } from "./tvWebhookTest";
import { dashboardHtml } from "./dashboardLayout";

app.get("/dashboard/livesim-debug", (_req, res) => {
  res.send(dashboardHtml("livesim-debug"));
});
