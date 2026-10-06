// src/sim/collision.test.js — Unit tests for collision physics
import { resolveMove, canCross, minPForPerson } from './collision.js';

let passed = 0;
let total = 0;

function assert(desc, condition) {
  total++;
  if (condition) {
    passed++;
    console.log(`PASS: ${desc}`);
  } else {
    console.error(`FAIL: ${desc}`);
  }
}

console.log('--- Running Collision Physics Unit Tests ---');

// Test 1: Closed door (p = 0): from (320, 300) to (320, 100) returns y >= 237 (blocked outside)
const res1 = resolveMove({ x: 320, y: 300 }, { x: 320, y: 100 }, 0);
assert('closed door (p = 0): from (320, 300) to (320, 100) returns y >= 237', res1.y >= 237);

// Test 2: p = 0.1: same, still blocked
const res2 = resolveMove({ x: 320, y: 300 }, { x: 320, y: 100 }, 0.1);
assert('p = 0.1: from (320, 300) to (320, 100) is still blocked (y >= 237)', res2.y >= 237);

// Test 3: p = 0.3: from (320, 300) to (320, 100) is allowed to pass
const res3 = resolveMove({ x: 320, y: 300 }, { x: 320, y: 100 }, 0.3);
assert('p = 0.3: from (320, 300) to (320, 100) is allowed to pass (y = 100)', res3.y === 100);

// Test 4: p = 1 and x = 250: blocked; x = 300: allowed
const res4a = resolveMove({ x: 250, y: 300 }, { x: 250, y: 100 }, 1.0);
assert('p = 1 and x = 250: blocked (y >= 237)', res4a.y >= 237);

const res4b = resolveMove({ x: 300, y: 300 }, { x: 300, y: 100 }, 1.0);
assert('p = 1 and x = 300: allowed (y = 100)', res4b.y === 100);

// Test 5: From inside (320, 100) to (320, 300) with p = 0: blocked inside (y <= 193)
const res5 = resolveMove({ x: 320, y: 100 }, { x: 320, y: 300 }, 0);
assert('from inside (320, 100) to (320, 300) with p = 0: blocked inside (y <= 193)', res5.y <= 193);

// Test 6: minPForPerson(320) equals 0.225
const minP = minPForPerson(320);
assert('minPForPerson(320) equals 0.225', Math.abs(minP - 0.225) < 0.0001);

console.log(`\nCollision Tests Summary: ${passed}/${total} passed`);

if (passed !== total) {
  process.exit(1);
}
