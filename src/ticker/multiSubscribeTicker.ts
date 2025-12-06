import { KiteTicker } from "kiteconnect";
import "dotenv/config";

const apiKey = process.env.KITE_API_KEY!;
const accessToken = process.env.KITE_ACCESS_TOKEN!;
const tokens = (process.env.MULTI_TOKENS || "").split(",").map(t => Number(t.trim())).filter(Boolean);

const ticker = new KiteTicker({ api_key: apiKey, access_token: accessToken });

ticker.on("connect", () => {
  console.log("Multi ticker connected");
  ticker.subscribe(tokens);
  ticker.setMode(ticker.modeLTP, tokens);
});

ticker.on("ticks", t => {
  t.forEach(x => console.log("LTP:", x.instrument_token, x.last_price));
});

ticker.connect();
