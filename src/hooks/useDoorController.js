import { useState, useEffect, useRef, useCallback } from 'react';
import { spec } from '../dfa/spec.js';
import { step } from '../dfa/engine.js';
import { resolveMove, minPForPerson } from '../sim/collision.js';

export function useDoorController() {
  // DFA State
  const [state, setState] = useState('CLOSED');
  const [prevTransition, setPrevTransition] = useState(null);
  const [log, setLog] = useState([]);
  const [p, setP] = useState(0); // 0 = closed, 1 = open
  const [holdTime, setHoldTime] = useState(3); // 1 - 8 seconds
  const [mode, setMode] = useState('live'); // 'live' | 'manual'
  const [activeTab, setActiveTab] = useState('simulator');

  // Pacing & Step Mode
  const [pace, setPace] = useState('normal'); // 'slow' (1500ms) | 'normal' (800ms) | 'fast' (300ms)
  const [isPaused, setIsPaused] = useState(false);
  const [stepMode, setStepMode] = useState(false);
  const [eventQueue, setEventQueue] = useState([]);
  const [activeStepAnimation, setActiveStepAnimation] = useState(null); // B3 animation state
  const [traversedTrail, setTraversedTrail] = useState([]); // Last 4 edges [{from, to}]
  const [isExpanded, setIsExpanded] = useState(false); // Modal overlay for automaton card

  // Interactive Scene positions
  const [personPos, setPersonPos] = useState({ x: 320, y: 410 });
  const [person2Pos, setPerson2Pos] = useState({ x: 320, y: 40 });
  const [secondPerson, setSecondPerson] = useState(false);
  const [obstacle, setObstacle] = useState(false);

  // Walking state
  const [isWalking, setIsWalking] = useState(false);
  const [walkDirection, setWalkDirection] = useState('in');
  const [isP1Waiting, setIsP1Waiting] = useState(false);

  const [isP2Walking, setIsP2Walking] = useState(false);
  const [walk2Direction, setWalk2Direction] = useState('out');
  const [isP2Waiting, setIsP2Waiting] = useState(false);

  // Demos state
  const [activeDemo, setActiveDemo] = useState(null);
  const [demoCaption, setDemoCaption] = useState('');
  const [dynamicCaption, setDynamicCaption] = useState('System initialized at CLOSED. Waiting for someone to approach.');

  // Refs for animation loops & closures
  const stateRef = useRef(state);
  stateRef.current = state;

  const pRef = useRef(p);
  pRef.current = p;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const logRef = useRef(log);
  logRef.current = log;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const lastPadSymbolRef = useRef('n');
  const timerCountdownRef = useRef(null);
  const closingObstructionEmittedRef = useRef(false);
  const limitReachedEmittedRef = useRef({ open: false, close: false });
  const isProcessingQueueRef = useRef(false);

  // Core execution step (processes one symbol)
  const executeStep = useCallback((symbol, source) => {
    const currentState = stateRef.current;
    let nextState;
    try {
      nextState = step(currentState, symbol);
    } catch (err) {
      console.error(`Invalid DFA transition (${currentState}, ${symbol})`, err);
      return currentState;
    }

    const isIgnored = nextState === currentState;

    const newStep = {
      stepNum: logRef.current.length + 1,
      from: currentState,
      sym: symbol,
      to: nextState,
      source,
      isIgnored,
      timestamp: new Date().toLocaleTimeString()
    };

    setState(nextState);
    setPrevTransition(newStep);
    setLog(prev => [newStep, ...prev]);

    // Update dynamic caption bar
    const symDesc = spec.symbolMeaning[symbol] || symbol;
    if (isIgnored) {
      setDynamicCaption(`Signal '${symbol}' (${symDesc}) received — state remains ${currentState} (ignored).`);
    } else {
      setDynamicCaption(`${symDesc} → transition to ${nextState}.`);
    }

    // Update edge trail if state changed
    if (!isIgnored) {
      setTraversedTrail(prev => [{ from: currentState, to: nextState }, ...prev].slice(0, 4));
    }

    // Trigger B3 animation sequence state
    setActiveStepAnimation({
      step: newStep,
      stage: 'event', // 'event' -> 'lookup' -> 'transition' -> 'arrival'
      startTime: performance.now()
    });

    // Reset single-event flags
    if (nextState !== currentState) {
      if (nextState === 'CLOSING') closingObstructionEmittedRef.current = false;
      if (nextState === 'OPENING') limitReachedEmittedRef.current.open = false;
      if (nextState === 'CLOSING') limitReachedEmittedRef.current.close = false;
    }

    return nextState;
  }, []);

  // Dispatch pushes to Event Queue (Emergency 'x' jumps to front)
  const dispatch = useCallback((symbol, source = 'user') => {
    setEventQueue(prev => {
      const eventItem = { id: Math.random().toString(), symbol, source };
      if (symbol === 'x') {
        return [eventItem, ...prev]; // Jump to front
      }
      return [...prev, eventItem];
    });
  }, []);

  // Process next event in Queue
  const processNextEvent = useCallback(() => {
    if (eventQueue.length === 0) return;
    const nextEvent = eventQueue[0];
    setEventQueue(prev => prev.slice(1));
    executeStep(nextEvent.symbol, nextEvent.source);
  }, [eventQueue, executeStep]);

  // Queue Scheduler Loop according to Pace & Step Mode
  useEffect(() => {
    if (isPaused || eventQueue.length === 0 || isProcessingQueueRef.current) return;
    if (stepMode) return; // In Step Mode, user must click "Next step"

    isProcessingQueueRef.current = true;
    const paceDelay = pace === 'slow' ? 1500 : pace === 'fast' ? 300 : 800;

    const timer = setTimeout(() => {
      processNextEvent();
      isProcessingQueueRef.current = false;
    }, paceDelay);

    return () => {
      clearTimeout(timer);
      isProcessingQueueRef.current = false;
    };
  }, [eventQueue, isPaused, stepMode, pace, processNextEvent]);

  // Reset entire controller
  const reset = useCallback(() => {
    setState('CLOSED');
    setPrevTransition(null);
    setLog([]);
    setP(0);
    setEventQueue([]);
    setTraversedTrail([]);
    setActiveStepAnimation(null);
    setPersonPos({ x: 320, y: 410 });
    setPerson2Pos({ x: 320, y: 40 });
    setSecondPerson(false);
    setObstacle(false);
    setIsWalking(false);
    setWalkDirection('in');
    setIsP1Waiting(false);
    setIsP2Walking(false);
    setWalk2Direction('out');
    setIsP2Waiting(false);
    setActiveDemo(null);
    setDemoCaption('');
    setDynamicCaption('System initialized at CLOSED. Waiting for someone to approach.');
    setIsPaused(false);
    setStepMode(false);
    lastPadSymbolRef.current = 'n';
    limitReachedEmittedRef.current = { open: false, close: false };
    closingObstructionEmittedRef.current = false;
    if (timerCountdownRef.current) {
      clearTimeout(timerCountdownRef.current);
      timerCountdownRef.current = null;
    }
  }, []);

  // Compute Pad Symbol based on person 1 & person 2 positions
  const getPadSymbol = useCallback((p1, p2, p2Active) => {
    const isFront = (pos) => pos.x >= 220 && pos.x <= 420 && pos.y >= 300 && pos.y <= 370;
    const isRear = (pos) => pos.x >= 220 && pos.x <= 420 && pos.y >= 60 && pos.y <= 130;

    const f1 = isFront(p1);
    const r1 = isRear(p1);
    const f2 = p2Active && isFront(p2);
    const r2 = p2Active && isRear(p2);

    const fOcc = f1 || f2;
    const rOcc = r1 || r2;

    if (fOcc && rOcc) return 'b';
    if (fOcc) return 'f';
    if (rOcc) return 'r';
    return 'n';
  }, []);

  // Compute beam zone obstruction
  const isBeamBroken = useCallback((p1, p2, p2Active, obst) => {
    if (obst) return true;
    const inBeam = (pos) => pos.x >= 240 && pos.x <= 400 && pos.y >= 195 && pos.y <= 249;
    return inBeam(p1) || (p2Active && inBeam(p2));
  }, []);

  // 1. Live Pad Sensor Check
  useEffect(() => {
    if (mode !== 'live' || isPaused) return;
    const currentPadSym = getPadSymbol(personPos, person2Pos, secondPerson);
    if (currentPadSym !== lastPadSymbolRef.current) {
      lastPadSymbolRef.current = currentPadSym;
      dispatch(currentPadSym, 'sensor');
    }
  }, [personPos, person2Pos, secondPerson, mode, isPaused, getPadSymbol, dispatch]);

  // 2. Timer 't' Logic when in OPEN_WAIT
  useEffect(() => {
    if (state === 'OPEN_WAIT' && mode === 'live' && !isPaused) {
      if (timerCountdownRef.current) clearTimeout(timerCountdownRef.current);
      timerCountdownRef.current = setTimeout(() => {
        if (stateRef.current === 'OPEN_WAIT' && modeRef.current === 'live' && !isPausedRef.current) {
          dispatch('t', 'timer');
        }
      }, holdTime * 1000);
    } else {
      if (timerCountdownRef.current) {
        clearTimeout(timerCountdownRef.current);
        timerCountdownRef.current = null;
      }
    }
    return () => {
      if (timerCountdownRef.current) {
        clearTimeout(timerCountdownRef.current);
        timerCountdownRef.current = null;
      }
    };
  }, [state, mode, holdTime, isPaused, dispatch]);

  // 3. Main Animation Loop: Motor drive, Solid Door Physical Stop, Auto-walk
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isPausedRef.current) {
        const currentState = stateRef.current;
        const currentP = pRef.current;
        const motor = spec.moore[currentState].motor;

        // Calculate Physical Minimum Door Open Fraction (Door cannot crush person/obstacle)
        let minPFloor = 0;
        const inBeam1 = personPos.x >= 240 && personPos.x <= 400 && personPos.y >= 195 && personPos.y <= 249;
        const inBeam2 = secondPerson && person2Pos.x >= 240 && person2Pos.x <= 400 && person2Pos.y >= 195 && person2Pos.y <= 249;

        if (inBeam1) minPFloor = Math.max(minPFloor, minPForPerson(personPos.x));
        if (inBeam2) minPFloor = Math.max(minPFloor, minPForPerson(person2Pos.x));
        if (obstacle) minPFloor = Math.max(minPFloor, 0.3);

        // --- A. Motor Physics ---
        let nextP = currentP;
        if (motor === 'DRIVE_OPEN' || motor === 'FORCE_OPEN') {
          nextP = Math.min(1, currentP + dt / 1.2);
          if (nextP === 1 && currentP < 1 && motor === 'DRIVE_OPEN' && modeRef.current === 'live') {
            if (!limitReachedEmittedRef.current.open) {
              limitReachedEmittedRef.current.open = true;
              dispatch('e', 'limit switch');
            }
          }
        } else if (motor === 'DRIVE_CLOSE') {
          const targetCloseP = Math.max(minPFloor, currentP - dt / 1.2);
          nextP = Math.max(0, targetCloseP);
          if (nextP === 0 && currentP > 0 && modeRef.current === 'live') {
            if (!limitReachedEmittedRef.current.close) {
              limitReachedEmittedRef.current.close = true;
              dispatch('e', 'limit switch');
            }
          }
        }
        if (nextP !== currentP) {
          setP(nextP);
        }

        // --- B. Obstruction in CLOSING ---
        if (currentState === 'CLOSING' && modeRef.current === 'live') {
          const broken = isBeamBroken(personPos, person2Pos, secondPerson, obstacle);
          if (broken && !closingObstructionEmittedRef.current) {
            closingObstructionEmittedRef.current = true;
            dispatch('o', 'sensor');
          }
        }

        // --- C. Person 1 Autowalk ---
        if (isWalking) {
          const speed = 110; // px/sec
          const stepDY = walkDirection === 'in' ? -speed * dt : speed * dt;
          const targetY = personPos.y + stepDY;

          const resolved = resolveMove(personPos, { x: 320, y: targetY }, nextP);

          // Check if waiting at doorway
          if (walkDirection === 'in') {
            if (personPos.y > 237 && resolved.y >= 237 && targetY < 237) {
              setIsP1Waiting(true);
            } else {
              setIsP1Waiting(false);
            }
            if (resolved.y <= 40) {
              setIsWalking(false);
              setWalkDirection('out');
              setIsP1Waiting(false);
            }
          } else {
            if (personPos.y < 193 && resolved.y <= 193 && targetY > 193) {
              setIsP1Waiting(true);
            } else {
              setIsP1Waiting(false);
            }
            if (resolved.y >= 410) {
              setIsWalking(false);
              setWalkDirection('in');
              setIsP1Waiting(false);
            }
          }
          setPersonPos({ x: resolved.x, y: resolved.y });
        }

        // --- D. Person 2 Autowalk ---
        if (isP2Walking) {
          const speed = 110;
          const stepDY = walk2Direction === 'in' ? -speed * dt : speed * dt;
          const targetY = person2Pos.y + stepDY;

          const resolved = resolveMove(person2Pos, { x: 320, y: targetY }, nextP);

          if (walk2Direction === 'in') {
            if (person2Pos.y > 237 && resolved.y >= 237 && targetY < 237) {
              setIsP2Waiting(true);
            } else {
              setIsP2Waiting(false);
            }
            if (resolved.y <= 40) {
              setIsP2Walking(false);
              setWalk2Direction('out');
              setIsP2Waiting(false);
            }
          } else {
            if (person2Pos.y < 193 && resolved.y <= 193 && targetY > 193) {
              setIsP2Waiting(true);
            } else {
              setIsP2Waiting(false);
            }
            if (resolved.y >= 410) {
              setIsP2Walking(false);
              setWalk2Direction('in');
              setIsP2Waiting(false);
            }
          }
          setPerson2Pos({ x: resolved.x, y: resolved.y });
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isWalking, walkDirection, isP2Walking, walk2Direction, personPos, person2Pos, secondPerson, obstacle, isBeamBroken, dispatch]);

  // Guided Demos Handler
  const startDemo = useCallback((demoKey) => {
    reset();
    setActiveDemo(demoKey);
    setMode('live');

    if (demoKey === 'demo1') {
      setDemoCaption('Demo 1: Person approaches front pad (f). Door opens, holds, and closes.');
      setIsWalking(true);
      setWalkDirection('in');
    } else if (demoKey === 'demo2') {
      setDemoCaption('Demo 2: Door starts closing. Obstacle placed in doorway (o) triggers safety reopen.');
      setObstacle(true);
      setPersonPos({ x: 320, y: 410 });
      setIsWalking(true);
      setWalkDirection('in');
    } else if (demoKey === 'demo3') {
      setDemoCaption('Demo 3: Key switch turned (k) to lock door. Fire alarm (x) overrides lock to FORCE_OPEN.');
      dispatch('k', 'user');
      setTimeout(() => {
        setDemoCaption('Demo 3: Triggering emergency fire alarm (x)...');
        dispatch('x', 'user');
        setTimeout(() => {
          setDemoCaption('Demo 3: Clearing emergency alarm (c) restores door operation.');
          dispatch('c', 'user');
        }, 3000);
      }, 2500);
    }
  }, [reset, dispatch]);

  return {
    state,
    prevTransition,
    log,
    p,
    holdTime,
    setHoldTime,
    mode,
    setMode,
    activeTab,
    setActiveTab,
    pace,
    setPace,
    isPaused,
    setIsPaused,
    stepMode,
    setStepMode,
    eventQueue,
    processNextEvent,
    activeStepAnimation,
    traversedTrail,
    isExpanded,
    setIsExpanded,
    personPos,
    setPersonPos,
    person2Pos,
    setPerson2Pos,
    secondPerson,
    setSecondPerson,
    obstacle,
    setObstacle,
    isWalking,
    setIsWalking,
    walkDirection,
    setWalkDirection,
    isP1Waiting,
    isP2Walking,
    setIsP2Walking,
    walk2Direction,
    setWalk2Direction,
    isP2Waiting,
    activeDemo,
    demoCaption,
    dynamicCaption,
    startDemo,
    dispatch,
    reset
  };
}
