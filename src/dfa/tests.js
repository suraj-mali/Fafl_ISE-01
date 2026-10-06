// tests.js — test cases, property checks and solved example
// run: node src/dfa/tests.js   (package.json must contain "type": "module")
import { spec } from './spec.js';
import { step, run, occupancy } from './engine.js';
const { Q, Sigma, F, moore } = spec;
export const T = [
 ["TC01","Initial configuration (empty input)","","CLOSED"],
 ["TC02","Normal visit: approach, open, pass, timeout, close","fente","CLOSED"],
 ["TC03","Rear/both pad while CLOSED never opens the door","rbnrb","CLOSED"],
 ["TC04","Door held open while pads stay occupied","febfrb","OPEN_OCC"],
 ["TC05","Stale timer ignored while pads are occupied","fet","OPEN_OCC"],
 ["TC06","Pads clear: hold countdown starts","fen","OPEN_WAIT"],
 ["TC07","Person re-enters during countdown","fenf","OPEN_OCC"],
 ["TC08","Countdown expires: door starts closing","fent","CLOSING"],
 ["TC09","Obstruction while closing reopens door","fento","OPENING"],
 ["TC10","Front pad while closing reopens door","fentf","OPENING"],
 ["TC11","Rear pad while closing reopens door","fentr","OPENING"],
 ["TC12","Both pads while closing reopens door","fentb","OPENING"],
 ["TC13","Full reopen cycle ends CLOSED","fentoente","CLOSED"],
 ["TC14","Key switch locks a closed door","k","LOCKED"],
 ["TC15","Locked door ignores everything except k and x","kfrbnetoc","LOCKED"],
 ["TC16","Key switch unlocks the door","kk","CLOSED"],
 ["TC17","Lock request rejected while door is open","fek","OPEN_OCC"],
 ["TC18","Emergency from CLOSED","x","EMERGENCY"],
 ["TC19","Emergency while closing","fentx","EMERGENCY"],
 ["TC20","Emergency overrides lock","kx","EMERGENCY"],
 ["TC21","Emergency ignores every symbol except c","xfrbnetok","EMERGENCY"],
 ["TC22","Recovery returns to a safe normal cycle","xcnte","CLOSED"],
 ["TC23","Spurious limit-switch symbol ignored in CLOSED","e","CLOSED"],
];

export const getPropertyChecks = () => [
 ["Totality", Q.every(q => Sigma.every(a => { try { step(q, a); return true; } catch { return false; } })), "DFA transitions are defined for every (state, symbol) pair."],
 ["Safety: CLOSING reverses on f, r, b, o", ['f','r','b','o'].every(a => step('CLOSING', a) === 'OPENING'), "Any presence or obstruction while closing immediately reverses to OPENING."],
 ["Safety: CLOSED never opens for r or b", ['r','b'].every(a => step('CLOSED', a) === 'CLOSED'), "Rear pad alone or both pads while closed will not open the door from outside."],
 ["Security: LOCKED leaves only on k or x", Sigma.filter(a => !['k','x'].includes(a)).every(a => step('LOCKED', a) === 'LOCKED'), "When bolted, all sensor signals and timers are ignored until unlocked or fire alarm."],
 ["Emergency: x from every state", Q.every(q => step(q, 'x') === 'EMERGENCY'), "Emergency fire alarm signal x immediately transitions any state to EMERGENCY."],
 ["Motor drives CLOSE only in CLOSING", Q.every(q => (moore[q].motor === 'DRIVE_CLOSE') === (q === 'CLOSING')), "Motor is set to DRIVE_CLOSE exclusively during the CLOSING state."],
 ["Bolt engaged only in LOCKED", Q.every(q => (moore[q].bolt === 'ENGAGED') === (q === 'LOCKED')), "The locking bolt is ENGAGED exclusively in the LOCKED state."],
];

export const P = [
 ["Totality", Q.every(q => Sigma.every(a => { try { step(q, a); return true; } catch { return false; } }))],
 ["Safety: CLOSING reverses on f, r, b, o", ['f','r','b','o'].every(a => step('CLOSING', a) === 'OPENING')],
 ["Safety: CLOSED never opens for r or b", ['r','b'].every(a => step('CLOSED', a) === 'CLOSED')],
 ["Security: LOCKED leaves only on k or x", Sigma.filter(a => !['k','x'].includes(a)).every(a => step('LOCKED', a) === 'LOCKED')],
 ["Emergency: x from every state", Q.every(q => step(q, 'x') === 'EMERGENCY')],
 ["Motor drives CLOSE only in CLOSING", Q.every(q => (moore[q].motor === 'DRIVE_CLOSE') === (q === 'CLOSING'))],
 ["Bolt engaged only in LOCKED", Q.every(q => (moore[q].bolt === 'ENGAGED') === (q === 'LOCKED'))],
];

if (typeof process !== 'undefined' && process.argv && (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('tests.js'))) {
  let pass = 0;
  T.forEach(([id, desc, w, exp]) => {
    const r = run(w); const ok = r.final === exp; if (ok) pass++;
    console.log(`${id} ${ok ? 'PASS' : 'FAIL'}  input="${w}"  final=${r.final}  accepted=${r.accepted}`);
  });
  const ref = JSON.stringify(run('fente').trace); let same = true;
  for (let i = 0; i < 1000; i++) if (JSON.stringify(run('fente').trace) !== ref) same = false;
  console.log(`TC24 ${same ? 'PASS' : 'FAIL'}  determinism: "fente" run 1000 times -> ${same ? 'identical trace' : 'DIFFERENT'}`);
  if (same) pass++;
  console.log(`\nTest cases passed: ${pass}/${T.length + 1}`);
  P.forEach(([n, ok]) => console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}`));
  console.log(`Property checks passed: ${P.filter(p => p[1]).length}/${P.length}`);
  const ex = run('febntoenterkfxfcnte');
  const occ = occupancy(ex.trace);
  console.log(`\nSolved example "febntoenterkfxfcnte": steps=${ex.trace.length} final=${ex.final} accepted=${ex.accepted}`);
  console.log('Occupancy (symbols read in each state):', JSON.stringify(occ));
}
