import { kc } from "../auth/kite";

const symbols = [
  "NIFTY25D0926200CE",
  "NIFTY25D0926250PE",
  "BANKNIFTY25DEC59800CE",
  "BANKNIFTY25DEC59900PE",
  "SENSEX25D1185700CE",
  "SENSEX25D1185800PE"
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
