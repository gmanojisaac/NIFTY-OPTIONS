import express from "express";
import { Signal } from "../core/types";
import { handlePaperTestSignal } from "../strategy/strategy-papertrades-test";
import { openLiveSim, closeLiveSim } from "../strategy/strategy-livesim";
import { startManualPriceServer } from "./manualPrices";
import { parseTvAlert } from "../core/tvAlertParser";
import { startLiveTicker } from "../ticker/kiteTickerLive";

const app = express();

// Accept both JSON and plain text bodies
app.use(express.json());
app.use(express.text({ type: "*/*" }));

app.post("/tv", async (req, res) => {
  // Try to parse TradingView-style alert first
  let signal: Signal | null = parseTvAlert(req.body);

  // Fallback: old JSON format { symbol, action }
  if (!signal && typeof req.body === "object" && req.body !== null) {
    const { symbol, action } = req.body as { symbol?: string; action?: "BUY" | "SELL" };
    if (symbol && action) {
      signal = { symbol, side: action };
    }
  }

  if (!signal) {
    console.log("TV ALERT PARSE FAILED:", req.body);
    return res.status(400).json({ ok: false, error: "Could not parse alert" });
  }

  console.log("TV TEST ALERT", signal);

  const paper = handlePaperTestSignal(signal);

  if (paper.opened && paper.openLive) openLiveSim(signal);
  if (paper.closed && paper.closeLive) closeLiveSim(paper.symbol);

  res.json({ ok: true, paper });
});
startLiveTicker();
startManualPriceServer(4000);

app.listen(3000, () => console.log("TV TEST webhook on http://localhost:3000/tv"));
