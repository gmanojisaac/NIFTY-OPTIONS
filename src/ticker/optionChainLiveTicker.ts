import { KiteTicker } from "kiteconnect";
import { kc } from "../auth/kite";
import "dotenv/config";

const apiKey = process.env.KITE_API_KEY!;
const accessToken = process.env.KITE_ACCESS_TOKEN!;
const expiry = process.env.OPTION_EXPIRY!;

async function start() {
  const inst = await kc.getInstruments("NFO");
  const tokens = inst
    .filter(i => i.name === "NIFTY" && i.segment === "NFO-OPT" && i.expiry.toISOString().split('T')[0] === expiry)
    .map(i => Number(i.instrument_token));
  const ticker = new KiteTicker({ api_key: apiKey, access_token: accessToken });
  ticker.on("connect", () => { console.log("OC ticker"); ticker.subscribe(tokens); ticker.setMode(ticker.modeLTP, tokens); });
  ticker.on("ticks", t => t.forEach(x => console.log(x.instrument_token, x.last_price)));
  ticker.connect();
}

start().catch(console.error);
