import { Instr } from "./typesLocal";

export const INSTRUMENTS: Instr[] = [
  { symbol: "NIFTY251209C26200", exchange: "NFO", tradingsymbol: "NIFTY25D0926200CE", token: 10729730, lot: 75 },
  { symbol: "NIFTY251209P26250", exchange: "NFO", tradingsymbol: "NIFTY25D0926250PE", token: 10730498, lot: 75 },
  { symbol: "BANKNIFTY251230C59800", exchange: "NFO", tradingsymbol: "BANKNIFTY25DEC59800CE", token: 13184258, lot: 35 },
  { symbol: "BANKNIFTY251230P59900", exchange: "NFO", tradingsymbol: "BANKNIFTY25DEC59900PE", token: 13186562, lot: 35 },
  { symbol: "BSX251211C85700", exchange: "BFO", tradingsymbol: "SENSEX25D1185700CE", token: 290432005, lot: 20 },
  { symbol: "BSX251211P85800", exchange: "BFO", tradingsymbol: "SENSEX25D1185800PE", token: 290427141, lot: 20 }
];
console.log("[sixInstruments] loaded", INSTRUMENTS.length, "instruments");