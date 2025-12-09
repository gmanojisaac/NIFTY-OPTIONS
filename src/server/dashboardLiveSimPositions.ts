// src/server/dashboardLiveSimPositions.ts
import { app } from "./tvWebhookTest";
import { dashboardHtml } from "./dashboardLayout";

app.get("/dashboard/livesim-positions", (_req, res) => {
  res.send(dashboardHtml("livesim-positions"));
});
