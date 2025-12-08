export type PriceMode = "LIVE" | "MANUAL";

interface PriceEntry {
  live?: number;
  manual?: number;
  mode: PriceMode;
}

const priceState: Record<string, PriceEntry> = {};
export const latestPrice: Record<string, number> = {};

// core/priceStore.ts

// ... your existing imports ...

// NEW: listener type + list
type PriceListener = (symbol: string, price: number) => void;
const priceListeners: PriceListener[] = [];

// NEW: subscribe function
export function subscribePriceListener(listener: PriceListener) {
  priceListeners.push(listener);
}

// NEW: notify helper
function notifyPriceListeners(symbol: string, price: number) {
  for (const listener of priceListeners) {
    try {
      listener(symbol, price);
    } catch (err) {
      console.error("[PRICE_STORE] listener error for", symbol, err);
    }
  }
}


function ensure(symbol: string): PriceEntry {
  if (!priceState[symbol]) {
    priceState[symbol] = { mode: "LIVE" };
  }
  return priceState[symbol];
}

function refreshLatest(symbol: string) {
  const e = priceState[symbol];
  if (!e) return;

  let effective: number | undefined;

  if (e.mode === "MANUAL" && e.manual != null) {
    effective = e.manual;
  } else {
    effective = e.live ?? e.manual;
  }

  if (effective != null) {
    latestPrice[symbol] = effective;
  }
}

export function setLivePrice(symbol: string, price: number) {
  const e = ensure(symbol);
  e.live = price;
  refreshLatest(symbol);
}

export function setManualPrice(symbol: string, price: number) {
  const e = ensure(symbol);
  e.manual = price;
  e.mode = "MANUAL";
  refreshLatest(symbol);
    // NEW: notify paper engine (and any other listeners)
  notifyPriceListeners(symbol, price);
}

export function setPriceMode(symbol: string, mode: PriceMode) {
  const e = ensure(symbol);
  e.mode = mode;
  refreshLatest(symbol);
}

export function getPrice(symbol: string): number | undefined {
  const e = priceState[symbol];
  if (!e) return undefined;
  if (e.mode === "MANUAL" && e.manual != null) return e.manual;
  return e.live ?? e.manual;
}

export function getPriceMode(symbol: string): PriceMode {
  return priceState[symbol]?.mode ?? "LIVE";
}
