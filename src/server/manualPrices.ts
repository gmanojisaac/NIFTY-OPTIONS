// src/server/manualPrices.ts
import express from "express";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import {
  getPrice,
  getPriceMode,
  setManualPrice,
  setPriceMode,
  PriceMode
} from "../core/priceStore";

export function startManualPriceServer(port: number) {
  const app = express();
  app.use(express.json());

  // State for the UI
app.get("/state", (_req, res) => {
  const rows = INSTRUMENTS.map(i => ({
    symbol: i.symbol,
    tradingsymbol: i.tradingsymbol,
    // 👇 THIS is the key change: read from live price store
    ltp: getPrice(i.symbol) ?? null,
    // if your UI uses mode you can include this, otherwise it's harmless extra info:
    mode: getPriceMode ? getPriceMode(i.symbol) : undefined
  }));
  res.json({ instruments: rows });
});


  // Set MANUAL price (also switches mode to MANUAL)
  app.post("/set", (req, res) => {
    const { symbol, price } = req.body as { symbol: string; price: number };
    if (!symbol || typeof price !== "number") {
      return res.status(400).json({ error: "symbol and price required" });
    }
    setManualPrice(symbol, price);
    console.log(`[MANUAL] PRICE SET ${symbol} ${price}`);
    res.json({ ok: true });
  });

  // Switch mode: LIVE or MANUAL (without changing price values themselves)
  app.post("/mode", (req, res) => {
    const { symbol, mode } = req.body as { symbol: string; mode: PriceMode };
    if (!symbol || (mode !== "LIVE" && mode !== "MANUAL")) {
      return res.status(400).json({ error: "symbol and valid mode required" });
    }
    setPriceMode(symbol, mode);
    console.log(`[MODE] ${symbol} → ${mode}`);
    res.json({ ok: true });
  });

  // HTML UI
  app.get("/", (_req, res) => {
    res.send(`<!doctype html>
<html>
<head>
  <title>Manual Price UI</title>
  <style>
    body { font-family: system-ui, sans-serif; margin:0; padding:16px; background:#020617; color:#e5e7eb; }
    h1 { margin-top:0; }
    .card { background:#0f172a; border-radius:12px; padding:16px; max-width:800px; box-shadow:0 10px 30px rgba(15,23,42,.7); }
    label { display:block; margin-bottom:4px; font-size:13px; }
    select, input { width:100%; padding:6px 8px; margin-bottom:12px; border-radius:8px; border:1px solid #1f2937; background:#020617; color:#e5e7eb; }
    button { padding:6px 10px; border-radius:8px; border:none; background:#22c55e; color:#020617; font-weight:600; cursor:pointer; font-size:12px; }
    button.secondary { background:#1f2937; color:#e5e7eb; margin-left:4px; }
    table { width:100%; border-collapse:collapse; margin-top:16px; font-size:13px; }
    th, td { padding:4px 6px; border-bottom:1px solid #1f2937; text-align:left; }
    th { font-weight:600; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono"; }
    .tag { border-radius:999px; padding:2px 8px; font-size:11px; }
    .mode-live { background:#16a34a33; color:#4ade80; }
    .mode-manual { background:#f9737333; color:#fb7185; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Manual Price Controller</h1>
    <form id="price-form">
      <label for="symbol">Instrument</label>
      <select id="symbol"></select>

      <label for="price">Manual Price</label>
      <input id="price" type="number" step="0.05" />

      <button type="submit">Set Manual Price</button>
    </form>

    <h2>Current LTPs (Effective)</h2>
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>TradingSymbol</th>
          <th>LTP</th>
          <th>Mode</th>
          <th>Switch</th>
        </tr>
      </thead>
      <tbody id="ltp-body"></tbody>
    </table>
  </div>

  <script>
    async function loadState() {
      const res = await fetch('/state');
      const data = await res.json();
      const instruments = data.instruments || [];

      const sel = document.getElementById('symbol');
      if (!sel.dataset.loaded) {
        sel.innerHTML = instruments.map(i =>
          '<option value="'+i.symbol+'">'+i.symbol+' ('+i.tradingsymbol+')</option>'
        ).join('');
        sel.dataset.loaded = "true";
      }

      const tbody = document.getElementById('ltp-body');
      tbody.innerHTML = instruments.map(i => {
        const modeClass = i.mode === 'MANUAL' ? 'mode-manual' : 'mode-live';
        return '<tr>'+
          '<td class="mono">'+i.symbol+'</td>'+
          '<td class="mono">'+i.tradingsymbol+'</td>'+
          '<td class="mono">'+(i.ltp ?? '-')+'</td>'+
          '<td><span class="tag '+modeClass+'">'+i.mode+'</span></td>'+
          '<td>'+
            '<button class="secondary" onclick="setMode(\\''+i.symbol+'\\', \\'LIVE\\')">LIVE</button>'+
            '<button class="secondary" onclick="setMode(\\''+i.symbol+'\\', \\'MANUAL\\')">MANUAL</button>'+
          '</td>'+
        '</tr>';
      }).join('');
    }

    async function setMode(symbol, mode) {
      await fetch('/mode', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ symbol, mode })
      });
      loadState();
    }

    document.getElementById('price-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const symbol = document.getElementById('symbol').value;
      const price = parseFloat(document.getElementById('price').value);
      if (!symbol || isNaN(price)) {
        alert('Please select symbol and enter price');
        return;
      }
      await fetch('/set', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ symbol, price })
      });
      document.getElementById('price').value = '';
      loadState();
    });

    loadState();
    setInterval(loadState, 2000);
  </script>
</body>
</html>`);
  });

  app.listen(port, () => {
    console.log("Manual price UI on http://localhost:" + port);
  });
}
