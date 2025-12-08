// src/server/dashboard.ts
import { app } from "./tvWebhookTest";
import { INSTRUMENTS } from "../instruments/sixInstruments";
import { latestPrice } from "../core/priceStore";
import { getSessionPnL } from "../pnl/pnl-session";
import { getPaperPositions } from "../strategy/strategy-papertrades-test";
import { liveSimPositions, liveSimHistory } from "../strategy/strategy-livesim";
import { getPaperDebugState } from "../strategy/paperIntegration";

// JSON state endpoint for the dashboard
app.get("/dashboard/state", (_req, res) => {
  const realized = getSessionPnL(); // { BUY, SELL }
  //console.log("[DASHBOARD][SERVER] getSessionPnL =", realized);

  // Start with realized PnL
  const pnl = {
    BUY: realized.BUY,
    SELL: realized.SELL,
  };

  // Add MTM from open paper positions
  const paperPositions = getPaperPositions();
  //.log("[DASHBOARD][SERVER] getPaperPositions =", paperPositions);

  paperPositions.forEach((p) => {
    const ltp = latestPrice[p.symbol];
    if (!ltp) {
      // console.log(
      //   "[DASHBOARD][SERVER] No LTP for paper position symbol",
      //   p.symbol
      // );
      return;
    }
    const mult = p.side === "BUY" ? 1 : -1;
    const mtm = (ltp - p.entry) * p.qty * mult;
    // console.log(
    //   "[DASHBOARD][SERVER] MTM for paper pos",
    //   p.symbol,
    //   "side=" + p.side,
    //   "qty=" + p.qty,
    //   "entry=" + p.entry,
    //   "ltp=" + ltp,
    //   "mtm=" + mtm
    // );
    pnl[p.side] += mtm;
  });

  const ltps = INSTRUMENTS.map((i) => ({
    symbol: i.symbol,
    tradingsymbol: i.tradingsymbol,
    ltp: latestPrice[i.symbol] ?? null,
  }));

  const paperDebug = getPaperDebugState();
  //console.log("[DASHBOARD][SERVER] getPaperDebugState length =", paperDebug?.length ?? 0);

  // console.log("[DASHBOARD][SERVER] /dashboard/state summary =", {
  //   pnl,
  //   pnlRealized: realized,
  //   paperPositionsCount: paperPositions.length,
  //   livePositionsCount: liveSimPositions.length,
  // });

  res.json({
    pnl,
    pnlRealized: realized,
    ltps,
    paperPositions,
    livePositions: liveSimPositions,
    liveHistory: liveSimHistory,
    paperDebug,
  });
});



