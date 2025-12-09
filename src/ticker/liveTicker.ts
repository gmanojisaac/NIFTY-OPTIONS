// src/ticker/liveTicker.ts
import "dotenv/config";
import { KiteTicker, Tick } from "kiteconnect";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { setLivePrice } from "../core/priceStore";

const apiKey = process.env.KITE_API_KEY;
const accessToken = process.env.KITE_ACCESS_TOKEN;

if (!apiKey || !accessToken) {
  //console.log("[TICKER] ❌ Missing KITE_API_KEY or KITE_ACCESS_TOKEN, live ticker disabled");
} else {
  const ticker = new KiteTicker({
    api_key: apiKey,
    access_token: accessToken
  });

  const tokenToSymbol: Record<number, string> = {};
  const tokens: number[] = [];

  INSTRUMENTS.forEach((i: any) => {
    // ✅ use your `token` field, but fall back to `instrument_token` if present
    const token: number =
      i.token ?? i.instrument_token;

    if (!token) {
      //console.log("[TICKER] ⚠ instrument has no token:", i);
      return;
    }

    tokenToSymbol[token] = i.symbol;
    tokens.push(token);
  });

  //console.log("[TICKER] Will subscribe to tokens:", tokens);

  ticker.autoReconnect(true, 10, 5);

  ticker.on("connect", () => {
    //console.log("[TICKER] ✅ Connected. Subscribing to", tokens);
    ticker.subscribe(tokens);
    ticker.setMode(ticker.modeLTP, tokens);
  });

  ticker.on("ticks", (ticks: Tick[]) => {
    //console.log("[TICKER] ticks received:", ticks.length);

    ticks.forEach(t => {
      const token = t.instrument_token;
      const symbol = tokenToSymbol[token];

      if (!symbol) {
        //console.log("[TICKER] ⚠ No symbol mapping for token", token);
        return;
      }

      if (typeof t.last_price !== "number") {
        //console.log("[TICKER] ⚠ Invalid last_price for", symbol, t);
        return;
      }

      setLivePrice(symbol, t.last_price);
      //console.log(`[TICKER] ✔ UPDATE ${symbol} (${token}) -> ${t.last_price}`);
    });
  });

  ticker.on("error", (err) => {
    //console.error("[TICKER] ❌ error:", err);
  });

  ticker.on("close", () => {
    //console.log("[TICKER] ⚠ closed");
  });

  ticker.on("noreconnect", () => {
    //console.log("[TICKER] ⚠ will not reconnect");
  });

  ticker.on("reconnect", (reconnectCount, delay) => {
    //console.log("[TICKER] 🔁 reconnect attempt", reconnectCount, "in", delay, "ms");
  });

  console.log("[TICKER] Calling connect()...");
  //ticker.connect();
}
