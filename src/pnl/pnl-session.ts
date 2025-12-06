import "dotenv/config";
import { Side } from "../core/types";

const sessionPnL: Record<Side, number> = { BUY: 0, SELL: 0 };
const baseline: Record<Side, number> = {
  BUY: Number(process.env.BASELINE_BUY || 0),
  SELL: Number(process.env.BASELINE_SELL || 0)
};
const liveEnabled: Record<Side, boolean> = { BUY: false, SELL: false };

export function recordPnL(side: Side, pnl: number) {
  sessionPnL[side] += pnl;
  if (!liveEnabled[side] && sessionPnL[side] > baseline[side]) liveEnabled[side] = true;
  return liveEnabled[side];
}

export function isLiveEnabled(side: Side) {
  return liveEnabled[side];
}

export function getSessionPnL() {
  return { ...sessionPnL };
}

export function resetSession() {
  sessionPnL.BUY = sessionPnL.SELL = 0;
  liveEnabled.BUY = liveEnabled.SELL = false;
}