// HTML dashboard
app.get("/dashboard", (_req, res) => {
  res.send(`<!doctype html>
<html>
<head>
  <title>Strategy Testing Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background:#0f172a; color:#e5e7eb; }
    header { padding:16px 24px; background:#020617; display:flex; justify-content:space-between; align-items:center; }
    .title { font-size:20px; font-weight:600; }
    .pill { padding:4px 10px; border-radius:999px; background:#1e293b; font-size:12px; }
    .pill-dot { width:6px; height:6px; border-radius:999px; background:#22c55e; display:inline-block; margin-right:6px; }
    main { padding:16px; display:grid; gap:16px; grid-template-columns:2fr 1fr; grid-auto-rows:minmax(140px,auto); }
    .card { background:#020617; border-radius:16px; padding:16px; box-shadow:0 10px 30px rgba(15,23,42,.7); }
    .card h2 { margin:0 0 8px 0; font-size:16px; }
    .row { display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid #1f2937; font-size:13px; }
    .row.header { font-weight:600; border-bottom:1px solid #374151; }
    .row:last-child { border-bottom:none; }
    .tag { font-size:11px; padding:2px 8px; border-radius:999px; background:#1e293b; }
    .pos-buy { color:#4ade80; }
    .pos-sell { color:#f97373; }
    .pnl-pos { color:#4ade80; }
    .pnl-neg { color:#f97373; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono"; }
    .badge-sc { font-size:10px; padding:2px 6px; border-radius:999px; background:#f97373; color:#020617; margin-left:6px; }
  </style>
</head>
<body>
  <header>
    <div class="title">Strategy Testing Dashboard</div>
    <div class="pill"><span class="pill-dot"></span>Engine Live</div>
  </header>
  <main>
    <section class="card">
      <h2>Live LTP</h2>
      <div id="ltp-list"></div>
    </section>
    <section class="card">
      <h2>Session P&L (Realized + MTM)</h2>
      <div id="pnl"></div>
    </section>
    <section class="card">
      <h2>Paper Positions</h2>
      <div id="paper"></div>
    </section>
    <section class="card">
      <h2>Livesim Positions</h2>
      <div id="live"></div>
    </section>
    <section class="card" style="grid-column:1 / span 2;">
      <h2>Paper Debug (Thresholds & Flags)</h2>
      <div class="row header mono">
        <div style="flex:1;">Symbol</div>
        <div style="width:80px;">Pos</div>
        <div style="width:90px;">LTP</div>
        <div style="width:110px;">checkThr</div>
        <div style="width:110px;">buyThr</div>
        <div style="width:110px;">sellThr</div>
        <div style="flex:1;">blockedMinute / SC</div>
      </div>
      <div id="paper-debug"></div>
    </section>
  </main>
  <script>
async function loadState() {
  try {
    console.log("[DASHBOARD][BROWSER] calling /dashboard/state");
    const res = await fetch('/dashboard/state');
    const data = await res.json();
    console.log("[DASHBOARD][BROWSER] /dashboard/state data =", data);

    renderLTP(data.ltps);
    renderPnL(data.pnl);
    renderPositions('paper', data.paperPositions);
    renderPositions('live', data.livePositions);
    renderPaperDebug(data.paperDebug);
  } catch (err) {
    console.error("[DASHBOARD][BROWSER] loadState error", err);
  }
}


    function renderLTP(list){
      const el = document.getElementById('ltp-list');
      el.innerHTML = list.map(i => 
        '<div class="row"><div><div>'+i.symbol+
        '</div><div class="tag mono">'+i.tradingsymbol+
        '</div></div><div class="mono">'+(i.ltp ?? '-')+
        '</div></div>'
      ).join('');
    }

    function renderPnL(p){
  console.log("[DASHBOARD][BROWSER] renderPnL input =", p);
  const el = document.getElementById('pnl');
  const rows = [];
  ['BUY','SELL'].forEach(s=>{
    const v = p[s] || 0;
    const cls = v >= 0 ? 'pnl-pos' : 'pnl-neg';
    rows.push('<div class="row"><div>'+s+
      '</div><div class="mono '+cls+'">'+v.toFixed(2)+'</div></div>');
  });
  el.innerHTML = rows.join('');
}

function renderPositions(id, pos){
  console.log("[DASHBOARD][BROWSER] renderPositions", id, pos);
  const el = document.getElementById(id);
  if (!pos || pos.length === 0){
    el.innerHTML = '<div class="row"><div>No positions</div></div>';
    return;
  }
  el.innerHTML = pos.map(p => 
    '<div class="row"><div>'+
    '<div>'+p.symbol+'</div>'+
    '<div class="tag '+(p.side==="BUY"?"pos-buy":"pos-sell")+'">'+p.side+
    '</div></div><div class="mono">'+p.qty+' @ '+p.entry+
    '</div></div>'
  ).join('');
}

function renderPaperDebug(rows){
  console.log("[DASHBOARD][BROWSER] renderPaperDebug rows =", rows);
  const el = document.getElementById('paper-debug');
  if (!rows || rows.length === 0){
    el.innerHTML = '<div class="row"><div>No engine state yet. Send a signal.</div></div>';
    return;
  }
  el.innerHTML = rows.map(r => {
    const s = r.state || {};
    const sc = r.specialCondition;
    const blocked = s.blockedMinute || '-';
    return '<div class="row mono">'+
      '<div style="flex:1;">'+r.symbol+'</div>'+
      '<div style="width:80px;">'+(s.pos || '-')+'</div>'+
      '<div style="width:90px;">'+(r.ltp ?? '-')+'</div>'+
      '<div style="width:110px;">'+(s.checkThreshold ?? '-')+'</div>'+
      '<div style="width:110px;">'+(s.buyThreshold ?? '-')+'</div>'+
      '<div style="width:110px;">'+(s.sellThreshold ?? '-')+'</div>'+
      '<div style="flex:1;">'+blocked+
        (sc ? '<span class="badge-sc">SC=TRUE</span>' : '')+
      '</div>'+
    '</div>';
  }).join('');
}


    loadState();
    setInterval(loadState, 2000);
  </script>
</body>
</html>`);
});
