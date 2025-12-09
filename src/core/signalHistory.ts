// src/core/signalHistory.ts
import { Signal } from "./types";

export interface SignalHistoryEntry {
  ts: string;
  source: string;  // e.g. "TV_WEBHOOK", "MANUAL_UI"
  signal: Signal;
}

const signalHistory: SignalHistoryEntry[] = [];

export function recordSignal(signal: Signal, source = "UNKNOWN") {
  signalHistory.push({
    ts: new Date().toISOString(),
    source,
    signal,
  });
}

export function getSignalHistory(): SignalHistoryEntry[] {
  return signalHistory;
}
