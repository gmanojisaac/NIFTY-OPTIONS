// src/strategy/paperIntegrationDebug.ts
import {
  getPaperDebugState as _getPaperDebugState,
  PaperDebugRow,
} from "./paperStateStore";

const DEBUG_PAPER_INTEGRATION = false;
const dlog = (...args: any[]) => {
  if (DEBUG_PAPER_INTEGRATION) console.log("[paperIntegration]", ...args);
};

// ---- Re-export debug view for dashboard ----

export function getPaperDebugState(): PaperDebugRow[] {
  const rows = _getPaperDebugState();
  dlog("getPaperDebugState rows:", rows);
  return rows;
}
