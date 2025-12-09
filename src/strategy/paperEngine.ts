// src/strategy/paperEngine.ts
import {
  PaperState,
  Event,
  Effect,
  initialPaperState,
  minuteKey,
  isSpecialCondition,
} from "./paperTypes";

// ---- Debug flag & helper ----
const DEBUG = false; // ← switch true/false as needed

function dbg(...args: any[]) {
  if (DEBUG) console.log("[paperEngine]", ...args);
}

export function stepPaper(
  state: PaperState,
  event: Event
): { state: PaperState; effect: Effect } {
  dbg("EVENT RECEIVED:", event);
  dbg("STATE BEFORE:", state);

  const next: PaperState = { ...state };
  let effect: Effect = { type: "NONE" };
  const key = minuteKey(event.time);

  // ───────────── BUY_SIGNAL ─────────────
  if (event.type === "BUY_SIGNAL") {
    dbg("Handling BUY_SIGNAL");

    if (state.pos === "NO_POSITION") {
      dbg("Arming BUY threshold at", event.stopPx);

      next.buyThreshold = event.stopPx;
      next.lastBuyThreshold = event.stopPx;
      next.checkThreshold = event.stopPx;
      next.sellCountAfterLastBuy = 0;

      dbg("Updated state after BUY_SIGNAL:", next);
    } else {
      dbg("Ignoring BUY_SIGNAL because pos =", state.pos);
    }

    return { state: next, effect };
  }

  // ───────────── SELL_SIGNAL ─────────────
  if (event.type === "SELL_SIGNAL") {
    dbg("Handling SELL_SIGNAL");

    const stopPx = event.stopPx;
    next.sellThreshold = stopPx;
    next.checkThreshold = stopPx;

    dbg("Updated SELL threshold:", stopPx);

    if (state.lastBuyThreshold !== undefined) {
      next.sellCountAfterLastBuy = state.sellCountAfterLastBuy + 1;
      dbg("Increment sellCountAfterLastBuy →", next.sellCountAfterLastBuy);
    }

    if (state.pos === "LONG") {
      dbg("EXIT triggered from LONG @ stopPx", stopPx);

      next.pos = "NO_POSITION";
      next.blockedMinute = key;

      effect = { type: "EXECUTE_SELL_TRADE", price: stopPx };

      dbg("EXIT effect:", effect);
      dbg("STATE AFTER EXIT:", next);

      return { state: next, effect };
    }

    dbg("SELL_SIGNAL received while flat. Thresholds updated only.");
    return { state: next, effect };
  }

  // ───────────── CONDN_CHECK ─────────────
  dbg("Handling CONDN_CHECK");

  if (state.blockedMinute && state.blockedMinute === key) {
    dbg("Minute is blocked:", key, "→ no action this tick");
    return { state: next, effect };
  }

  const ltp = event.ltp ?? 0;
  dbg("LTP:", ltp);

  // ───────────── NO_POSITION logic ─────────────
  if (state.pos === "NO_POSITION") {
    dbg("Position: NO_POSITION");

    if (isSpecialCondition(state, ltp)) {
      dbg("Special condition TRUE");

      if (state.lastBuyThreshold !== undefined) {
        next.checkThreshold = state.lastBuyThreshold;
        dbg("Reset checkThreshold →", next.checkThreshold);
      }

      return { state: next, effect };
    }

    if (state.checkThreshold === undefined) {
      dbg("No active BUY threshold. Staying flat.");
      return { state: next, effect };
    }

    dbg("Check BUY entry: LTP", ltp, ">= threshold", state.checkThreshold);

    if (ltp >= state.checkThreshold) {
      dbg("BUY condition met → entering LONG");

      next.pos = "LONG";
      effect = { type: "EXECUTE_BUY_TRADE", price: ltp };

      dbg("BUY effect:", effect);
      dbg("STATE AFTER BUY:", next);

      return { state: next, effect };
    }

    dbg("LTP < threshold → blocking minute:", key);
    next.blockedMinute = key;

    return { state: next, effect };
  }

  // ───────────── LONG logic ─────────────
  if (state.pos === "LONG") {
    dbg("Position: LONG. Exit threshold =", state.checkThreshold);

    if (state.checkThreshold === undefined) {
      dbg("NO exit threshold → holding.");
      return { state: next, effect };
    }

    dbg("Check EXIT: LTP", ltp, "< threshold", state.checkThreshold);

    if (ltp < state.checkThreshold) {
      dbg("EXIT triggered @", ltp);

      next.pos = "NO_POSITION";
      next.blockedMinute = key;

      effect = { type: "EXECUTE_SELL_TRADE", price: ltp };

      dbg("SELL effect:", effect);
      dbg("STATE AFTER EXIT:", next);

      return { state: next, effect };
    }

    dbg("LTP above threshold → holding LONG");
    return { state: next, effect };
  }

  dbg("Unknown position state. Returning state unchanged.");
  return { state: next, effect };
}

export { initialPaperState };
