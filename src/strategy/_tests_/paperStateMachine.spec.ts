// src/strategy/__tests__/paperEngine.spec.ts
import {
  initialPaperState,
  stepPaper,
  minuteKey,
  PaperState,
  Event
} from "../paperEngine";
import { isSpecialCondition } from "../paperEngine";
const base = new Date("2025-12-07T10:00:00Z");
const at = (minute: number, second = 0) =>
  new Date(base.getTime() + (minute * 60 + second) * 1000);

describe("paperEngine decision table", () => {
  it("P4: BUY_SIGNAL saves BUY_Threshold and checkThreshold, no trade", () => {
    const st = { ...initialPaperState };
    const ev: Event = { type: "BUY_SIGNAL", stopPx: 100, time: at(0, 5) };
    const { state, effect } = stepPaper(st, ev);

    expect(effect.type).toBe("NONE");
    expect(state.pos).toBe("NO_POSITION");
    expect(state.buyThreshold).toBe(100);
    expect(state.lastBuyThreshold).toBe(100);
    expect(state.checkThreshold).toBe(100);
    expect(state.sellCountAfterLastBuy).toBe(0);
  });

  it("P5: SELL_SIGNAL with no position saves SELL_Threshold and checkThreshold", () => {
    const st = { ...initialPaperState };
    const ev: Event = { type: "SELL_SIGNAL", stopPx: 120, time: at(0, 10) };
    const { state, effect } = stepPaper(st, ev);

    expect(effect.type).toBe("NONE");
    expect(state.pos).toBe("NO_POSITION");
    expect(state.sellThreshold).toBe(120);
    expect(state.checkThreshold).toBe(120);
  });

  it("P2: No Position, FALSE, LTP > checkThreshold → Execute BUY_Trade", () => {
    const st: PaperState = {
      ...initialPaperState,
      pos: "NO_POSITION",
      checkThreshold: 100
    };
    const ev: Event = { type: "CONDN_CHECK", ltp: 105, time: at(0, 20) };
    const { state, effect } = stepPaper(st, ev);

    expect(effect.type).toBe("EXECUTE_BUY_TRADE");
    if (effect.type === "EXECUTE_BUY_TRADE") {
      expect(effect.price).toBe(105);
    }
    expect(state.pos).toBe("LONG");
  });

  it("P3: No Position, FALSE, LTP < checkThreshold → idle A this minute", () => {
    const st: PaperState = {
      ...initialPaperState,
      pos: "NO_POSITION",
      checkThreshold: 100
    };
    const t1 = at(0, 30);
    const key1 = minuteKey(t1);

    // first tick: idle + block minute
    const { state: s1, effect: e1 } = stepPaper(st, {
      type: "CONDN_CHECK",
      ltp: 95,
      time: t1
    });
    expect(e1.type).toBe("NONE");
    expect(s1.pos).toBe("NO_POSITION");
    expect(s1.blockedMinute).toBe(key1);

    // second tick same minute: still idle
    const { state: s2, effect: e2 } = stepPaper(s1, {
      type: "CONDN_CHECK",
      ltp: 110,
      time: at(0, 40)
    });
    expect(e2.type).toBe("NONE");
    expect(s2.pos).toBe("NO_POSITION");

    // next minute: unblocked, LTP > threshold → BUY
    const { state: s3, effect: e3 } = stepPaper(s2, {
      type: "CONDN_CHECK",
      ltp: 110,
      time: at(1, 0)
    });
    expect(e3.type).toBe("EXECUTE_BUY_TRADE");
    expect(s3.pos).toBe("LONG");
  });

  it("P6: Position, LTP > checkThreshold → hold position", () => {
    const st: PaperState = {
      ...initialPaperState,
      pos: "LONG",
      checkThreshold: 100
    };
    const { state, effect } = stepPaper(st, {
      type: "CONDN_CHECK",
      ltp: 110,
      time: at(0, 50)
    });

    expect(effect.type).toBe("NONE");
    expect(state.pos).toBe("LONG");
  });

  it("P7: Position, LTP < checkThreshold → auto SELL B + idle same minute", () => {
    const st: PaperState = {
      ...initialPaperState,
      pos: "LONG",
      checkThreshold: 100
    };
    const t1 = at(2, 0);
    const key1 = minuteKey(t1);

    // first tick: auto SELL
    const { state: s1, effect: e1 } = stepPaper(st, {
      type: "CONDN_CHECK",
      ltp: 95,
      time: t1
    });
    expect(e1.type).toBe("EXECUTE_SELL_TRADE");
    if (e1.type === "EXECUTE_SELL_TRADE") {
      expect(e1.price).toBe(95);
    }
    expect(s1.pos).toBe("NO_POSITION");
    expect(s1.blockedMinute).toBe(key1);

    // same minute: still idle
    const { state: s2, effect: e2 } = stepPaper(s1, {
      type: "CONDN_CHECK",
      ltp: 90,
      time: at(2, 10)
    });
    expect(e2.type).toBe("NONE");
    expect(s2.pos).toBe("NO_POSITION");
  });

  it("P8: SELL_SIGNAL in Position saves SELL_Threshold and checkThreshold", () => {
    const st: PaperState = {
      ...initialPaperState,
      pos: "LONG",
      lastBuyThreshold: 100,
      sellCountAfterLastBuy: 0
    };
    const { state, effect } = stepPaper(st, {
      type: "SELL_SIGNAL",
      stopPx: 120,
      time: at(3, 0)
    });

    expect(effect.type).toBe("NONE");
    expect(state.sellThreshold).toBe(120);
    expect(state.checkThreshold).toBe(120);
    expect(state.pos).toBe("LONG");
    expect(state.sellCountAfterLastBuy).toBe(1);
  });

  it("P1/P9: After BUY + 2 SELL and LTP < BUY_Threshold → TRUE column sets checkThreshold=BUY_Threshold", () => {
    // BUY_SIGNAL
    let { state: s1 } = stepPaper(initialPaperState, {
      type: "BUY_SIGNAL",
      stopPx: 100,
      time: at(0, 5)
    });

    // first SELL_SIGNAL
    let { state: s2 } = stepPaper(s1, {
      type: "SELL_SIGNAL",
      stopPx: 120,
      time: at(0, 10)
    });

    // second SELL_SIGNAL
    let { state: s3 } = stepPaper(s2, {
      type: "SELL_SIGNAL",
      stopPx: 110,
      time: at(0, 20)
    });
    expect(s3.sellCountAfterLastBuy).toBe(2);
    expect(s3.lastBuyThreshold).toBe(100);

    // CONDN_CHECK with LTP < BUY_Threshold triggers TRUE-column rule
    const { state: s4, effect: e4 } = stepPaper(s3, {
      type: "CONDN_CHECK",
      ltp: 90,
      time: at(0, 30)
    });

    expect(e4.type).toBe("NONE");
    expect(s4.pos).toBe("NO_POSITION");
    // checkThreshold reset to BUY_Threshold
    expect(s4.checkThreshold).toBe(100);
  });

    it("P0a: No Position, CONDN_CHECK with undefined checkThreshold → no-op", () => {
    const st: PaperState = {
      ...initialPaperState,
      pos: "NO_POSITION",
      checkThreshold: undefined
    };

    const { state, effect } = stepPaper(st, {
      type: "CONDN_CHECK",
      ltp: 100,
      time: at(0, 15)
    });

    expect(effect.type).toBe("NONE");
    expect(state.pos).toBe("NO_POSITION");
    // still no threshold
    expect(state.checkThreshold).toBeUndefined();
  });

  it("P0b: No Position, CONDN_CHECK with ltp == checkThreshold → no-op", () => {
    const st: PaperState = {
      ...initialPaperState,
      pos: "NO_POSITION",
      checkThreshold: 100
    };

    const { state, effect } = stepPaper(st, {
      type: "CONDN_CHECK",
      ltp: 100, // equal
      time: at(0, 25)
    });

    expect(effect.type).toBe("NONE");
    expect(state.pos).toBe("NO_POSITION");
    expect(state.checkThreshold).toBe(100);
  });

  it("P0c: Position, CONDN_CHECK with undefined checkThreshold → no-op", () => {
    const st: PaperState = {
      ...initialPaperState,
      pos: "LONG",
      checkThreshold: undefined
    };

    const { state, effect } = stepPaper(st, {
      type: "CONDN_CHECK",
      ltp: 100,
      time: at(0, 35)
    });

    expect(effect.type).toBe("NONE");
    expect(state.pos).toBe("LONG");
    // still no threshold
    expect(state.checkThreshold).toBeUndefined();
  });

  it("P0d: Position, CONDN_CHECK with ltp == checkThreshold → no-op", () => {
    const st: PaperState = {
      ...initialPaperState,
      pos: "LONG",
      checkThreshold: 100
    };

    const { state, effect } = stepPaper(st, {
      type: "CONDN_CHECK",
      ltp: 100, // equal
      time: at(0, 45)
    });

    expect(effect.type).toBe("NONE");
    expect(state.pos).toBe("LONG");
    expect(state.checkThreshold).toBe(100);
  });
it("covers isSpecialCondition branches", () => {
  const base: PaperState = {
    ...initialPaperState,
    pos: "NO_POSITION",
    lastBuyThreshold: 100,
    sellCountAfterLastBuy: 2
  };

  // true case (already covered but fine)
  expect(isSpecialCondition(base, 90)).toBe(true);

  // various false cases exercising each sub-condition:
  expect(isSpecialCondition({ ...base, pos: "LONG" }, 90)).toBe(false);
  expect(
    isSpecialCondition({ ...base, lastBuyThreshold: undefined }, 90)
  ).toBe(false);
  expect(
    isSpecialCondition({ ...base, sellCountAfterLastBuy: 1 }, 90)
  ).toBe(false);
  expect(isSpecialCondition(base, 110)).toBe(false); // LTP >= BUY_Threshold
});
it("P0e: blockedMinute set but not equal to current minute → no idle, continue", () => {
  const earlier = at(0, 0);
  const later   = at(1, 0);

  const st: PaperState = {
    ...initialPaperState,
    pos: "NO_POSITION",
    checkThreshold: 100,
    blockedMinute: minuteKey(earlier) // different minute
  };

  const { state, effect } = stepPaper(st, {
    type: "CONDN_CHECK",
    ltp: 105,
    time: later
  });

  // should NOT early-return as idle; should behave like normal CONDN_CHECK
  expect(effect.type).toBe("EXECUTE_BUY_TRADE");
  expect(state.pos).toBe("LONG");
});

});
