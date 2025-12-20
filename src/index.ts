//import "./auth/auth";
//import "./profile/profile";
//https://kite.zerodha.com/connect/login?v=3&api_key=k8jfisczsz5bsbff 
//use this link to create the request token and save it in the .env file
//KITE_REQUEST_TOKEN=
//KITE_API_SECRET=
//KITE_API_KEY=
//KITE_ACCESS_TOKEN= is generated and saved in the .env file
//npx ts-node ./src/auth/auth.ts

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
import "./server/tvWebhook";
function greet(name: string): string {
  return `Hello, ${name}!`;
}

async function main() {
  console.log(greet("World"));
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
});