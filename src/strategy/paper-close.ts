import { Position } from "../core/types";
import { recordPnL } from "../pnl/pnl-session";
import { sideCapital } from "./paper-utils";
import { PaperDecision } from "./paper-types";

const DEBUG = false;

export function handlePaperClose(
  pos: Position,
  price: number,
  paperPos: Position[]
): PaperDecision {
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

  console.log(
    "PAPER CLOSE",
    pos.symbol,
    pos.side,
    "pnl",
    pnl,
    "exitPrice",
    price,
    "qty",
    pos.qty,
    "capitalSide",
    sideCapital
  );
  console.log(
    "[PROMO CLOSE] side =",
    pos.side,
    "pnlThisTrade =",
    pnl
  );

  if (DEBUG) {
    console.log("[DEBUG] paperPos AFTER =", JSON.stringify(paperPos));
    console.log("[DEBUG] sideCapital AFTER =", sideCapital);
  }

  return {
    opened: false,
    closed: true,
    symbol: pos.symbol,
    side: pos.side,
    openLive: false,
    // always try to close livesim/live; close fn will no-op if none exists
    closeLive: true
  };
}
