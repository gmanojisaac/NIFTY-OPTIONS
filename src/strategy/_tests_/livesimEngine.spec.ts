// src/strategy/_tests_/livesimEngine.spec.ts
import {
  initialLiveSimState,
  stepLiveSim,
  LiveSimState,
  LiveSimEvent
} from "../livesimEngine";

describe("livesimEngine promotion and close rules", () => {
  it("opens livesim when paper buy executed and eligibleForLive = true", () => {
    const st = { ...initialLiveSimState };
    const ev: LiveSimEvent = {
      type: "PAPER_BUY_EXECUTED",
      eligibleForLive: true
    };

    const { state, effect } = stepLiveSim(st, ev);

    expect(effect.type).toBe("OPEN_LIVE");
    expect(state.hasPosition).toBe(true);
  });

  it("does not open livesim if already has position", () => {
    const st: LiveSimState = { hasPosition: true };
    const ev: LiveSimEvent = {
      type: "PAPER_BUY_EXECUTED",
      eligibleForLive: true
    };

    const { state, effect } = stepLiveSim(st, ev);

    expect(effect.type).toBe("NONE");
    expect(state.hasPosition).toBe(true);
  });

  it("does not open livesim if not eligibleForLive", () => {
    const st = { ...initialLiveSimState };
    const ev: LiveSimEvent = {
      type: "PAPER_BUY_EXECUTED",
      eligibleForLive: false
    };

    const { state, effect } = stepLiveSim(st, ev);

    expect(effect.type).toBe("NONE");
    expect(state.hasPosition).toBe(false);
  });

  it("closes livesim on explicit paper sell", () => {
    const st: LiveSimState = { hasPosition: true };
    const ev: LiveSimEvent = { type: "PAPER_SELL_EXPLICIT" };

    const { state, effect } = stepLiveSim(st, ev);

    expect(effect.type).toBe("CLOSE_LIVE");
    expect(state.hasPosition).toBe(false);
  });

  it("does nothing on explicit sell if no live position", () => {
    const st: LiveSimState = { hasPosition: false };
    const ev: LiveSimEvent = { type: "PAPER_SELL_EXPLICIT" };

    const { state, effect } = stepLiveSim(st, ev);

    expect(effect.type).toBe("NONE");
    expect(state.hasPosition).toBe(false);
  });

  it("closes livesim on auto paper sell when sessionPnl < 0", () => {
    const st: LiveSimState = { hasPosition: true };
    const ev: LiveSimEvent = {
      type: "PAPER_SELL_AUTO",
      sessionPnl: -10
    };

    const { state, effect } = stepLiveSim(st, ev);

    expect(effect.type).toBe("CLOSE_LIVE");
    expect(state.hasPosition).toBe(false);
  });

  it("keeps livesim open on auto paper sell when sessionPnl >= 0", () => {
    const st: LiveSimState = { hasPosition: true };
    const ev: LiveSimEvent = {
      type: "PAPER_SELL_AUTO",
      sessionPnl: 5
    };

    const { state, effect } = stepLiveSim(st, ev);

    expect(effect.type).toBe("NONE");
    expect(state.hasPosition).toBe(true);
  });
});
