// src/server/dashboardMain.ts
import { app } from "./tvWebhookTest";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { latestPrice } from "../core/priceStore";
import { getSessionPnL } from "../pnl/pnl-session";
import { getPaperPositions, getPaperTradeHistory } from "../strategy/strategy-papertrades-test";
import { liveSimPositions, liveSimHistory } from "../strategy/strategy-livesim";
import { getPaperDebugState } from "../strategy/paperIntegration";
import { getSignalHistory } from "../core/signalHistory";
import { dashboardHtml } from "./dashboardLayout";

// JSON state endpoint (shared by ALL dashboard pages)
app.get("/dashboard/state", (_req, res) => {
  const realized = getSessionPnL(); // { BUY, SELL }

  const pnl = {
    BUY: realized.BUY,
    SELL: realized.SELL,
  };

  const paperPositions = getPaperPositions();

  paperPositions.forEach((p) => {
    const ltp = latestPrice[p.symbol];
    if (!ltp) return;
    const mult = p.side === "BUY" ? 1 : -1;
    const mtm = (ltp - p.entry) * p.qty * mult;
    pnl[p.side] += mtm;
  });

  const ltps = INSTRUMENTS.map((i) => ({
    symbol: i.symbol,
    tradingsymbol: i.tradingsymbol,
    ltp: latestPrice[i.symbol] ?? null,
  }));

  const paperDebug = getPaperDebugState();
  const paperTrades = getPaperTradeHistory();
  const signals = getSignalHistory();

  res.json({
    pnl,
    pnlRealized: realized,
    ltps,
    paperPositions,
    livePositions: liveSimPositions,
    liveHistory: liveSimHistory,
    paperTrades,
    signals,
    paperDebug,
  });
});

// MAIN PAGE (default section = "main")
app.get("/dashboard", (_req, res) => {
  res.send(dashboardHtml("main"));
});
