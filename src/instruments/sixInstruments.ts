import { Instr } from "./typesLocal";

export const INSTRUMENTS: Instr[] = [
  { symbol: "NIFTY251209C25800", exchange: "NFO", tradingsymbol: "NIFTY25D0925800CE", token: 10720002, lot: 75 },
  { symbol: "NIFTY251209P25850", exchange: "NFO", tradingsymbol: "NIFTY25D0925850PE", token: 10720770, lot: 75 },
  { symbol: "BANKNIFTY251230C59200", exchange: "NFO", tradingsymbol: "BANKNIFTY25DEC59200CE", token: 13163522, lot: 35 },
  { symbol: "BANKNIFTY251230P59300", exchange: "NFO", tradingsymbol: "BANKNIFTY25DEC59300PE", token: 13168642, lot: 35 },
  { symbol: "BSX251211C84500", exchange: "BFO", tradingsymbol: "SENSEX25D1184500CE", token: 290415109, lot: 20 },
  { symbol: "BSX251211P84600", exchange: "BFO", tradingsymbol: "SENSEX25D1184600PE", token: 290408453, lot: 20 }
];
console.log("[sixInstruments] loaded", INSTRUMENTS.length, "instruments");