// src/ticker/liveTicker.ts
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { setLivePrice } from "../core/priceStore";  // whatever your setter is called
// import KiteTicker or your broker WS here

const DEBUG = false;
const tlog = (...args: any[]) => {
  if (DEBUG) console.log("[liveTicker]", ...args);
};

// 1) Prove this file is actually executing
tlog("liveTicker module loaded");

// Helper: map token → instrument
const tokenToInstrument: Record<string, { symbol: string; tradingsymbol: string }> = {};
INSTRUMENTS.forEach(i => {
  if (i.token !== undefined && i.token !== null) {
    tokenToInstrument[String(i.token)] = { symbol: i.symbol, tradingsymbol: i.tradingsymbol };
  }
});

tlog("tokenToInstrument map initialised with", Object.keys(tokenToInstrument).length, "entries");

// 2) Create and connect the ticker

function startLiveTicker() {
  tlog("Starting live ticker…");

  // This part depends on your actual client (KiteTicker etc.)
  // Example for KiteTicker style:
  //
  // const ticker = new KiteTicker({
  //   api_key: process.env.KITE_API_KEY!,
  //   access_token: process.env.KITE_ACCESS_TOKEN!,
  // });

  // ---- Replace this with your real ticker instance ----
  const ticker: any = createYourBrokerTickerSomehow();
  // -----------------------------------------------------

  ticker.on("connect", () => {
    tlog("Ticker connected, subscribing to tokens…");

    const tokens = Object.keys(tokenToInstrument).map(t => Number(t));
    tlog("Subscribing tokens:", tokens);

    ticker.subscribe(tokens);
    ticker.setMode(ticker.modeFull, tokens); // or modeLTP, depending on your needs
  });

  ticker.on("ticks", (ticks: any[]) => {
    tlog("ticks event received, count =", ticks.length);

    ticks.forEach((tick) => {
      const token = String(tick.instrument_token ?? tick.token);
      const instrument = tokenToInstrument[token];
      if (!instrument) {
        tlog("No instrument mapping for token", token, "tick:", tick);
        return;
      }

      // Grab a price field depending on your mode
      const price =
        tick.last_price ??
        tick.last_traded_price ??
        tick.ltp ??
        null;

      if (price == null) {
        tlog("Tick without price for token", token, "instrument", instrument, "raw tick:", tick);
        return;
      }

      tlog("Updating priceStore:", {
        token,
        symbol: instrument.symbol,
        tradingsymbol: instrument.tradingsymbol,
        price,
      });

      // 3) This is the critical call: write into priceStore
      setPrice(instrument.symbol, price);
    });
  });

  ticker.on("error", (err: any) => {
    console.error("[liveTicker] ticker error:", err);
  });

  ticker.on("close", () => {
    tlog("Ticker connection closed");
  });

  tlog("Connecting ticker now…");
  ticker.connect();
}

// Kick it off immediately on import
try {
  startLiveTicker();
} catch (err) {
  console.error("[liveTicker] Failed to start ticker:", err);
}
