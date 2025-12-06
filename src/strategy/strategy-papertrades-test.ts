import { Signal, Position, Side } from "../core/types";
import { getPrice } from "../core/priceStore";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { recordPnL, isLiveEnabled } from "../pnl/pnl-session";

const paperPos: Position[] = [];
const sideCapital: Record<Side, number> = { BUY: 0, SELL: 0 };
const CAPITAL_LIMIT = 100000;

function lot(symbol: string) {
  return INSTRUMENTS.find(i => i.symbol === symbol)?.lot ?? 1;
}

export type PaperDecision = {
  opened: boolean;
  closed: boolean;
  symbol: string;
  side: Side;
  openLive: boolean;
  closeLive: boolean;
};

export function handlePaperTestSignal(s: Signal): PaperDecision {
  const price = getPrice(s.symbol);
  const res: PaperDecision = {
    opened: false, closed: false, symbol: s.symbol,
    side: s.side, openLive: false, closeLive: false
  };
  if (!price) return res;

  const pos = paperPos.find(p => p.symbol === s.symbol);
  if (!pos) {
    const notional = price * lot(s.symbol);
    if (sideCapital[s.side] + notional > CAPITAL_LIMIT) {
      console.log("CAPITAL LIMIT REACHED FOR", s.side);
      return res;
    }
    paperPos.push({ symbol: s.symbol, side: s.side, qty: lot(s.symbol), entry: price });
    sideCapital[s.side] += notional;
    res.opened = true;
    res.openLive = isLiveEnabled(s.side);
    console.log("PAPER OPEN", s.symbol, s.side, "at", price, "capitalSide", sideCapital);
    return res;
  }

  const mult = pos.side === "BUY" ? 1 : -1;
  const pnl = (price - pos.entry) * pos.qty * mult;
  recordPnL(pos.side, pnl);
  sideCapital[pos.side] -= pos.entry * pos.qty;
  paperPos.splice(paperPos.indexOf(pos), 1);
  res.closed = true;
  res.side = pos.side;
  res.closeLive = isLiveEnabled(pos.side);
  console.log("PAPER CLOSE", pos.symbol, pos.side, "pnl", pnl, "capitalSide", sideCapital);
  return res;
}
