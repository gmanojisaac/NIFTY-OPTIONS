// src/strategy/paperEffectExecutor.ts
import { Effect } from "./paperTypes";
import { computeQty } from "./paper-utils";
import { applyPaperTrade, getPaperPosition } from "./strategy-papertrades-test";
import { openLiveSim, closeLiveSim } from "./strategy-livesim";
import { Signal } from "../core/types";

// ----------------------------
// LOCAL DEBUG FLAG ONLY HERE
// ----------------------------
const DEBUG = true;
const dlog = (...args: any[]) => {
  if (DEBUG) console.log("[paperEffectExecutor]", ...args);
};

/**
 * Take an Effect produced by paperEngine and apply real side-effects:
 * - update paper positions / session PnL (applyPaperTrade)
 * - update livesim positions (openLiveSim / closeLiveSim)
 *
 * This file does NOT know how the Effect was created – it just executes it.
 */
export function executePaperEffect(symbol: string, effect: Effect): void {
  dlog("executePaperEffect for", symbol, "effect =", effect);

  switch (effect.type) {
    case "EXECUTE_BUY_TRADE": {
      const price = (effect as any).price as number | undefined;
      if (price === undefined) {
        dlog("EXECUTE_BUY_TRADE without price, skipping");
        return;
      }

      const { qty } = computeQty(symbol, price);

      dlog("EXECUTE_BUY_TRADE -> paper + livesim", {
        symbol,
        price,
        qty,
      });

      // 1) Paper position book (used by dashboard + PnL)
      applyPaperTrade({
        symbol,
        side: "BUY",
        qty,
        price,
      });

      // 2) Live simulator (uses same qty)
      const sig: Signal = { symbol, side: "BUY" } as Signal;
      openLiveSim(sig);

      return;
    }

case "EXECUTE_SELL_TRADE": {
  const price = (effect as any).price as number | undefined;
  if (price === undefined) {
    dlog("EXECUTE_SELL_TRADE without price, skipping");
    return;
  }

  // Get current open paper position (we saved qty on BUY)
  const pos = getPaperPosition(symbol);

  if (!pos || pos.qty <= 0) {
    dlog("EXECUTE_SELL_TRADE but no OPEN paper position for", symbol, " – skipping");
    // optionally: closeLiveSim(symbol); if you want to force-close sim even if paper missing
    return;
  }

  const qty = pos.qty; // close full position; change if you want partial exits

  dlog("EXECUTE_SELL_TRADE -> paper + livesim (closing full)", {
    symbol,
    price,
    qty,
  });

  // 1) Paper: realize PnL & remove/scale position
  applyPaperTrade({
    symbol,
    side: "SELL",
    qty,
    price,
  });

  // 2) Live sim: close the live position
  closeLiveSim(symbol);

  return;
}


    default:
      dlog("No side effects defined for effect type", effect.type);
      return;
  }
}
