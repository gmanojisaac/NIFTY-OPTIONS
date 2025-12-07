import "dotenv/config";
import { KiteTicker, Tick } from "kiteconnect";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { setPrice } from "../core/priceStore";

export function startLiveTicker() {
  const apiKey = process.env.KITE_API_KEY || "";
  const accessToken = process.env.KITE_ACCESS_TOKEN || "";

  if (!apiKey || !accessToken) {
    console.log("[TICKER] Missing KITE_API_KEY or KITE_ACCESS_TOKEN → live ticker disabled");
    return;
  }

  const tokenToSymbol = new Map<number, string>();
  INSTRUMENTS.forEach(i => {
    if (i.token) tokenToSymbol.set(i.token, i.symbol);
  });

  const ticker = new KiteTicker({
    api_key: apiKey,
    access_token: accessToken
  });

  ticker.on("connect", () => {
    const tokens = Array.from(tokenToSymbol.keys());
    console.log("[TICKER] Connected. Subscribing to", tokens);
    ticker.subscribe(tokens);
    ticker.setMode(ticker.modeLTP, tokens);
  });

  ticker.on("ticks", (ticks: Tick[]) => {
    ticks.forEach(t => {
      const sym = tokenToSymbol.get(t.instrument_token);
      if (sym) {
        setPrice(sym, t.last_price);
        // console.log("[TICKER] LTP", sym, t.last_price);
      }
    });
  });

  ticker.on("error", (err) => console.log("[TICKER] Error:", err));
  ticker.on("disconnect", () => console.log("[TICKER] Disconnected"));

  ticker.connect();
}
