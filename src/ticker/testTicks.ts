import { KiteTicker } from "kiteconnect";
import "dotenv/config";

const apiKey = process.env.KITE_API_KEY!;
const accessToken = process.env.KITE_ACCESS_TOKEN!;

// Example: NIFTY 50 token = 256265
const token = 10727170;

const ticker = new KiteTicker({ api_key: apiKey, access_token: accessToken });

ticker.on("connect", () => {
  console.log("Connected");

  // Subscribe to NIFTY 50
  ticker.subscribe([token]);

  // Test FULL TICK
  ticker.setMode(ticker.modeFull, [token]);

  // Change mode after 5 seconds to LTP test
  setTimeout(() => {
    console.log("Switching to LTP mode...");
    ticker.setMode(ticker.modeLTP, [token]);
  }, 5000);
});

ticker.on("ticks", (ticks) => {
  const t = ticks[0];

  if (!t) return;

  if (t.buy) {
    console.log("\n🔵 FULL TICK:");
    console.log("Token:", t.instrument_token);
    console.log("Last Price:", t.last_price);
    console.log("Volume:", t.volume);
    console.log("Best Bid:", t.buy[0].price);
    console.log("Best Ask:", t.sell[0].price);
  } else {
    console.log("\n🟢 LTP TICK:");
    console.log("Token:", t.instrument_token);
    console.log("Last Price:", t.last_price);
  }
});

ticker.connect();
