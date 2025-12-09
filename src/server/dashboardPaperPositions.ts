// src/server/dashboardPaperPositions.ts
import { app } from "./tvWebhookTest";
import { dashboardHtml } from "./dashboardLayout";

app.get("/dashboard/paper-positions", (_req, res) => {
  res.send(dashboardHtml("paper-positions"));
});
