import { Signal, Position } from "../core/types";
import { getPrice } from "../core/priceStore";
import { INSTRUMENTS } from "../instruments/sixInstruments";

export const liveSimPositions: Position[] = [];
export const liveSimHistory: { symbol: string; side: string; qty: number; entry: number; exit?: number }[] = [];

function lot(symbol: string) {
  return INSTRUMENTS.find(i => i.symbol === symbol)?.lot ?? 1;
}

function opp(side: "BUY" | "SELL"): "BUY" | "SELL" {
  return side === "BUY" ? "SELL" : "BUY";
}

export function openLiveSim(s: Signal) {
  const price = getPrice(s.symbol);
  if (!price) return;
  const qty = lot(s.symbol);
  liveSimPositions.push({ symbol: s.symbol, side: s.side, qty, entry: price });
  liveSimHistory.push({ symbol: s.symbol, side: s.side, qty, entry: price });
  console.log("LIVESIM OPEN", s.symbol, s.side, qty, "at", price);
}

export function closeLiveSim(symbol: string) {
  const idx = liveSimPositions.findIndex(p => p.symbol === symbol);
  if (idx < 0) return;
  const pos = liveSimPositions[idx];
  const price = getPrice(symbol);
  liveSimPositions.splice(idx, 1);
  const h = [...liveSimHistory].reverse().find(t => t.symbol === symbol && !t.exit && t.side === pos.side);
  if (h && price) h.exit = price;
  console.log("LIVESIM CLOSE", symbol, opp(pos.side), "at", price);
}
