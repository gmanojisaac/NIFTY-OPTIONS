import { KiteTicker } from "kiteconnect";
import "dotenv/config";
import { INSTRUMENTS } from "../instruments/sixInstruments";

const apiKey = process.env.KITE_API_KEY!;
const accessToken = process.env.KITE_ACCESS_TOKEN!;

export const latestPrice: Record<string, number> = {};
const tokens = INSTRUMENTS.map(i => i.token);
const byToken: Record<number, string> = {};
INSTRUMENTS.forEach(i => (byToken[i.token] = i.symbol));

const ticker = new KiteTicker({ api_key: apiKey, access_token: accessToken });

ticker.on("connect", () => {
  console.log("Ticker connected");
  ticker.subscribe(tokens);
  ticker.setMode(ticker.modeLTP, tokens);
});

ticker.on("ticks", ticks => {
  ticks.forEach(t => {
    const sym = byToken[t.instrument_token];
    if (sym) latestPrice[sym] = t.last_price;
  });
});

ticker.on("error", e => console.error("Ticker error", e));
ticker.connect();
