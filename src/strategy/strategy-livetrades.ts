import { Signal, Position } from "../core/types";
import { latestPrice } from "../ticker/sixTicker";
import { lot, placeLimit, reverse } from "../orders/order-manager";

const livePos: Position[] = [];

export async function openLiveTrade(s: Signal) {
  const price = latestPrice[s.symbol];
  if (!price) return;
  await placeLimit(s.symbol, s.side, price);
  livePos.push({ symbol: s.symbol, side: s.side, qty: lot(s.symbol), entry: price });
}

export async function closeLiveTrade(symbol: string) {
  const idx = livePos.findIndex(p => p.symbol === symbol);
  if (idx < 0) return;
  const pos = livePos[idx];
  const price = latestPrice[symbol];
  if (!price) return;
  await placeLimit(symbol, reverse(pos.side), price);
  livePos.splice(idx, 1);
}
