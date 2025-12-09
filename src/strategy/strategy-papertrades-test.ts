import { Signal, Position } from "../core/types";
import { getPrice } from "../core/priceStore";
import { handlePaperOpen } from "./paper-open";
import { handlePaperClose } from "./paper-close";
import { PaperDecision } from "./paper-types";
import { recordPnL } from "../pnl/pnl-session";

const DEBUG = false;
const paperPos: Position[] = [];
type PaperSide = "BUY" | "SELL";

interface PaperPosition {
  symbol: string;
  side: PaperSide;
  qty: number;
  entry: number;
}

const paperPositions: PaperPosition[] = [];

export interface PaperTrade {
  ts: string;         // ISO timestamp
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
}

const paperTradeHistory: PaperTrade[] = [];

export function getPaperTradeHistory(): PaperTrade[] {
  return paperTradeHistory;
}

export function getPaperPositions(): PaperPosition[] {
  //console.log("[PAPER_POS] getPaperPapplyPaperTradeositions called, returning", paperPositions);
  return paperPositions;
}

export function applyPaperTrade(trade: {
  symbol: string;
  side: PaperSide;
  qty: number;
  price: number;
}) {
  //console.log("[PAPER_POS] applyPaperTrade input =", trade);
  //console.log("[PAPER_POS] before update =", paperPositions);
  paperTradeHistory.push({
    ts: new Date().toISOString(),
    symbol: trade.symbol,
    side: trade.side,
    qty: trade.qty,
    price: trade.price,
  });
  const existingIndex = paperPositions.findIndex(
    (p) => p.symbol === trade.symbol && p.side === "BUY"
  );
  const existing = existingIndex >= 0 ? paperPositions[existingIndex] : undefined;

  if (trade.side === "BUY") {
    // Open / scale-in long position
    if (!existing) {
      paperPositions.push({
        symbol: trade.symbol,
        side: "BUY",
        qty: trade.qty,
        entry: trade.price,
      });
    } else {
      const totalQty = existing.qty + trade.qty;
      if (totalQty <= 0) {
        // Should not happen, but guard anyway
        paperPositions.splice(existingIndex, 1);
      } else {
        const newEntry =
          (existing.entry * existing.qty + trade.price * trade.qty) / totalQty;
        existing.qty = totalQty;
        existing.entry = newEntry;
      }
    }
  } else if (trade.side === "SELL") {
    // Close (part of) an existing long position and record realized PnL
    if (!existing) {
      // console.log(
      //   "[PAPER_POS] SELL received but no existing BUY position for",
      //   trade.symbol
      // );
    } else {
      const closeQty = Math.min(trade.qty, existing.qty);
      const realized = (trade.price - existing.entry) * closeQty;

      // console.log(
      //   "[PAPER_POS] realized PnL for",
      //   trade.symbol,
      //   "qty",
      //   closeQty,
      //   "entry",
      //   existing.entry,
      //   "exit",
      //   trade.price,
      //   "pnl",
      //   realized
      // );
      // Closing a BUY position -> record PnL under BUY
      recordPnL("BUY", realized);

      existing.qty -= closeQty;
      if (existing.qty <= 0) {
        paperPositions.splice(existingIndex, 1);
      }
    }
  }

  //console.log("[PAPER_POS] after update =", paperPositions);
}


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

export function getPaperPosition(symbol: string): PaperPosition | undefined {
  return paperPositions.find(
    (p) => p.symbol === symbol && p.side === "BUY"
  );
}

