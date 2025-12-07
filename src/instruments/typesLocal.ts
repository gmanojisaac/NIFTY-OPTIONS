export type Instr = {
  symbol: string;
  exchange: "NFO" | "BFO";
  tradingsymbol: string;
  token: number;
  lot: number;
};
