import express from "express";
import { Signal } from "../core/types";
import { handlePaperSignal } from "../strategy/strategy-papertrades";
import { openLiveTrade, closeLiveTrade } from "../strategy/strategy-livetrades";

const app = express();
app.use(express.json());

app.post("/tv", async (req, res) => {
  const { symbol, action } = req.body as { symbol: string; action: "BUY" | "SELL" };
  const signal: Signal = { symbol, side: action };
  const paper = handlePaperSignal(signal);

  if (paper.opened && paper.openLive) await openLiveTrade(signal);
  if (paper.closed && paper.closeLive) await closeLiveTrade(paper.symbol);

  res.json({ ok: true, paper });
});

app.listen(3000, () => console.log("TV webhook on :3000"));
