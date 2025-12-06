import express from "express";
import { Signal } from "../core/types";
import { handlePaperTestSignal } from "../strategy/strategy-papertrades-test";
import { openLiveSim, closeLiveSim } from "../strategy/strategy-livesim";
import { startManualPriceServer } from "./manualPrices";

const app = express();
app.use(express.json());

app.post("/tv", (req, res) => {
  const { symbol, action } = req.body as { symbol: string; action: "BUY" | "SELL" };
  const signal: Signal = { symbol, side: action };
  console.log("TV TEST ALERT", signal);

  const paper = handlePaperTestSignal(signal);

  if (paper.opened && paper.openLive) openLiveSim(signal);
  if (paper.closed && paper.closeLive) closeLiveSim(paper.symbol);

  res.json({ ok: true, paper });
});

startManualPriceServer(4000);
app.listen(3000, () => console.log("TV TEST webhook on http://localhost:3000/tv"));
