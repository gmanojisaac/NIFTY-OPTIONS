// src/strategy/paperStateStore.ts
import {
  initialPaperState,
} from "./paperEngine";
import { PaperState, isSpecialCondition } from "./paperTypes";
import { getPrice } from "../core/priceStore";

// ----------------------------
// LOCAL DEBUG FLAG ONLY HERE
// ----------------------------
const DEBUG = false;
const dlog = (...args: any[]) => {
  if (DEBUG) console.log("[paperStateStore]", ...args);
};

/**
 * In-memory store of per-symbol paperEngine states.
 * This module knows ONLY about state & debug view, no signals or trades.
 */
const paperStates: Record<string, PaperState> = {};

/**
 * Get existing state for a symbol, or initialize it with initialPaperState.
 */
export function getPaperState(symbol: string): PaperState {
  const existing = paperStates[symbol];
  if (existing) {
    dlog("getPaperState existing for", symbol, "=", existing);
    return existing;
  }

  // NOTE: initialPaperState is a constant PaperState in your current setup.
  // We reuse it the same way as before.
  paperStates[symbol] = initialPaperState;
  dlog("getPaperState initialized for", symbol, "=", initialPaperState);
  return initialPaperState;
}

/**
 * Overwrite the stored state for a symbol.
 */
export function setPaperState(symbol: string, state: PaperState): void {
  dlog("setPaperState for", symbol, "=", state);
  paperStates[symbol] = state;
}

/**
 * Reset all states (useful for tests).
 */
export function resetPaperStates(): void {
  dlog("resetPaperStates");
  Object.keys(paperStates).forEach((k) => delete paperStates[k]);
}

// ---- Debug view for dashboard ----

export interface PaperDebugRow {
  symbol: string;
  state: PaperState;
  ltp: number | undefined;
  specialCondition: boolean;
}

/**
 * Returns per-symbol paperEngine state + LTP + specialCondition flag.
 * Used only for the testing dashboard.
 */
export function getPaperDebugState(): PaperDebugRow[] {
  const rows = Object.entries(paperStates).map(([symbol, state]) => {
    const ltp = getPrice(symbol);
    const special =
      ltp !== undefined ? isSpecialCondition(state, ltp) : false;
    return { symbol, state, ltp, specialCondition: special };
  });
  dlog("getPaperDebugState rows:", rows);
  return rows;
}
