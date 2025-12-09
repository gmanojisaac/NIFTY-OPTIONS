// src/instruments/initLTP.ts
import "dotenv/config";
import { kc } from "../auth/kite";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { setLivePrice } from "../core/priceStore";

export async function initLTP() {
  const accessToken = process.env.KITE_ACCESS_TOKEN;
  if (!accessToken) {
    console.log("[initLTP] No KITE_ACCESS_TOKEN, skipping LTP init");
    return;
  }

  try {
    kc.setAccessToken(accessToken);

    const keys = INSTRUMENTS.map(i => `${i.exchange}:${i.tradingsymbol}`);
    console.log("[initLTP] Requesting LTP for keys:", keys);

    const ltpMap = await kc.getLTP(keys);

    INSTRUMENTS.forEach(i => {
      const key = `${i.exchange}:${i.tradingsymbol}`;
      const data = ltpMap[key];
      if (!data) {
        console.log("[initLTP] No LTP data for", key);
        return;
      }
      const ltp = data.last_price;
      setLivePrice(i.symbol, ltp); // 👈 IMPORTANT: same key used by manual UI
      console.log("[initLTP] Set", i.symbol, "=", ltp);
    });

    console.log("[initLTP] Loaded LTP for", INSTRUMENTS.length, "symbols");
  } catch (err) {
    console.error("[initLTP] Error fetching LTP:", err);
  }
}
