export type Side = "BUY" | "SELL";

export type Signal = {
  symbol: string;   // matches TradingView alert
  side: Side;       // "BUY" or "SELL"
};

export type Position = {
  symbol: string;
  side: Side;
  qty: number;
  entry: number;
};
