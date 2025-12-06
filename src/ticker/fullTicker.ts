import { KiteTicker } from "kiteconnect";
import "dotenv/config";

const apiKey = process.env.KITE_API_KEY!;
const accessToken = process.env.KITE_ACCESS_TOKEN!;
const token = Number(process.env.TEST_INSTRUMENT_TOKEN || 256265);

const ticker = new KiteTicker({ api_key: apiKey, access_token: accessToken });

ticker.on("connect", () => {
  console.log("Full ticker connected");
  ticker.subscribe([token]);
  ticker.setMode(ticker.modeFull, [token]);
});

ticker.on("ticks", t => {
  const x = t[0];
  if (x && x.buy && x.sell)
    console.log("Full:", x.instrument_token, x.last_price, "Bid:", x.buy[0].price, "Ask:", x.sell[0].price);
});

ticker.connect();
