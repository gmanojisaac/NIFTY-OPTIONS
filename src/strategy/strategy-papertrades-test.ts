import { Signal, Position, Side } from "../core/types";
import { getPrice } from "../core/priceStore";
import { recordPnL, isLiveEnabled } from "../pnl/pnl-session";
import { sideCapital, CAPITAL_LIMIT, computeQty } from "./paper-utils";

const DEBUG = true; // Toggle debug logs ON/OFF

const paperPos: Position[] = [];

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
    opened: false,
    closed: false,
    symbol: s.symbol,
    side: s.side,
    openLive: false,
    closeLive: false
  };

  if (DEBUG) console.log("[DEBUG] price =", price);

  if (!price) return res;

  const pos = paperPos.find(p => p.symbol === s.symbol);

  if (!pos) {
    const { lots, qty, notional } = computeQty(s.symbol, price);

    if (DEBUG) {
      console.log("[DEBUG] Attempt OPEN");
      console.log("[DEBUG] lots =", lots, "qty =", qty, "notional =", notional);
      console.log("[DEBUG] sideCapital BEFORE =", sideCapital);
    }

    if (sideCapital[s.side] + notional > CAPITAL_LIMIT) {
      console.log("CAPITAL LIMIT", s.side, "needed", notional, "current", sideCapital[s.side]);
      return res;
    }

    paperPos.push({ symbol: s.symbol, side: s.side, qty, entry: price });
    sideCapital[s.side] += notional;

    res.opened = true;
    res.openLive = isLiveEnabled(s.side);

    console.log(
      "PAPER OPEN",
      s.symbol,
      s.side,
      "price", price,
      "lots", lots,
      "qty", qty,
      "notional", notional,
      "capitalSide", sideCapital
    );

    if (DEBUG) {
      console.log("[DEBUG] paperPos =", JSON.stringify(paperPos));
      console.log("[DEBUG] sideCapital AFTER =", sideCapital);
      console.log("[DEBUG] res =", res);
    }

    return res;
  }

  // --- CLOSE LOGIC ---
  const mult = pos.side === "BUY" ? 1 : -1;
  const pnl = (price - pos.entry) * pos.qty * mult;

  if (DEBUG) {
    console.log("[DEBUG] Attempt CLOSE");
    console.log("[DEBUG] pos =", pos);
    console.log("[DEBUG] price =", price);
    console.log("[DEBUG] mult =", mult);
    console.log("[DEBUG] pnl =", pnl);
    console.log("[DEBUG] sideCapital BEFORE =", sideCapital);
  }

  recordPnL(pos.side, pnl);
  sideCapital[pos.side] -= pos.entry * pos.qty;

  paperPos.splice(paperPos.indexOf(pos), 1);

  res.closed = true;
  res.side = pos.side;
  res.closeLive = isLiveEnabled(pos.side);

  console.log(
    "PAPER CLOSE",
    pos.symbol,
    pos.side,
    "pnl", pnl,
    "exitPrice", price,
    "qty", pos.qty,
    "capitalSide", sideCapital
  );

  if (DEBUG) {
    console.log("[DEBUG] paperPos AFTER =", JSON.stringify(paperPos));
    console.log("[DEBUG] sideCapital AFTER =", sideCapital);
    console.log("[DEBUG] res =", res);
  }

  return res;
}
