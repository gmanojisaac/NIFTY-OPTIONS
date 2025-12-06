import { kc } from "../auth/kite";
import "dotenv/config";

async function getLastPrice(instrument: string) {
  try {
    const accessToken = process.env.KITE_ACCESS_TOKEN;
    if (!accessToken) {
      console.log("Set KITE_ACCESS_TOKEN in .env first");
      return;
    }

    kc.setAccessToken(accessToken);

    // instrument must be like "NFO:NIFTY24DEC22600CE", not instrument_token
    const q = await kc.getQuote([instrument]);
    console.log("Last price:", q[instrument].last_price, "Instrument-Id", q[instrument].instrument_token);
  } catch (err) {
    console.error("getQuote error:", err);
  }
}

// example: change this to your actual exchange:tradingsymbol
//getLastPrice("NFO:NIFTY25D0926200CE");

getLastPrice("NFO:NIFTY25D0926000CE");

