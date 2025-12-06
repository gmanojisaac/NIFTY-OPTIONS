import { Instr } from "./typesLocal";

export const INSTRUMENTS: Instr[] = [
  { symbol: "BN_CE_1", exchange: "NFO", tradingsymbol: "BANKNIFTY24DEC48000CE", token: 0, lot: 15 },
  { symbol: "BN_PE_1", exchange: "NFO", tradingsymbol: "BANKNIFTY24DEC48000PE", token: 0, lot: 15 },
  { symbol: "BN_CE_2", exchange: "NFO", tradingsymbol: "BANKNIFTY24DEC48200CE", token: 0, lot: 15 },
  { symbol: "BN_PE_2", exchange: "NFO", tradingsymbol: "BANKNIFTY24DEC48200PE", token: 0, lot: 15 },
  { symbol: "BN_CE_3", exchange: "NFO", tradingsymbol: "BANKNIFTY24DEC48400CE", token: 0, lot: 15 },
  { symbol: "BN_PE_3", exchange: "NFO", tradingsymbol: "BANKNIFTY24DEC48400PE", token: 0, lot: 15 }
];
console.log("[sixInstruments] loaded", INSTRUMENTS.length, "instruments");