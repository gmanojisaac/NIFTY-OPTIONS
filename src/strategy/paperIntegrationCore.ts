// src/strategy/paperIntegrationCore.ts
import { stepPaper } from "./paperEngine";
import { PaperState, Event, Effect } from "./paperTypes";
import { getPaperState, setPaperState } from "./paperStateStore";
import { executePaperEffect } from "./paperEffectExecutor";
import { getPrice } from "../core/priceStore";

const DEBUG_PAPER_INTEGRATION = true;
const dlog = (...args: any[]) => {
  if (DEBUG_PAPER_INTEGRATION) console.log("[paperIntegration]", ...args);
};

// Public signal shape from TV / webhook
export type Intent = "ENTRY" | "EXIT";

export interface TvSignal {
  symbol: string;
  side: "BUY" | "SELL";   // currently using BUY side mainly
  intent: Intent;         // ENTRY or EXIT
  stopPx?: number;        // from stopPx= in alert
}

export interface PaperHandleResult {
  effect: Effect;
  state: PaperState;
}

/**
 * Main entry point: called when a TradingView / webhook signal arrives.
 * - applies BUY_SIGNAL / SELL_SIGNAL first
 * - then runs one CONDN_CHECK with current LTP
 * - persists new state
 * - executes side-effects (paper trades + livesim)
 */
export function handlePaperSignal(
  signal: TvSignal,
  now: Date = new Date()
): PaperHandleResult {
  dlog("handlePaperSignal input:", signal, "at", now);

  const symbol = signal.symbol;
  let state: PaperState = getPaperState(symbol);
  let effect: Effect = { type: "NONE" };


// 1) Map ENTRY/EXIT into BUY_SIGNAL / SELL_SIGNAL in engine
if (signal.stopPx !== undefined) {
  if (signal.intent === "ENTRY" && signal.side === "BUY") {
    // Long entry → BUY_SIGNAL
    const ev: Event = {
      type: "BUY_SIGNAL",
      stopPx: signal.stopPx,
      time: now,
    };
    ({ state } = stepPaper(state, ev));
    dlog("BUY_SIGNAL applied, state:", state);
  } else if (signal.intent === "EXIT") {
    // Any EXIT (BUY or SELL side from TV) → SELL_SIGNAL for our long-only engine
    const ev: Event = {
      type: "SELL_SIGNAL",
      stopPx: signal.stopPx,
      time: now,
    };
    ({ state } = stepPaper(state, ev));
    dlog("SELL_SIGNAL applied, state:", state);
  }
}


  // 2) Do a CONDN_CHECK using current LTP from priceStore
  const ltp = getPrice(symbol);
  dlog("LTP for", symbol, "=", ltp);

  if (ltp !== undefined) {
    const ev: Event = { type: "CONDN_CHECK", ltp, time: now };
    const res = stepPaper(state, ev);
    state = res.state;
    effect = res.effect;
    dlog("CONDN_CHECK result state:", state, "effect:", effect);
  }

  // 3) Persist new state via state store
  setPaperState(symbol, state);
  dlog("handlePaperSignal final state stored for", symbol);

  // 4) Execute side-effects (paper positions + livesim) based on effect
  executePaperEffect(symbol, effect);

  return { state, effect };
}

/**
 * Called whenever price changes (ticker or manual price UI).
 * This keeps the engine evaluating exit conditions (ltp < threshold)
 * even when there is no new TV signal.
 */
export function handlePaperTick(
  symbol: string,
  now: Date = new Date()
): void {
  const ltp = getPrice(symbol);
  if (ltp === undefined) return;

  const prevState: PaperState = getPaperState(symbol);

  const event: Event = {
    type: "CONDN_CHECK",
    ltp,
    time: now,
  };

  dlog(
    "TICK CONDN_CHECK for",
    symbol,
    "ltp =",
    ltp,
    "prevState =",
    prevState
  );

  const { state, effect } = stepPaper(prevState, event);

  setPaperState(symbol, state);

  dlog("TICK result state:", state, "effect:", effect);

  executePaperEffect(symbol, effect);
}
