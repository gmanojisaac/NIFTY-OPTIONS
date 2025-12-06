import { resetSession, getSessionPnL } from "./pnl-session";

resetSession();
console.log("Session reset. Current PnL:", getSessionPnL());
