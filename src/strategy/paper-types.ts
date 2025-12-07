import { Side } from "../core/types";

export type PaperDecision = {
  opened: boolean;
  closed: boolean;
  symbol: string;
  side: Side;
  openLive: boolean;
  closeLive: boolean;
};

export function emptyDecision(symbol: string, side: Side): PaperDecision {
  return {
    opened: false,
    closed: false,
    symbol,
    side,
    openLive: false,
    closeLive: false
  };
}
