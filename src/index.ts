//After 9 AM
//https://kite.zerodha.com/connect/login?v=3&api_key=k8jfisczsz5bsbff 
//npx ts-node ./src/auth/auth.ts
//import "./auth/auth";
//import "./profile/profile";

//use this link to create the request token and save it in the .env file
//KITE_REQUEST_TOKEN=
//KITE_API_SECRET=
//KITE_API_KEY=
//KITE_ACCESS_TOKEN= is generated and saved in the .env file


//convert to token list - everyday
//import "./tools/resolveTokens";
//example instrument token
//import "./ticker/ticker"; 
//import "./ticker/testTicks"; 
//import "./ticker/ltpTicker";
//import "./ticker/fullTicker";
//import "./ticker/multiSubscribeTicker";
//import "./ticker/optionChainLiveTicker";
//import "./ticker/strategyEngine";
//test ticks are used to show how the full mode and ltpmode works

//import "./instruments/searchRunner";
//import "./instruments/getQuote";
//we can  search for the instruments with token / name and expiry date

// Prod mode: TV webhook + strategies + ticker via imports
//import "./server/tvWebhook";
//To run the full webhook + strategies + ticker (live system):

//To reset the session:
//import "./pnl/session-reset";

//print current P&L report:
//import "./pnl/pnl-session-report";

//run the whole test harness
import "./server/tvWebhookTest";  // starts server + ticker
import "./server/dashboard";      // attaches dashboard routes
import "./server/manualPrices";   // optional

import { startManualPriceServer } from "./server/manualPrices";
import { initLTP } from "./instruments/initLTP";
import "./ticker/liveTicker";
import { subscribePriceListener } from "./core/priceStore";
import { handlePaperTick } from "./strategy/paperIntegration";

// Simple logger for this entry file
const log = (...args: unknown[]) => {
  const ts = new Date().toISOString();
  //console.log(ts, "[INDEX]", ...args);
};

// Set this to true (or via env) if tick-level logging is too noisy
const DEBUG_TICKS = false; // or: process.env.DEBUG_TICKS === "1";

subscribePriceListener((symbol, price) => {
  if (DEBUG_TICKS) {
    log("PRICE_TICK", { symbol, price });
  }
  log("Dispatching tick to paperIntegration", { symbol });
  handlePaperTick(symbol);
});

function greet(name: string): string {
  return `Hello, ${name}!`;
}

async function main() {
  log("Application starting…");

  // log the environment mode if needed
  log("NODE_ENV:", process.env.NODE_ENV || "undefined");

  log("Calling initLTP() to initialise LTP data");
  initLTP();
  log("initLTP() call finished (check initLTP logs for details)");

  const port = 4000;
  log("Starting manual price server", { port });
  startManualPriceServer(port);
  log("Manual price server started", { port });

  // Optional: sanity check greeting
  // log(greet("World"));
}

main().catch((err) => {
  console.error("❌ Unexpected error in main:", err);
  if (err && (err as any).stack) {
    console.error("Stack:", (err as any).stack);
  }
});
