// src/server/dashboardMain.ts
import { app } from "./tvWebhookTest";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { latestPrice } from "../core/priceStore";
import { getSessionPnL } from "../pnl/pnl-session";
import {
  getPaperPositions,
  getPaperTradeHistory,
} from "../strategy/strategy-papertrades-test";
import { liveSimPositions, liveSimHistory } from "../strategy/strategy-livesim";
import { getPaperDebugState } from "../strategy/paperIntegration";
import { getSignalHistory } from "../core/signalHistory";
import { dashboardHtml } from "./dashboardLayout";

const DEBUG_DASHBOARD = true;
const dlog = (...args: any[]) => {
  if (!DEBUG_DASHBOARD) return;
  const ts = new Date().toISOString();
  console.log(ts, "[DASHBOARD_STATE]", ...args);

  // JSON state endpoint (shared by ALL dashboard pages)
  app.get("/dashboard/state", (_req, res) => {
    dlog("GET /dashboard/state called");

    const realized = getSessionPnL(); // { BUY, SELL }
    dlog("Realized PnL:", realized);

    const pnl = {
      BUY: realized.BUY,
      SELL: realized.SELL,
    };

    const paperPositions = getPaperPositions();
    dlog("Paper positions count:", paperPositions.length);

    paperPositions.forEach((p) => {
      const ltp = latestPrice[p.symbol];
      if (!ltp) {
        dlog("No LTP for paper position symbol:", p.symbol);
        return;
      }
      const mult = p.side === "BUY" ? 1 : -1;
      const mtm = (ltp - p.entry) * p.qty * mult;
      pnl[p.side] += mtm;
    });

    const ltps = INSTRUMENTS.map((i) => ({
      symbol: i.symbol,
      tradingsymbol: i.tradingsymbol,
      ltp: latestPrice[i.symbol] ?? null,
    }));
    dlog(
      "LTP snapshot:",
      ltps.map((x) => ({
        symbol: x.symbol,
        ltp: x.ltp,
      }))
    );

    const paperDebug = getPaperDebugState();
    const paperTrades = getPaperTradeHistory();
    const signals = getSignalHistory();

    // Log SHAPE, not the whole thing
    dlog(
      "paperDebug type:",
      Array.isArray(paperDebug) ? "array" : typeof paperDebug
    );
    if (Array.isArray(paperDebug)) {
      dlog("paperDebug length:", paperDebug.length);
      if (paperDebug.length > 0) {
        dlog("paperDebug[0] sample:", paperDebug[0]);
      }
    } else if (paperDebug) {
      const keys = Object.keys(paperDebug);
      dlog("paperDebug keys:", keys);
      if (keys.length > 0) {
        dlog("paperDebug first key sample:", keys[0], paperDebug[keys[0]]);
      }
    }

    dlog(
      "paperTrades count:",
      paperTrades.length,
      "liveSimPositions:",
      liveSimPositions.length,
      "liveSimHistory:",
      liveSimHistory.length,
      "signals count:",
      signals.length
    );

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
};
// MAIN PAGE (default section = "main")
app.get("/dashboard", (_req, res) => {
  res.send(dashboardHtml("main"));
});
