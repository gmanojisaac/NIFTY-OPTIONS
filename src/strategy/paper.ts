import "dotenv/config";
import { Signal, Side, Position } from "../core/types";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { latestPrice } from "../ticker/sixTicker";

const positions: Position[] = [];
const sessionPnL: Record<Side, number> = { BUY: 0, SELL: 0 };
const baselinePnL: Record<Side, number> = {
  BUY: Number(process.env.BASELINE_BUY || 0),
  SELL: Number(process.env.BASELINE_SELL || 0)
};
const liveEnabled: Record<Side, boolean> = { BUY: false, SELL: false };

function lot(symbol: string) {
  return INSTRUMENTS.find(i => i.symbol === symbol)?.lot ?? 1;
}

export type PaperResult = {
  opened: boolean;
  closed: boolean;
  side: Side;
  liveEnabled: Record<Side, boolean>;
};

export function onPaperSignal(s: Signal): PaperResult {
  const price = latestPrice[s.symbol];
  if (!price) return { opened: false, closed: false, side: s.side, liveEnabled };
  const pos = positions.find(p => p.symbol === s.symbol);
  if (!pos) {
    positions.push({ symbol: s.symbol, side: s.side, qty: lot(s.symbol), entry: price });
    return { opened: true, closed: false, side: s.side, liveEnabled };
  }
  const mult = pos.side === "BUY" ? 1 : -1;
  const pnl = (price - pos.entry) * pos.qty * mult;
  sessionPnL[pos.side] += pnl;
  positions.splice(positions.indexOf(pos), 1);
  if (sessionPnL[pos.side] > baselinePnL[pos.side]) liveEnabled[pos.side] = true;
  console.log("Paper PnL", sessionPnL, "LiveEnabled", liveEnabled);
  return { opened: false, closed: true, side: pos.side, liveEnabled };
}
