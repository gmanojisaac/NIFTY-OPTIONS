import "dotenv/config";
import { KiteTicker, Tick } from "kiteconnect";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { setLivePrice } from "../core/priceStore";

// Enable debug
const DEBUG = false;
const dlog = (...args: any[]) => DEBUG && console.log("[KITE_TICKER]", ...args);

export function startLiveTicker() {
  dlog("startLiveTicker() called");

  const apiKey = process.env.KITE_API_KEY || "";
  const accessToken = process.env.KITE_ACCESS_TOKEN || "";

  if (!apiKey || !accessToken) {
    console.log("[KITE_TICKER] Missing KITE_API_KEY or KITE_ACCESS_TOKEN → ticker disabled");
    return;
  }

  const tokenToSymbol = new Map<number, string>();
  INSTRUMENTS.forEach(i => {
    if (i.token) {
      tokenToSymbol.set(i.token, i.symbol);
      dlog("Mapping token", i.token, "→", i.symbol);
    }
  });

  dlog("Initialising KiteTicker…");

  const ticker = new KiteTicker({
    api_key: apiKey,
    access_token: accessToken
  });

  ticker.on("connect", () => {
    const tokens = Array.from(tokenToSymbol.keys());
    dlog("Connected. Subscribing to tokens:", tokens);
    ticker.subscribe(tokens);
    ticker.setMode(ticker.modeLTP, tokens);
  });

  ticker.on("ticks", (ticks: Tick[]) => {
    dlog("Received ticks:", ticks.length);

    ticks.forEach(t => {
      const sym = tokenToSymbol.get(t.instrument_token);
      if (!sym) {
        dlog("Unknown token:", t.instrument_token, t);
        return;
      }

      dlog("Tick →", sym, "=", t.last_price);
      setLivePrice(sym, t.last_price);
    });
  });

  ticker.on("error", (err) => console.log("[KITE_TICKER] Error:", err));
  ticker.on("disconnect", () => console.log("[KITE_TICKER] Disconnected"));

  ticker.connect();
  dlog("ticker.connect() called");
}

// 🔥 Auto-start ticker on import
startLiveTicker();
