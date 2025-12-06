import express from "express";
import { onPaperSignal } from "../strategy/paper";
import { onLiveOpen, onLiveClose } from "../strategy/live";
import { Signal } from "../core/types";

const app = express();
app.use(express.json());

app.post("/tv", async (req, res) => {
  const { symbol, action } = req.body as { symbol: string; action: "BUY" | "SELL" };
  const signal: Signal = { symbol, side: action };
  console.log("TV ALERT", signal);

  const result = onPaperSignal(signal);

  // If paper opened and that side is enabled -> open live trade
  if (result.opened && result.liveEnabled[result.side]) {
    await onLiveOpen(signal);
  }

  // If paper closed and that side is enabled -> close live trade
  if (result.closed && result.liveEnabled[result.side]) {
    await onLiveClose(symbol);
  }

  res.json({ ok: true });
});

app.listen(3000, () => console.log("Webhook listening on :3000"));
