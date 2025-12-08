// src/strategy/paperEngine.ts
import {
  PaperState,
  Event,
  Effect,
  initialPaperState,
  minuteKey,
  isSpecialCondition,
} from "./paperTypes";

export function stepPaper(
  state: PaperState,
  event: Event
): { state: PaperState; effect: Effect } {
  const next: PaperState = { ...state };
  let effect: Effect = { type: "NONE" };
  const key = minuteKey(event.time);

  // ───────────── BUY_SIGNAL column ─────────────
  if (event.type === "BUY_SIGNAL") {
    if (state.pos === "NO_POSITION") {
      // BUY side (flat → long) setup
      next.buyThreshold = event.stopPx;
      next.lastBuyThreshold = event.stopPx;
      next.checkThreshold = event.stopPx; // entry threshold
      next.sellCountAfterLastBuy = 0;
      // pos stays NO_POSITION, effect stays NONE
    }
    // If already LONG, ignore or extend if you like
    return { state: next, effect };
  }

  // ───────────── SELL_SIGNAL column ─────────────
  if (event.type === "SELL_SIGNAL") {
    const stopPx = event.stopPx;

    // Always remember SELL stop for debug / logic
    next.sellThreshold = stopPx;
    next.checkThreshold = stopPx; // IMPORTANT: reset to SELL stopPx (do not clear)

    // Count SELL only if we've had a BUY before
    if (state.lastBuyThreshold !== undefined) {
      next.sellCountAfterLastBuy = state.sellCountAfterLastBuy + 1;
    }

    // If currently LONG → exit immediately
    if (state.pos === "LONG") {
      next.pos = "NO_POSITION";
      next.blockedMinute = key;

      const priceForExit = stopPx; // or use event.ltp if you prefer
      effect = { type: "EXECUTE_SELL_TRADE", price: priceForExit };

      return { state: next, effect };
    }

    // If flat, just store thresholds / counts
    return { state: next, effect };
  }

  // ───────────── CONDN_CHECK column ─────────────
  if (state.blockedMinute && state.blockedMinute === key) {
    // idle in same minute (A/B behaviour)
    return { state: next, effect };
  }

  const ltp = event.ltp ?? 0; // ltp should be set for CONDN_CHECK

  // ----- NO POSITION row -----
  if (state.pos === "NO_POSITION") {
    // TRUE column: special condition (if you use it)
    if (isSpecialCondition(state, ltp)) {
      if (state.lastBuyThreshold !== undefined) {
        next.checkThreshold = state.lastBuyThreshold; // e.g., "checkThreshold = BUY_Threshold"
      }
      return { state: next, effect }; // remain NO_POSITION, first tick after special condition
    }

    // Normal entry logic
    if (state.checkThreshold === undefined) {
      // No buy level armed → nothing to do
      return { state: next, effect };
    }

    // BUY side (A): entry condition
    if (ltp >= state.checkThreshold) {
      // Execute BUY trade, move to LONG
      next.pos = "LONG";
      effect = { type: "EXECUTE_BUY_TRADE", price: ltp };
      // NOTE: do NOT set blockedMinute here, since pos is no longer NO_POSITION
      return { state: next, effect };
    }

    // ltp < checkThreshold → remain flat, block this minute
    next.blockedMinute = key;
    return { state: next, effect };
  }

  // ----- POSITION row (LONG) -----
  if (state.pos === "LONG") {
    if (state.checkThreshold === undefined) {
      // No exit level defined -> just hold
      return { state: next, effect };
    }

    // HOLD side: every tick check ltp < threshold
    if (ltp < state.checkThreshold) {
      // Exit condition: price fell below exit threshold
      next.pos = "NO_POSITION";
      next.blockedMinute = key;
      effect = { type: "EXECUTE_SELL_TRADE", price: ltp };
      // Here you should also accumulate realized PnL outside, using this effect
      return { state: next, effect };
    }

    // ltp >= checkThreshold → hold position
    return { state: next, effect };
  }

  // In case more pos states are added in future
  return { state: next, effect };
}

// Optionally re-export initial state for convenience
export { initialPaperState };
