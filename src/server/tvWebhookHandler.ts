// src/server/tvWebhookHandler.ts
import { Request, Response } from "express";
import { parseTvAlert } from "../core/tvAlertParser";
import { handlePaperSignal } from "../strategy/paperIntegration";
import { openLiveSim, closeLiveSim } from "../strategy/strategy-livesim";
import { getSessionPnL } from "../pnl/pnl-session";
import { recordSignal } from "../core/signalHistory";

export const TV_WEBHOOK_PATH = "/tv";

// ===== Per-file debug flag & helpers =====
const DEBUG = true; // set to false to disable all debug logs in this file

const PREFIX = "[tvWebhookHandler]";

function debugLog(...args: any[]) {
  if (DEBUG) console.log(PREFIX, ...args);
}

function debugWarn(...args: any[]) {
  if (DEBUG) console.warn(PREFIX, ...args);
}

function debugError(...args: any[]) {
  if (DEBUG) console.error(PREFIX, ...args);
}
// =========================================

export async function tvWebhookHandler(req: Request, res: Response) {
  debugLog("==== [/tv] Incoming Webhook ====");
  debugLog("Timestamp:", new Date().toISOString());
  debugLog("Headers:", JSON.stringify(req.headers, null, 2));
  debugLog("Raw Body:", req.body);

  let signal;
  try {
    signal = parseTvAlert(req.body);
    debugLog("Parsed Signal:", signal);
  } catch (err) {
    debugError("❌ Error while parsing TradingView alert:", err);
    return res.status(400).json({ error: "bad alert parse" });
  }

  if (!signal) {
    debugWarn("⚠️ No signal produced from alert (parseTvAlert returned null/undefined)");
    return res.status(400).json({ error: "bad alert" });
  }

  recordSignal(signal, "TV_WEBHOOK");

  debugLog("✅ Valid signal received:", {
    symbol: signal.symbol,
    side: signal.side,
    raw: signal,
  });

  let effect;
  try {
    debugLog("➡️ Calling handlePaperSignal with signal");
    effect = await handlePaperSignal(signal as any);
    debugLog("⬅️ Effect returned from handlePaperSignal:", effect);
  } catch (err) {
    debugError("❌ Error in handlePaperSignal:", err);
    return res
      .status(500)
      .json({ error: "internal error: handlePaperSignal failed" });
  }

  if (!effect) {
    debugWarn("⚠️ handlePaperSignal returned no effect");
  }

  // LiveSim actions with logs
  try {
    if ((effect as any)?.type === "EXECUTE_BUY_TRADE") {
      debugLog("📈 EXECUTE_BUY_TRADE effect detected -> opening LiveSim", {
        symbol: signal.symbol,
        side: signal.side,
      });
      // Uncomment if you actually want to open LiveSim
      // await openLiveSim({ symbol: signal.symbol, side: signal.side });
    }

    if ((effect as any)?.type === "EXECUTE_SELL_TRADE") {
      debugLog("📉 EXECUTE_SELL_TRADE effect detected -> closing LiveSim", {
        symbol: signal.symbol,
      });
      closeLiveSim(signal.symbol);
    }
  } catch (err) {
    debugError("❌ Error while handling LiveSim actions:", err);
  }

  // Optional: log current session PnL
  try {
    const pnl = getSessionPnL();
    debugLog("💰 Current session PnL:", {
      symbol: signal.symbol,
      pnl,
    });
  } catch (err) {
    debugError("❌ Error while fetching session PnL:", err);
  }

  debugLog("✅ Webhook processing complete. Sending response.");
  res.json({ ok: true, effect });
}
