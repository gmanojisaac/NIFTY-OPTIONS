import "dotenv/config";
import { Side } from "../core/types";
import { INSTRUMENTS } from "../instruments/sixInstruments";

export const sideCapital: Record<Side, number> = { BUY: 0, SELL: 0 };

export const CAPITAL_LIMIT =
  Number(process.env.CAPITAL_LIMIT || process.env.TRADE_CAPITAL || 100000);

export const TRADE_CAPITAL =
  Number(process.env.TRADE_CAPITAL || CAPITAL_LIMIT);

export function lot(symbol: string) {
  return INSTRUMENTS.find(i => i.symbol === symbol)?.lot ?? 1;
}

// Calculate lots, quantity and notional for this trade
export function computeQty(symbol: string, price: number) {
  const lotSize = lot(symbol);
  const rawLots = TRADE_CAPITAL / (price * lotSize);
  const lots = Math.max(1, Math.floor(rawLots));   // at least 1 lot
  const qty = lots * lotSize;
  const notional = qty * price;
  return { lots, qty, notional };
}
