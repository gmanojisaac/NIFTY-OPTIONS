// src/core/tvAlertParser.ts
import type { TvSignal, Intent } from "../strategy/paperIntegration";

export function parseTvAlert(body: string): TvSignal | null {
  if (!body || typeof body !== "string") return null;

  const text = body.trim();

  let intent: Intent | null = null;
  if (text.includes("Accepted Entry")) {
    intent = "ENTRY";
  } else if (text.includes("Accepted Exit")) {
    intent = "EXIT";
  } else {
    return null;
  }

  // stopPx=100
  const stopMatch = text.match(/stopPx=(\d+(\.\d+)?)/);
  const stopPx = stopMatch ? Number(stopMatch[1]) : undefined;

  // sym=NIFTY251209C26200
  const symMatch = text.match(/sym=([A-Z0-9]+)/i);
  if (!symMatch) return null;

  const symbol = symMatch[1];

  // for now, side is always BUY on these alerts (you can extend later)
  const side: "BUY" | "SELL" = "BUY";

  return { symbol, side, intent, stopPx };
}
