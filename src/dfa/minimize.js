// minimize.js — table-filling (pair-marking) minimization + the deliberately redundant 9-state design
import { spec } from './spec.js';

// Naive design: one EMERGENCY copy per "family" of source states (a common beginner mistake).
export function buildNaive() {
  const base = ['CLOSED', 'OPENING', 'OPEN_OCC', 'OPEN_WAIT', 'CLOSING', 'LOCKED'];
  const family = { CLOSED: 'EM_A', LOCKED: 'EM_A', OPENING: 'EM_B', CLOSING: 'EM_B', OPEN_OCC: 'EM_C', OPEN_WAIT: 'EM_C' };
  const Q = [...base, 'EM_A', 'EM_B', 'EM_C'];
  const delta = {};
  base.forEach(q => { delta[q] = { ...spec.delta[q], x: family[q] }; });
  ['EM_A', 'EM_B', 'EM_C'].forEach(e => {
    delta[e] = Object.fromEntries(spec.Sigma.map(a => [a, e]));
    delta[e].c = 'OPEN_OCC';
  });
  return { Q, delta, F: spec.F };
}

// Returns the marking rounds and the groups of equivalent (mergeable) states.
export function tableFilling({ Q, delta, F }) {
  const key = (a, b) => [a, b].sort().join('|');
  const marked = new Map();               // pair -> round in which it was marked
  const pairs = [];
  for (let i = 0; i < Q.length; i++) for (let j = i + 1; j < Q.length; j++) pairs.push([Q[i], Q[j]]);
  pairs.forEach(([a, b]) => { if (F.includes(a) !== F.includes(b)) marked.set(key(a, b), 0); });
  let round = 0, changed = true;
  while (changed) {
    changed = false; round++;
    const newly = [];
    pairs.forEach(([a, b]) => {
      if (marked.has(key(a, b))) return;
      if (spec.Sigma.some(s => marked.has(key(delta[a][s], delta[b][s])) && delta[a][s] !== delta[b][s])) newly.push(key(a, b));
    });
    newly.forEach(k => { marked.set(k, round); changed = true; });
  }
  const equivalent = pairs.filter(([a, b]) => !marked.has(key(a, b)));
  return { marked, equivalent, rounds: round - 1 };
}

if (typeof process !== 'undefined' && process.argv && import.meta.url.includes('minimize.js') && process.argv[1]?.endsWith('minimize.js')) {
  const naive = buildNaive();
  const rn = tableFilling(naive);
  console.log('Naive design:', naive.Q.length, 'states; equivalent pairs:', JSON.stringify(rn.equivalent), '; rounds:', rn.rounds);
  const rm = tableFilling({ Q: spec.Q, delta: spec.delta, F: spec.F });
  console.log('Final design:', spec.Q.length, 'states; equivalent pairs:', JSON.stringify(rm.equivalent), '; rounds:', rm.rounds);
  const byRound = {}; [...rn.marked.entries()].forEach(([k, r]) => (byRound[r] = (byRound[r] || 0) + 1));
  console.log('Naive pairs marked per round:', JSON.stringify(byRound), 'of', naive.Q.length * (naive.Q.length - 1) / 2);
  const bm = {}; [...rm.marked.entries()].forEach(([k, r]) => (bm[r] = (bm[r] || 0) + 1));
  console.log('Final pairs marked per round:', JSON.stringify(bm), 'of', 21);
}
