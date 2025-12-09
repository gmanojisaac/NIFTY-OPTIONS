import { kc } from "../auth/kite";

const symbols = [
  "NIFTY25D0925800CE",
  "NIFTY25D0925850PE",
  "BANKNIFTY25DEC59200CE",
  "BANKNIFTY25DEC59300PE",
  "SENSEX25D1184500CE",
  "SENSEX25D1184600PE"
];

async function resolveTokens() {
  const all = await kc.getInstruments();  // fetch full instrument list

  const tokens = symbols.map(sym => {
    const row = all.find(i => i.tradingsymbol === sym);
    if (!row) {
      console.log("Not found:", sym);
      return null;
    }
    return row.instrument_token;
  });

  console.log("Resolved Tokens:", tokens.filter(Boolean));
}

resolveTokens().catch(console.error);
