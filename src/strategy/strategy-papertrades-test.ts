import { Signal, Position } from "../core/types";
import { getPrice } from "../core/priceStore";
import { handlePaperOpen } from "./paper-open";
import { handlePaperClose } from "./paper-close";
import { PaperDecision } from "./paper-types";

const DEBUG = true;
const paperPos: Position[] = [];

export function handlePaperTestSignal(s: Signal): PaperDecision {
  const price = getPrice(s.symbol);

  if (DEBUG) console.log("[DEBUG] price =", price);

  if (!price) {
    return {
      opened: false,
      closed: false,
      symbol: s.symbol,
      side: s.side,
      openLive: false,
      closeLive: false
    };
  }

  const pos = paperPos.find(p => p.symbol === s.symbol);

  if (!pos) {
    return handlePaperOpen(s, price, paperPos);
  } else {
    return handlePaperClose(pos, price, paperPos);
  }
}
