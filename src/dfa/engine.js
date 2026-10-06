// engine.js — pure DFA engine (no UI code)
import { spec } from './spec.js';
const { q0, F, delta } = spec;

export function step(q, a) {
  if (!delta[q] || !(a in delta[q])) throw new Error(`undefined transition (${q}, ${a})`);
  return delta[q][a];
}

export function run(word, start = q0) {
  let q = start;
  const trace = [];
  [...word.replace(/\s+/g, '')].forEach((a, i) => {
    const next = step(q, a);
    trace.push({ i: i + 1, from: q, sym: a, to: next });
    q = next;
  });
  return { final: q, accepted: F.includes(q), trace };
}

// Symbols read in each state (used for the occupancy chart)
export function occupancy(trace) {
  const occ = Object.fromEntries(spec.Q.map(q => [q, 0]));
  trace.forEach(s => occ[s.from]++);
  return occ;
}
