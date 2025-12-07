import { Signal, Position } from "../core/types";
import { getPrice } from "../core/priceStore";
import { computeQty } from "./paper-utils";

export const liveSimPositions: Position[] = [];
export const liveSimHistory: {
  symbol: string;
  side: string;
  qty: number;
  entry: number;
  exit?: number;
}[] = [];

const DEBUG = false;

export function openLiveSim(s: Signal) {
  const price = getPrice(s.symbol);
  if (!price) {
    if (DEBUG) console.log("[LIVESIM][DEBUG] price undefined for", s.symbol);
    return;
  }

  // Use same qty as paper trade
  const { qty } = computeQty(s.symbol, price);

  if (DEBUG) {
    console.log("--------------------------------------------------");
    console.log("[LIVESIM][DEBUG] OPEN SIGNAL =", s);
    console.log("[LIVESIM][DEBUG] price =", price);
    console.log("[LIVESIM][DEBUG] qty =", qty);
    console.log("[LIVESIM][DEBUG] liveSimPositions BEFORE =", JSON.stringify(liveSimPositions));
  }

  // Add to active positions
  liveSimPositions.push({
    symbol: s.symbol,
    side: s.side,
    qty,
    entry: price
  });

  // Add to history
  liveSimHistory.push({
    symbol: s.symbol,
    side: s.side,
    qty,
    entry: price
  });

  console.log("[LIVESIM OPEN]", s.symbol, s.side, qty, "at", price);

  if (DEBUG) {
    console.log("[LIVESIM][DEBUG] liveSimPositions AFTER =", JSON.stringify(liveSimPositions));
    console.log("[LIVESIM][DEBUG] liveSimHistory =", JSON.stringify(liveSimHistory));
    console.log("--------------------------------------------------");
  }
}

export function closeLiveSim(symbol: string) {
  const idx = liveSimPositions.findIndex(p => p.symbol === symbol);

  if (DEBUG) {
    console.log("--------------------------------------------------");
    console.log("[LIVESIM][DEBUG] CLOSE SIGNAL for", symbol);
    console.log("[LIVESIM][DEBUG] liveSimPositions BEFORE =", JSON.stringify(liveSimPositions));
  }

  if (idx < 0) {
    if (DEBUG) console.log("[LIVESIM][DEBUG] No active livesim position to close for", symbol);
    return;
  }

  const pos = liveSimPositions[idx];
  const price = getPrice(symbol);

  if (!price) {
    if (DEBUG) console.log("[LIVESIM][DEBUG] price undefined for CLOSE", symbol);
    return;
  }

  // Remove from active positions
  liveSimPositions.splice(idx, 1);

  // Update history entry
  const h = liveSimHistory
    .slice()
    .reverse()
    .find(t => t.symbol === symbol && t.exit === undefined);

  if (h) h.exit = price;

  console.log("[LIVESIM CLOSE]", symbol, "qty", pos.qty, "at", price);

  if (DEBUG) {
    console.log("[LIVESIM][DEBUG] Updated exit for history =", h);
    console.log("[LIVESIM][DEBUG] liveSimPositions AFTER =", JSON.stringify(liveSimPositions));
    console.log("[LIVESIM][DEBUG] liveSimHistory =", JSON.stringify(liveSimHistory));
    console.log("--------------------------------------------------");
  }
}
