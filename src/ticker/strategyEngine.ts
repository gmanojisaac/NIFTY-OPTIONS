import { KiteTicker } from "kiteconnect";
import "dotenv/config";
const apiKey = process.env.KITE_API_KEY!;
const accessToken = process.env.KITE_ACCESS_TOKEN!;
const token = Number(process.env.STRATEGY_TOKEN || 256265);
const threshold = Number(process.env.STRATEGY_THRESHOLD || 0);
const ticker = new KiteTicker({ api_key: apiKey, access_token: accessToken });
ticker.on("connect", () => {
  console.log("Strategy ticker");
  ticker.subscribe([token]);
  ticker.setMode(ticker.modeLTP, [token]);
});
ticker.on("ticks", t => {
  const x = t[0];
  if (x && x.last_price > threshold)
    console.log("BUY signal", x.instrument_token, "LTP", x.last_price);
});
ticker.connect();
