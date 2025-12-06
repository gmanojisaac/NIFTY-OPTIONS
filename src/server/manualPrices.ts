import express from "express";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { setPrice, latestPrice } from "../core/priceStore";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  const rows = INSTRUMENTS.map(i =>
    `<div>
      <b>${i.symbol}</b> 
      <input id="${i.symbol}" type="number" value="${latestPrice[i.symbol] || 0}">
      <button onclick="u('${i.symbol}')">Set</button>
    </div>`
  ).join("");
  res.send(`<html><body>${rows}
  <script>
  async function u(s){const v=Number(document.getElementById(s).value);
  await fetch('/price',{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({symbol:s,price:v})});}
  </script></body></html>`);
});

app.post("/price", (req, res) => {
  const { symbol, price } = req.body;
  setPrice(symbol, Number(price));
  console.log("PRICE SET", symbol, price);
  res.json({ ok: true });
});

export function startManualPriceServer(port = 4000) {
  app.listen(port, () => console.log("Manual price UI on http://localhost:" + port));
}
