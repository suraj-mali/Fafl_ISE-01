// spec.js — the single source of truth for the DFA (website, tests and report all use this)
export const spec = {
  Q: ["CLOSED", "OPENING", "OPEN_OCC", "OPEN_WAIT", "CLOSING", "LOCKED", "EMERGENCY"],
  Sigma: ["f", "r", "b", "n", "e", "t", "o", "k", "x", "c"],
  q0: "CLOSED",
  F: ["CLOSED", "LOCKED"],   // accepting = door fully closed (bolted or not)
  delta: {
    CLOSED: {"f": "OPENING", "r": "CLOSED", "b": "CLOSED", "n": "CLOSED", "e": "CLOSED", "t": "CLOSED", "o": "CLOSED", "k": "LOCKED", "x": "EMERGENCY", "c": "CLOSED"},
    OPENING: {"f": "OPENING", "r": "OPENING", "b": "OPENING", "n": "OPENING", "e": "OPEN_OCC", "t": "OPENING", "o": "OPENING", "k": "OPENING", "x": "EMERGENCY", "c": "OPENING"},
    OPEN_OCC: {"f": "OPEN_OCC", "r": "OPEN_OCC", "b": "OPEN_OCC", "n": "OPEN_WAIT", "e": "OPEN_OCC", "t": "OPEN_OCC", "o": "OPEN_OCC", "k": "OPEN_OCC", "x": "EMERGENCY", "c": "OPEN_OCC"},
    OPEN_WAIT: {"f": "OPEN_OCC", "r": "OPEN_OCC", "b": "OPEN_OCC", "n": "OPEN_WAIT", "e": "OPEN_WAIT", "t": "CLOSING", "o": "OPEN_WAIT", "k": "OPEN_WAIT", "x": "EMERGENCY", "c": "OPEN_WAIT"},
    CLOSING: {"f": "OPENING", "r": "OPENING", "b": "OPENING", "n": "CLOSING", "e": "CLOSED", "t": "CLOSING", "o": "OPENING", "k": "CLOSING", "x": "EMERGENCY", "c": "CLOSING"},
    LOCKED: {"f": "LOCKED", "r": "LOCKED", "b": "LOCKED", "n": "LOCKED", "e": "LOCKED", "t": "LOCKED", "o": "LOCKED", "k": "CLOSED", "x": "EMERGENCY", "c": "LOCKED"},
    EMERGENCY: {"f": "EMERGENCY", "r": "EMERGENCY", "b": "EMERGENCY", "n": "EMERGENCY", "e": "EMERGENCY", "t": "EMERGENCY", "o": "EMERGENCY", "k": "EMERGENCY", "x": "EMERGENCY", "c": "OPEN_OCC"},
  },
  moore: {   // output depends on the state only (Moore machine)
    CLOSED: {"motor": "STOP", "bolt": "RELEASED", "lamp": "GREEN"},
    OPENING: {"motor": "DRIVE_OPEN", "bolt": "RELEASED", "lamp": "AMBER"},
    OPEN_OCC: {"motor": "STOP", "bolt": "RELEASED", "lamp": "BLUE"},
    OPEN_WAIT: {"motor": "STOP", "bolt": "RELEASED", "lamp": "CYAN"},
    CLOSING: {"motor": "DRIVE_CLOSE", "bolt": "RELEASED", "lamp": "ORANGE"},
    LOCKED: {"motor": "STOP", "bolt": "ENGAGED", "lamp": "GREY"},
    EMERGENCY: {"motor": "FORCE_OPEN", "bolt": "RELEASED", "lamp": "RED"},
  },
  stateMeaning: {
    CLOSED: "Door shut, motor off. Waiting for someone to approach.",
    OPENING: "Motor is driving the panels open.",
    OPEN_OCC: "Fully open and a pad is occupied, so the door is held open.",
    OPEN_WAIT: "Fully open, pads clear. Hold timer is counting down.",
    CLOSING: "Motor is driving the panels shut. Any presence reverses it.",
    LOCKED: "Closed and bolted. Ignores all presence.",
    EMERGENCY: "Fire alarm. Door forced open and held until the alarm is cleared.",
  },
  symbolMeaning: {
    f: "Front pad occupied (only)",
    r: "Rear pad occupied (only)",
    b: "Both pads occupied",
    n: "Neither pad occupied",
    e: "End-of-travel limit switch reached",
    t: "Hold timer expired",
    o: "Obstruction beam broken",
    k: "Key switch turned (lock / unlock)",
    x: "Emergency (fire alarm) asserted",
    c: "Emergency cleared (reset)",
  },
};

// Textbook "Level 1" door (Sipser). Used only for the Basic view on the State Diagram tab.
export const basic = {
  Q: ["CLOSED", "OPEN"],
  Sigma: ["NEITHER", "FRONT", "REAR", "BOTH"],
  q0: "CLOSED",
  F: ["CLOSED"],
  delta: {
    CLOSED: { NEITHER: "CLOSED", FRONT: "OPEN", REAR: "CLOSED", BOTH: "CLOSED" },
    OPEN:   { NEITHER: "CLOSED", FRONT: "OPEN", REAR: "OPEN",   BOTH: "OPEN" },
  },
};
