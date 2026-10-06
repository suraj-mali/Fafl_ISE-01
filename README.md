# Door DFA Lab — Automatic Sliding Door Controller

**Door DFA Lab** is an interactive, web-based Deterministic Finite Automaton (DFA) simulator and formal specification tool built for college course **CS343 Finite Automata and Formal Languages (FAFL)**. It models a physical automatic sliding door controller with dual pressure sensors, end-of-travel limit switches, obstacle detection, security bolt locking, and fire alarm emergency override.

Developed for **ISE-02 (2026–27)** at **RIT Rajaramnagar**.

---

## 🚀 Quick Start

### 1. Installation
Ensure Node.js (v18+) is installed:
```bash
npm install
```

### 2. Run Test Suite
Verify the core DFA engine with 24 test cases and 7 formal invariant checks:
```bash
node src/dfa/tests.js
```
Expected output: **24/24 test cases passed** and **7/7 property checks passed**.

### 3. Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
Build the static production bundle into `dist/`:
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```

---

## 🎨 System Architecture & Features

### 1. Core DFA Engine (`src/dfa/`)
- `spec.js`: Single source of truth defining state set \(Q\), alphabet \(\Sigma\), initial state \(q_0\), accepting states \(F\), transition matrix \(\delta\), and Moore outputs.
- `engine.js`: Pure function `step(q, a)` enforcing DFA state transitions without UI side-effects.
- `minimize.js`: Implements the **Table-Filling (Pair-Marking)** minimization algorithm to prove the 7-state design is minimal.
- `tests.js`: Verification test runner testing edge cases, safety invariants, and determinism.

### 2. User Interface Tabs
1. **Simulator (Hero Tab):**
   - Interactive 2D top-down SVG scene (viewBox `640×440`).
   - Drag-and-drop person tokens with physics-based wall collision enforcement (\(y=215\)).
   - Dual pressure pads (Front & Rear), infrared doorway beam zone, and obstacle box toggle.
   - Smooth door panel sliding (\(p \in [0, 1]\)) driven by Moore machine motor outputs (`DRIVE_OPEN`, `DRIVE_CLOSE`, `STOP`, `FORCE_OPEN`).
   - Live/Manual operation modes, hold timer slider (1–8s), and 3 guided presentation demos.
   - Live controller card displaying state badge, last step execution trace, Moore outputs, next possible transitions, and exportable event log CSV.

2. **State Diagram:**
   - Interactive SVG state transition diagram with active state glow ring and live transition edge highlights.
   - Segmented toggle between **Basic (2-state textbook Sipser door)** and **Full (7-state project door)** models.
   - Accepting states drawn with double borders.
   - Self-loops toggle and interactive State Inspector side panel.
   - Collapsible 7×10 formal transition table \(\delta(Q, \Sigma)\).

3. **Try a String:**
   - Input field accepting valid DFA symbols (`f`, `r`, `b`, `n`, `e`, `t`, `o`, `k`, `x`, `c`).
   - 5 presets including solved example `febntoenterkfxfcnte` (19 steps, accepted at `CLOSED`).
   - Interactive Step/Play controls, trace table, verdict badge, state occupancy bar chart, and trace CSV download.

4. **Verify:**
   - Accordion 1: Automated property checks (Totality, Safety, Security, Emergency, Motor isolation, Bolt isolation).
   - Accordion 2: Full 24-case test suite table.
   - Accordion 3: Minimization Lab showing pair-marking triangular table and round-by-round reveal.

---

## 📸 Demonstration Screenshot

```text
+-----------------------------------------------------------------------------------+
|  Door DFA Lab — An automatic door controller modelled as a finite automaton     |
+-----------------------------------------------------------------------------------+
|  [ Simulator ]   [ State Diagram ]   [ Try a String ]   [ Verify ]              |
+-----------------------------------------------------------------------------------+
|  +-------------------------------------+  +------------------------------------+  |
|  |           SVG SCENE VIEW            |  |          CONTROLLER CARD           |  |
|  |  [INSIDE]                           |  |  [OPEN_WAIT]                       |  |
|  |  +-------------------------------+  |  |  Hold timer counting down...       |  |
|  |  |         REAR PAD              |  |  |  Last step: OPEN_OCC —n→ OPEN_WAIT|  |
|  |  +-------------------------------+  |  |  Outputs: Motor: STOP, Bolt: REL   |  |
|  |  =================================  |  +------------------------------------+  |
|  |  || Left Door || Right Door ||      |  |           STATE STRIP              |  |
|  |  =================================  |  | [CL] [OPG] [OCC] (WAIT) [CLG]...   |  |
|  |  +-------------------------------+  |  +------------------------------------+  |
|  |  |        FRONT PAD              |  |                                          |
|  |  +-------------------------------+  |                                          |
|  |  [OUTSIDE]               (P1)       |                                          |
|  +-------------------------------------+                                          |
+-----------------------------------------------------------------------------------+
```

---

## 👥 Project Team

**Department of Computer Science & Engineering**  
**RIT Rajaramnagar** — Course CS343 FAFL (2026–27)

- **Aditya Patil**
- **Pranav More**
- **Sakshi Sawant**
- **Yash Salunkhe**
