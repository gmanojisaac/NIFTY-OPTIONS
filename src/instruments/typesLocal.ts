export type Instr = {
  symbol: string;
  exchange: "NFO" | "NSE";
  tradingsymbol: string;
  token: number;
  lot: number;
};
