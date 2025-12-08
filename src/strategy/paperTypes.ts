// src/strategy/paperTypes.ts

// Position state
export type Position = "NO_POSITION" | "LONG";

// Events coming into the engine
export type EventType = "BUY_SIGNAL" | "SELL_SIGNAL" | "CONDN_CHECK";

export interface Event {
  type: EventType;
  time: Date;
  stopPx?: number;   // used for BUY/SELL_SIGNAL
  ltp?: number;      // used for CONDN_CHECK
}

// Effects coming out of the engine
export type EffectType =
  | "NONE"
  | "EXECUTE_BUY_TRADE"
  | "EXECUTE_SELL_TRADE";

export interface Effect {
  type: EffectType;
  price?: number;
}

// Core paper state for a symbol
export interface PaperState {
  pos: Position;
  buyThreshold?: number;          // entry level from BUY_SIGNAL
  sellThreshold?: number;         // last SELL stopPx (for debug/logic)
  checkThreshold?: number;        // generic "active threshold" (entry or exit)
  lastBuyThreshold?: number;      // remembers last BUY stopPx
  sellCountAfterLastBuy: number;  // how many SELLs after last BUY
  blockedMinute: string | null;   // "YYYYMMDDHHmm" to enforce 1 decision/min
}

// Initial state
export const initialPaperState: PaperState = {
  pos: "NO_POSITION",
  buyThreshold: undefined,
  sellThreshold: undefined,
  checkThreshold: undefined,
  lastBuyThreshold: undefined,
  sellCountAfterLastBuy: 0,
  blockedMinute: null,
};

// Convert a time to a "minute key" string
export function minuteKey(time: Date): string {
  const d = new Date(time);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${min}`;
}

// Special condition detection hook
// (If you already had an implementation, paste it here instead.)
export function isSpecialCondition(state: PaperState, ltp: number): boolean {
  // Example default: no special condition
  // Replace with your real logic (BUY + 2 SELL + LTP < BUY_Threshold) if you need it.
  return false;
}
