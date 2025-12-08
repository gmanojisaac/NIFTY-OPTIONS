// src/strategy/livesimEngine.ts

export interface LiveSimState {
  hasPosition: boolean;
}

export type LiveSimEvent =
  | { type: "PAPER_BUY_EXECUTED"; eligibleForLive: boolean }
  | { type: "PAPER_SELL_AUTO"; sessionPnl: number }
  | { type: "PAPER_SELL_EXPLICIT" };

export type LiveSimEffect =
  | { type: "NONE" }
  | { type: "OPEN_LIVE" }
  | { type: "CLOSE_LIVE" };

export const initialLiveSimState: LiveSimState = {
  hasPosition: false
};

export function stepLiveSim(
  state: LiveSimState,
  event: LiveSimEvent
): { state: LiveSimState; effect: LiveSimEffect } {
  const next: LiveSimState = { ...state };
  let effect: LiveSimEffect = { type: "NONE" };

  // Promotion: open livesim when paper BUY executes and conditions are met
  if (event.type === "PAPER_BUY_EXECUTED") {
    if (!state.hasPosition && event.eligibleForLive) {
      next.hasPosition = true;
      effect = { type: "OPEN_LIVE" };
    }
    return { state: next, effect };
  }

  // Explicit EXIT from TradingView: always close livesim if open
  if (event.type === "PAPER_SELL_EXPLICIT") {
    if (state.hasPosition) {
      next.hasPosition = false;
      effect = { type: "CLOSE_LIVE" };
    }
    return { state: next, effect };
  }

  // Auto-close (threshold B): close livesim only when cumulative PnL < 0
  if (event.type === "PAPER_SELL_AUTO") {
    if (state.hasPosition && event.sessionPnl < 0) {
      next.hasPosition = false;
      effect = { type: "CLOSE_LIVE" };
    }
    return { state: next, effect };
  }

  return { state: next, effect };
}
