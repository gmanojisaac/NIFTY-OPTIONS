// src/server/tvWebhookTest.ts
import express from "express";
import { parseTvAlert } from "../core/tvAlertParser";
import { handlePaperSignal } from "../strategy/paperIntegration";
import { openLiveSim, closeLiveSim } from "../strategy/strategy-livesim";
import { getSessionPnL } from "../pnl/pnl-session";

export const app = express(); // 👈 IMPORTANT
app.use(express.json());
app.use(express.text({ type: "*/*" }));

app.post("/tv", (req, res) => {
  const signal = parseTvAlert(req.body);

  if (!signal) {
    return res.status(400).json({ error: "bad alert" });
  }

  console.log("TV TEST ALERT", signal);

  const { effect } = handlePaperSignal(signal);

  if (effect.type === "EXECUTE_BUY_TRADE") {
    const pnl = getSessionPnL();
    const pnlBuy = pnl.BUY ?? 0;
    if (pnlBuy >= 0) {
      //openLiveSim({ symbol: signal.symbol, side: signal.side });
    }
  }

  if (effect.type === "EXECUTE_SELL_TRADE") {
    closeLiveSim(signal.symbol);
  }

  res.json({ ok: true, effect });
});

app.listen(3000, () => {
  console.log("TV TEST webhook on http://localhost:3000/tv");
});
