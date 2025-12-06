import { kc } from "../auth/kite";

export async function searchNiftyOption(
  strike: number,
  type: "CE" | "PE",
  expiry: string
) {
  const all = await kc.getInstruments("NFO");

  const results = all.filter(i =>
    i.segment === "NFO-OPT" &&
    i.name === "NIFTY" &&
    i.strike === strike &&
    i.instrument_type === type &&
    i.expiry.toISOString().split('T')[0] === expiry
  );

  console.log(results);
}
