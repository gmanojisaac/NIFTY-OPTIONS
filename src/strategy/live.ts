import { kc } from "../auth/kite";
import { Signal, Position, Side } from "../core/types";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { latestPrice } from "../ticker/sixTicker";

const livePos: Position[] = [];

function inst(symbol: string) {
  return INSTRUMENTS.find(i => i.symbol === symbol);
}

function opp(side: Side): Side {
  return side === "BUY" ? "SELL" : "BUY";
}

export async function onLiveOpen(s: Signal) {
  const i = inst(s.symbol);
  if (!i) return;
  const price = latestPrice[s.symbol];
  const order = await kc.placeOrder("regular", {
    tradingsymbol: i.tradingsymbol,
    exchange: i.exchange,
    transaction_type: s.side,
    quantity: i.lot,
    order_type: "LIMIT",
    product: "NRML",
    price
  });
  console.log("LIVE OPEN", order);
  livePos.push({ symbol: s.symbol, side: s.side, qty: i.lot, entry: price! });
}

export async function onLiveClose(symbol: string) {
  const idx = livePos.findIndex(p => p.symbol === symbol);
  if (idx < 0) return;
  const pos = livePos[idx];
  const i = inst(symbol);
  if (!i) return;
  const price = latestPrice[symbol];
  const order = await kc.placeOrder("regular", {
    tradingsymbol: i.tradingsymbol,
    exchange: i.exchange,
    transaction_type: opp(pos.side),
    quantity: pos.qty,
    order_type: "LIMIT",
    product: "NRML",
    price
  });
  console.log("LIVE CLOSE", order);
  livePos.splice(idx, 1);
}
