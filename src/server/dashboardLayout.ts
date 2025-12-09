// src/server/dashboardLayout.ts
export function dashboardHtml(defaultSection: string = "main"): string {
  return `<!doctype html>
<html>
<head>
  <title>Strategy Testing Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background:#0f172a; color:#e5e7eb; }
    header { padding:16px 24px; background:#020617; display:flex; justify-content:space-between; align-items:center; }
    .title { font-size:20px; font-weight:600; }
    .pill { padding:4px 10px; border-radius:999px; background:#1e293b; font-size:12px; }
    .pill-dot { width:6px; height:6px; border-radius:999px; background:#22c55e; display:inline-block; margin-right:6px; }
    .nav { padding:8px 16px; background:#020617; border-top:1px solid #1e293b; display:flex; flex-wrap:wrap; gap:8px; }
    .nav-btn { font-size:12px; padding:4px 10px; border-radius:999px; background:#111827; border:1px solid #1f2937; cursor:pointer; color:#e5e7eb; }
    .nav-btn.active { background:#2563eb; border-color:#2563eb; }
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
    .hidden { display:none !important; }
  </style>
</head>
<body data-default-section="${defaultSection}">
  <header>
    <div class="title">Strategy Testing Dashboard</div>
    <div class="pill"><span class="pill-dot"></span>Engine Live</div>
  </header>

  <!-- NAV: 9 sections -->
  <div class="nav">
    <button class="nav-btn" data-section="main">Main Page</button>
    <button class="nav-btn" data-section="current">Current All Sections</button>
    <button class="nav-btn" data-section="ltp">LIVE LTP</button>
    <button class="nav-btn" data-section="paper-positions">Paper Positions</button>
    <button class="nav-btn" data-section="pnl">Session PnL</button>
    <button class="nav-btn" data-section="livesim-positions">LiveSIM Positions</button>
    <button class="nav-btn" data-section="paper-debug">Paper Debug</button>
    <button class="nav-btn" data-section="livesim-debug">LiveSIM Debug</button>
    <button class="nav-btn" data-section="after-market">After Market Page</button>
  </div>

  <main>
    <!-- cards: each card has a fixed id; section logic just hides/shows them -->

    <section class="card" id="card-ltp">
      <h2>Live LTP</h2>
      <div id="ltp-list"></div>
    </section>

    <section class="card" id="card-pnl">
      <h2>Session P&L (Realized + MTM)</h2>
      <div id="pnl"></div>
    </section>

    <section class="card" id="card-paper-positions">
      <h2>Paper Positions</h2>
      <div id="paper"></div>
    </section>

    <section class="card" id="card-livesim-positions">
      <h2>Livesim Positions</h2>
      <div id="live"></div>
    </section>

    <section class="card" id="card-paper-trades">
      <h2>Paper Trades History</h2>
      <div id="paper-trades"></div>
    </section>

    <section class="card" id="card-livesim-history">
      <h2>Livesim History</h2>
      <div id="live-history"></div>
    </section>

    <section class="card" id="card-signals">
      <h2>Signals History</h2>
      <div id="signals"></div>
    </section>

    <section class="card" id="card-paper-debug" style="grid-column:1 / span 2;">
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

    <section class="card" id="card-livesim-debug" style="grid-column:1 / span 2;">
      <h2>LiveSIM Debug</h2>
      <pre id="livesim-debug" class="mono" style="font-size:12px; white-space:pre-wrap;"></pre>
    </section>

    <section class="card" id="card-after-market" style="grid-column:1 / span 2;">
      <h2>After Market Page</h2>
      <div id="after-market-content">
        <div class="row"><div>After-market analytics placeholder</div></div>
      </div>
    </section>
  </main>

  <script>
    // ---- time helpers ----
    function formatBlockedMinuteIST(key) {
      if (!key) return "";
      if (typeof key !== "string" || key.length !== 12) return key;
      const year   = parseInt(key.slice(0, 4), 10);
      const month  = parseInt(key.slice(4, 6), 10);
      const day    = parseInt(key.slice(6, 8), 10);
      const hour   = parseInt(key.slice(8,10), 10);
      const minute = parseInt(key.slice(10,12), 10);
      const d = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
      return d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    function formatIST(isoString) {
      if (!isoString) return "";
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    }

    // ---- section switching ----
    const SECTION_MAP = {
      main: [
        "card-ltp",
        "card-pnl",
        "card-paper-positions",
        "card-livesim-positions"
      ],
      current: [
        "card-ltp",
        "card-pnl",
        "card-paper-positions",
        "card-livesim-positions",
        "card-paper-trades",
        "card-livesim-history",
        "card-signals",
        "card-paper-debug",
        "card-livesim-debug"
      ],
      "ltp": ["card-ltp"],
      "paper-positions": ["card-paper-positions"],
      "pnl": ["card-pnl"],
      "livesim-positions": ["card-livesim-positions"],
      "paper-debug": ["card-paper-debug"],
      "livesim-debug": ["card-livesim-debug"],
      "after-market": ["card-after-market"],
    };

    function setSection(section) {
      const allCardIds = [
        "card-ltp",
        "card-pnl",
        "card-paper-positions",
        "card-livesim-positions",
        "card-paper-trades",
        "card-livesim-history",
        "card-signals",
        "card-paper-debug",
        "card-livesim-debug",
        "card-after-market"
      ];
      const show = SECTION_MAP[section] || [];

      allCardIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (show.includes(id) || section === "current") {
          el.classList.remove("hidden");
        } else {
          el.classList.add("hidden");
        }
      });

      document.querySelectorAll(".nav-btn").forEach(btn => {
        if (btn.getAttribute("data-section") === section) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const sec = btn.getAttribute("data-section");
        setSection(sec);
      });
    });

    // ---- main data loader ----
    async function loadState() {
      try {
        const res = await fetch('/dashboard/state');
        const data = await res.json();

        renderLTP(data.ltps);
        renderPnL(data.pnl);
        renderPositions('paper', data.paperPositions);
        renderPositions('live', data.livePositions);
        renderPaperTrades(data.paperTrades);
        renderLiveHistory(data.liveHistory);
        renderSignals(data.signals);
        renderPaperDebug(data.paperDebug);
        renderLiveSimDebug(data.livePositions, data.liveHistory);
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

    function renderPaperTrades(trades){
      const el = document.getElementById('paper-trades');
      if (!trades || trades.length === 0){
        el.innerHTML = '<div class="row"><div>No trades yet</div></div>';
        return;
      }
      const sorted = [...trades].sort((a,b) => a.ts < b.ts ? 1 : -1);
      el.innerHTML = sorted.map(t =>
        '<div class="row mono">' +
          '<div style="flex:1;">'+t.symbol+'</div>' +
          '<div style="width:70px;" class="tag '+(t.side==="BUY"?"pos-buy":"pos-sell")+'">'+t.side+'</div>' +
          '<div style="width:80px;">'+t.qty+'</div>' +
          '<div style="width:80px;">'+t.price+'</div>' +
          '<div style="width:180px;">'+formatIST(t.ts)+'</div>' +
        '</div>'
      ).join('');
    }

    function renderLiveHistory(list) {
      const el = document.getElementById('live-history');
      if (!list || list.length === 0) {
        el.innerHTML = '<div class="row"><div>No history</div></div>';
        return;
      }
      const rows = [];
      list.forEach(t => {
        rows.push(
          '<div class="row mono">' +
            '<div style="flex:1;">'+t.symbol+'</div>' +
            '<div style="width:70px;" class="tag pos-buy">BUY</div>' +
            '<div style="width:80px;">'+t.qty+'</div>' +
            '<div style="width:80px;">'+t.entry+'</div>' +
            '<div style="width:80px;">OPEN</div>' +
          '</div>'
        );
        if (t.exit !== undefined) {
          rows.push(
            '<div class="row mono">' +
              '<div style="flex:1;">'+t.symbol+'</div>' +
              '<div style="width:70px;" class="tag pos-sell">SELL</div>' +
              '<div style="width:80px;">'+t.qty+'</div>' +
              '<div style="width:80px;">'+t.exit+'</div>' +
              '<div style="width:80px;">CLOSE</div>' +
            '</div>'
          );
        }
      });
      el.innerHTML = rows.join('');
    }

    function renderSignals(list){
      const el = document.getElementById('signals');
      if (!list || list.length === 0){
        el.innerHTML = '<div class="row"><div>No signals</div></div>';
        return;
      }
      const sorted = [...list].sort((a,b) => a.ts < b.ts ? 1 : -1);
      el.innerHTML = sorted.map(s =>
        '<div class="row mono">' +
          '<div style="width:180px;">'+formatIST(s.ts)+'</div>' +
          '<div style="width:100px;">'+s.source+'</div>' +
          '<div style="flex:1;">'+s.signal.symbol+'</div>' +
          '<div style="width:70px;" class="tag '+(s.signal.side==="BUY"?"pos-buy":"pos-sell")+'">'+s.signal.side+'</div>' +
        '</div>'
      ).join('');
    }

    function renderPaperDebug(debug) {
      const el = document.getElementById('paper-debug');
      if (!debug) {
        el.innerHTML = '<div class="row"><div>No data</div></div>';
        return;
      }
      if (Array.isArray(debug)) {
        const entries = debug.filter(e => e && e.symbol);
        if (entries.length === 0) {
          el.innerHTML = '<div class="row"><div>No data</div></div>';
          return;
        }
        el.innerHTML = entries.map(entry => {
          const st = entry.state || entry;
          const blockedDisplay = st.blockedMinute
            ? formatBlockedMinuteIST(st.blockedMinute) + " (key " + st.blockedMinute + ")"
            : "-";
          return (
            '<div class="row mono" style="flex-direction:column; align-items:flex-start;">' +
              '<div><strong>'+entry.symbol+'</strong></div>' +
              '<div>pos: '+(st.pos ?? "-")+'</div>' +
              '<div>buyThreshold: '+(st.buyThreshold ?? "-")+'</div>' +
              '<div>sellThreshold: '+(st.sellThreshold ?? "-")+'</div>' +
              '<div>checkThreshold: '+(st.checkThreshold ?? "-")+'</div>' +
              '<div>lastBuyThreshold: '+(st.lastBuyThreshold ?? "-")+'</div>' +
              '<div>sellCountAfterLastBuy: '+(st.sellCountAfterLastBuy ?? 0)+'</div>' +
              '<div>blockedMinute: '+ blockedDisplay +'</div>' +
            '</div>'
          );
        }).join('');
        return;
      }
      const symbols = Object.keys(debug).filter(sym => !!sym && debug[sym]);
      if (symbols.length === 0) {
        el.innerHTML = '<div class="row"><div>No data</div></div>';
        return;
      }
      el.innerHTML = symbols.map(sym => {
        const st = debug[sym];
        const blockedDisplay = st.blockedMinute
          ? formatBlockedMinuteIST(st.blockedMinute) + " (key " + st.blockedMinute + ")"
          : "-";
        return (
          '<div class="row mono" style="flex-direction:column; align-items:flex-start;">' +
            '<div><strong>'+sym+'</strong></div>' +
            '<div>pos: '+(st.pos ?? "-")+'</div>' +
            '<div>buyThreshold: '+(st.buyThreshold ?? "-")+'</div>' +
            '<div>sellThreshold: '+(st.sellThreshold ?? "-")+'</div>' +
            '<div>checkThreshold: '+(st.checkThreshold ?? "-")+'</div>' +
            '<div>lastBuyThreshold: '+(st.lastBuyThreshold ?? "-")+'</div>' +
            '<div>sellCountAfterLastBuy: '+(st.sellCountAfterLastBuy ?? 0)+'</div>' +
            '<div>blockedMinute: '+ blockedDisplay +'</div>' +
          '</div>'
        );
      }).join('');
    }

    function renderLiveSimDebug(livePositions, liveHistory) {
      const el = document.getElementById('livesim-debug');
      const obj = { livePositions, liveHistory };
      el.textContent = JSON.stringify(obj, null, 2);
    }

    // initial state: read from body data attribute
    const defaultSection = document.body.getAttribute("data-default-section") || "main";
    setSection(defaultSection);
    loadState();
    setInterval(loadState, 2000);
  </script>
</body>
</html>`;
}
