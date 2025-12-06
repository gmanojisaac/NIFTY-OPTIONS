import { getSessionPnL, isLiveEnabled } from "./pnl-session";
import { Side } from "../core/types";

const pnl = getSessionPnL();
const sides: Side[] = ["BUY", "SELL"];

console.log("=== SESSION P&L REPORT ===");
sides.forEach(s => {
  console.log(
    s,
    "PnL:",
    pnl[s],
    "LiveEnabled:",
    isLiveEnabled(s)
  );
});
