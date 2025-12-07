import { Signal, Position } from "../core/types";
import { getSessionPnL } from "../pnl/pnl-session";
import { sideCapital, CAPITAL_LIMIT, computeQty } from "./paper-utils";
import { PaperDecision } from "./paper-types";

const DEBUG = false;

export function handlePaperOpen(
  s: Signal,
  price: number,
  paperPos: Position[]
): PaperDecision {
  const { lots, qty, notional } = computeQty(s.symbol, price);

  if (DEBUG) {
    console.log("[DEBUG] Attempt OPEN");
    console.log("[DEBUG] lots =", lots, "qty =", qty, "notional =", notional);
    console.log("[DEBUG] sideCapital BEFORE =", sideCapital);
  }

  if (sideCapital[s.side] + notional > CAPITAL_LIMIT) {
    console.log(
      "CAPITAL LIMIT",
      s.side,
      "needed",
      notional,
      "current",
      sideCapital[s.side]
    );
    return {
      opened: false,
      closed: false,
      symbol: s.symbol,
      side: s.side,
      openLive: false,
      closeLive: false
    };
  }

  paperPos.push({ symbol: s.symbol, side: s.side, qty, entry: price });
  sideCapital[s.side] += notional;

  const pnlSide = getSessionPnL()[s.side];
  const openLive = pnlSide >= 0;

  console.log(
    "[PROMO] side =",
    s.side,
    "sessionPnL =",
    pnlSide,
    "openLive =",
    openLive
  );

  console.log(
    "PAPER OPEN",
    s.symbol,
    s.side,
    "price",
    price,
    "lots",
    lots,
    "qty",
    qty,
    "notional",
    notional,
    "capitalSide",
    sideCapital
  );

  if (DEBUG) {
    console.log("[DEBUG] paperPos =", JSON.stringify(paperPos));
    console.log("[DEBUG] sideCapital AFTER =", sideCapital);
  }

  return {
    opened: true,
    closed: false,
    symbol: s.symbol,
    side: s.side,
    openLive,
    closeLive: false
  };
}
