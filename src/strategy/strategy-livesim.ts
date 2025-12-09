// src/strategy/strategy-livesim.ts
import { Signal, Position } from "../core/types";
import { getPrice } from "../core/priceStore";
// ❌ we won't use computeQty here anymore
// import { computeQty } from "./paper-utils";
import { getPaperPosition } from "./strategy-papertrades-test";

export const liveSimPositions: Position[] = [];
export const liveSimHistory: {
  symbol: string;
  side: string;
  qty: number;
  entry: number;
  exit?: number;
}[] = [];

const DEBUG = false;

// KEEP the same signature
export function openLiveSim(s: Signal) {
  // Look up the paper position that was just opened
  const paperPos = getPaperPosition(s.symbol);

  if (!paperPos || paperPos.qty <= 0) {
    if (DEBUG) {
      console.log(
        "[LIVESIM][DEBUG] openLiveSim: no paper position found for",
        s.symbol,
        "→ skipping livesim open"
      );
    }
    return;
  }

  const qty = paperPos.qty;
  const entryPrice = paperPos.entry; // keep entry aligned with paper

  if (DEBUG) {
    console.log("--------------------------------------------------");
    console.log("[LIVESIM][DEBUG] OPEN SIGNAL =", s);
    console.log("[LIVESIM][DEBUG] using paperPos =", paperPos);
    console.log(
      "[LIVESIM][DEBUG] liveSimPositions BEFORE =",
      JSON.stringify(liveSimPositions)
    );
  }

  // Add to active positions
  liveSimPositions.push({
    symbol: s.symbol,
    side: s.side,
    qty,
    entry: entryPrice,
  });

  // Add to history
  liveSimHistory.push({
    symbol: s.symbol,
    side: s.side,
    qty,
    entry: entryPrice,
  });

  console.log("[LIVESIM OPEN]", s.symbol, s.side, qty, "at", entryPrice);

  if (DEBUG) {
    console.log(
      "[LIVESIM][DEBUG] liveSimPositions AFTER =",
      JSON.stringify(liveSimPositions)
    );
    console.log(
      "[LIVESIM][DEBUG] liveSimHistory =",
      JSON.stringify(liveSimHistory)
    );
    console.log("--------------------------------------------------");
  }
}

export function closeLiveSim(symbol: string) {
  const idx = liveSimPositions.findIndex((p) => p.symbol === symbol);

  if (DEBUG) {
    console.log("--------------------------------------------------");
    console.log("[LIVESIM][DEBUG] CLOSE SIGNAL for", symbol);
    console.log(
      "[LIVESIM][DEBUG] liveSimPositions BEFORE =",
      JSON.stringify(liveSimPositions)
    );
  }

  if (idx < 0) {
    if (DEBUG)
      console.log(
        "[LIVESIM][DEBUG] No active livesim position to close for",
        symbol
      );
    return;
  }

  const pos = liveSimPositions[idx];
  const price = getPrice(symbol);

  if (!price) {
    if (DEBUG)
      console.log("[LIVESIM][DEBUG] price undefined for CLOSE", symbol);
    return;
  }

  // Remove from active positions
  liveSimPositions.splice(idx, 1);

  // Update history entry
  const h = liveSimHistory
    .slice()
    .reverse()
    .find((t) => t.symbol === symbol && t.exit === undefined);

  if (h) h.exit = price;

  console.log("[LIVESIM CLOSE]", symbol, "qty", pos.qty, "at", price);

  if (DEBUG) {
    console.log("[LIVESIM][DEBUG] Updated exit for history =", h);
    console.log(
      "[LIVESIM][DEBUG] liveSimPositions AFTER =",
      JSON.stringify(liveSimPositions)
    );
    console.log(
      "[LIVESIM][DEBUG] liveSimHistory =",
      JSON.stringify(liveSimHistory)
    );
    console.log("--------------------------------------------------");
  }
}
