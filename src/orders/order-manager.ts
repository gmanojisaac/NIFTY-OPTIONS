import { kc } from "../auth/kite";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { Side } from "../core/types";

export function lot(symbol: string) {
  return INSTRUMENTS.find(i => i.symbol === symbol)?.lot ?? 1;
}

export function reverse(side: Side): Side {
  return side === "BUY" ? "SELL" : "BUY";
}

export async function placeLimit(symbol: string, side: Side, price: number) {
  const inst = INSTRUMENTS.find(i => i.symbol === symbol);
  if (!inst || !price) throw new Error("Bad symbol/price");
  return kc.placeOrder("regular", {
    tradingsymbol: inst.tradingsymbol,
    exchange: inst.exchange,
    transaction_type: side,
    quantity: inst.lot,
    order_type: "LIMIT",
    product: "NRML",
    price
  });
}
