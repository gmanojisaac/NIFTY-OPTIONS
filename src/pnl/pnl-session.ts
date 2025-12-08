// src/pnl-session.ts

// ----------------------------
// LOCAL DEBUG FLAG ONLY HERE
// ----------------------------
const DEBUG = false;
const dlog = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};

interface SessionPnl {
  BUY: number;
  SELL: number;
}

let session: SessionPnl = { BUY: 0, SELL: 0 };

export function recordPnL(side: "BUY" | "SELL", pnl: number) {
  dlog("[PNL] recordPnL side =", side, "pnl =", pnl);
  session[side] += pnl;
  dlog("[PNL] updated session =", session);
}

export function getSessionPnL() {
  dlog("[PNL] getSessionPnL =", session);
  return session;
}

export function resetSessionPnL() {
  dlog("[PNL] resetSessionPnL");
  session = { BUY: 0, SELL: 0 };
}
