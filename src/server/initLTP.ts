import "dotenv/config";
import { kc } from "../auth/kite";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { setPrice } from "../core/priceStore";

export async function initLTP() {
  const accessToken = process.env.KITE_ACCESS_TOKEN;
  if (!accessToken) {
    console.log("[initLTP] No KITE_ACCESS_TOKEN, skipping LTP init");
    return;
  }

  kc.setAccessToken(accessToken);

  const keys = INSTRUMENTS.map(i => `${i.exchange}:${i.tradingsymbol}`);
  const ltpMap = await kc.getLTP(keys);

  INSTRUMENTS.forEach(i => {
    const key = `${i.exchange}:${i.tradingsymbol}`;
    const data = ltpMap[key];
    if (data) {
      setPrice(i.symbol, data.last_price);
    }
  });

  console.log("[initLTP] Loaded LTP for", INSTRUMENTS.length, "symbols");
}
