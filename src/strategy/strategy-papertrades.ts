import { Signal, Position, Side } from "../core/types";
import { latestPrice } from "../ticker/sixTicker";
import { lot } from "../orders/order-manager";
import { recordPnL, isLiveEnabled } from "../pnl/pnl-session";

const paperPos: Position[] = [];

export type PaperDecision = {
  opened: boolean;
  closed: boolean;
  symbol: string;
  side: Side;
  openLive: boolean;
  closeLive: boolean;
};

export function handlePaperSignal(s: Signal): PaperDecision {
  const price = latestPrice[s.symbol];
  const res: PaperDecision = {
    opened: false, closed: false, symbol: s.symbol,
    side: s.side, openLive: false, closeLive: false
  };
  if (!price) return res;

  const pos = paperPos.find(p => p.symbol === s.symbol);
  if (!pos) {
    paperPos.push({ symbol: s.symbol, side: s.side, qty: lot(s.symbol), entry: price });
    res.opened = true;
    res.openLive = isLiveEnabled(s.side);
    return res;
  }

  const mult = pos.side === "BUY" ? 1 : -1;
  const pnl = (price - pos.entry) * pos.qty * mult;
  const enabled = recordPnL(pos.side, pnl);
  paperPos.splice(paperPos.indexOf(pos), 1);
  res.closed = true;
  res.side = pos.side;
  res.closeLive = enabled;
  return res;
}
