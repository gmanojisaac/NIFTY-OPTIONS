// src/instruments/initLTP.ts
import "dotenv/config";
import { kc } from "../auth/kite";
import { INSTRUMENTS } from "./sixInstruments";
import { setLivePrice } from "../core/priceStore";

// --------------------------------------------
// LOCAL DEBUG SWITCH (per file)
// Turn ON logs:  const DEBUG = true;
// Turn OFF logs: const DEBUG = false;
// --------------------------------------------
const DEBUG = true;

function log(...args: any[]) {
  if (DEBUG) console.log(...args);
}

export async function initLTP() {
  const accessToken = process.env.KITE_ACCESS_TOKEN;
  if (!accessToken) {
    log("[initLTP] ❌ No KITE_ACCESS_TOKEN, cannot initialize LTP");
    return;
  }

  try {
    kc.setAccessToken(accessToken);
    log("[initLTP] ✔ Access token set");

    log("[initLTP] 📦 INSTRUMENTS:");
    INSTRUMENTS.forEach(i => {
      log(
        `   symbol=${i.symbol}, tradingsymbol=${i.tradingsymbol}, exchange=${i.exchange}, token=${i.token ?? i.token}`
      );
    });

    const requestKeys = INSTRUMENTS.map(
      i => `${i.exchange}:${i.tradingsymbol}`
    );

    log("\n[initLTP] 🔎 Requesting LTP for:");
    requestKeys.forEach(k => log("   →", k));

    const ltpMap = await kc.getLTP(requestKeys);

    log("\n[initLTP] 📥 RAW LTP RESPONSE FROM ZERODHA:");
    log(JSON.stringify(ltpMap, null, 2));

    let successCount = 0;

    INSTRUMENTS.forEach(inst => {
      const key = `${inst.exchange}:${inst.tradingsymbol}`;
      const data = ltpMap[key];

      if (!data) {
        log(`[initLTP] ⚠ No LTP data for ${key}`);
        return;
      }

      const ltp = data.last_price;
      setLivePrice(inst.symbol, ltp);

      log(`[initLTP] ✔ SET LIVE PRICE: ${inst.symbol} = ${ltp}`);
      successCount++;
    });

    log(`[initLTP] ✅ Completed. Loaded LTP for ${successCount}/${INSTRUMENTS.length} instruments.`);
  } catch (err) {
    console.error("[initLTP] ❌ ERROR:", err);
  }
}
