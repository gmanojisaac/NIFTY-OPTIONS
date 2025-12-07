import express from "express";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { latestPrice, setPrice } from "../core/priceStore";
import { initLTP } from "./initLTP";

const app = express();
app.use(express.json());

// Kick off LTP initialization (no need to await)
initLTP().catch(err => console.error("[initLTP] error", err));

app.get("/", (_req, res) => {
  const rows = INSTRUMENTS.map(i => {
    const v = latestPrice[i.symbol] ?? 0;
    return `<div>
      <b>${i.symbol}</b>
      <input id="${i.symbol}" type="number" value="${v}">
      <button onclick="u('${i.symbol}')">Set</button>
    </div>`;
  }).join("");
  res.send(`<html><body>${rows}
  <script>
  async function u(s){
    const v = Number(document.getElementById(s).value);
    await fetch('/price',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({symbol:s,price:v})
    });
  }
  </script></body></html>`);
});

app.post("/price", (req, res) => {
  const { symbol, price } = req.body;
  setPrice(symbol, Number(price));
  console.log("PRICE SET", symbol, price);
  res.json({ ok: true });
});

export function startManualPriceServer(port = 4000) {
  app.listen(port, () =>
    console.log("Manual price UI on http://localhost:" + port)
  );
}
