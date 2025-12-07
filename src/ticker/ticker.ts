import { KiteTicker } from "kiteconnect";
import "dotenv/config";

const apiKey = process.env.KITE_API_KEY!;
const accessToken = process.env.KITE_ACCESS_TOKEN!;

const ticker = new KiteTicker({ api_key: apiKey, access_token: accessToken });
console.log("ticker", ticker)
ticker.connect();

ticker.on("ticks", (ticks) => {
  console.log("Ticks:", JSON.stringify(ticks, null, 2));
});

ticker.on("connect", () => {
  console.log("Ticker Connected");
  ticker.subscribe([10727170]); // Example: NIFTY 50 spot instrument token
  ticker.setMode(ticker.modeFull, [10727170]);
});

ticker.on("error", (err) => console.error("Error:", err));
ticker.on("close", () => console.log("Ticker Closed"));
ticker.on("reconnect", () => console.log("Reconnecting…"));
ticker.on("noreconnect", () => console.log("Stopped Reconnecting"));
