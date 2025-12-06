import { KiteTicker } from "kiteconnect";
import "dotenv/config";

const apiKey = process.env.KITE_API_KEY!;
const accessToken = process.env.KITE_ACCESS_TOKEN!;
const token = Number(process.env.TEST_INSTRUMENT_TOKEN || 256265);

const ticker = new KiteTicker({ api_key: apiKey, access_token: accessToken });

ticker.on("connect", () => {
  console.log("LTP ticker connected");
  ticker.subscribe([token]);
  ticker.setMode(ticker.modeLTP, [token]);
});

ticker.on("ticks", t => {
  if (t[0]) console.log("LTP:", t[0].instrument_token, t[0].last_price);
});

ticker.connect();
