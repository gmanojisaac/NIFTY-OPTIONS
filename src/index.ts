//After 9 AM
//https://kite.zerodha.com/connect/login?v=3&api_key=k8jfisczsz5bsbff 
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
import "./server/tvWebhookTest";

function greet(name: string): string {
  return `Hello, ${name}!`;
}

async function main() {
  //console.log(greet("World"));
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
});