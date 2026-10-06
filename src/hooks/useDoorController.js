import { useState, useEffect, useRef, useCallback } from 'react';
import { spec } from '../dfa/spec.js';
import { step } from '../dfa/engine.js';

export function useDoorController() {
  const [state, setState] = useState('CLOSED');
  const [prevTransition, setPrevTransition] = useState(null);
  const [log, setLog] = useState([]);
  const [p, setP] = useState(0); // 0 = closed, 1 = open
  const [holdTime, setHoldTime] = useState(3); // 1 - 8 seconds
  const [mode, setMode] = useState('live'); // 'live' | 'manual'
  const [activeTab, setActiveTab] = useState('simulator');

  // Interactive Scene state
  const [personPos, setPersonPos] = useState({ x: 320, y: 410 }); // Person 1 (outside)
  const [person2Pos, setPerson2Pos] = useState({ x: 320, y: 40 }); // Person 2 (inside)
  const [secondPerson, setSecondPerson] = useState(false);
  const [obstacle, setObstacle] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [walkDirection, setWalkDirection] = useState('in'); // 'in' or 'out'

  // Demos state
  const [activeDemo, setActiveDemo] = useState(null);
  const [demoCaption, setDemoCaption] = useState('');

  // Sensors & Timers refs to prevent stale closures inside animation loops
  const stateRef = useRef(state);
  stateRef.current = state;

  const pRef = useRef(p);
  pRef.current = p;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const logRef = useRef(log);
  logRef.current = log;

  const lastPadSymbolRef = useRef('n');
  const timerCountdownRef = useRef(null);
  const closingObstructionEmittedRef = useRef(false);
  const limitReachedEmittedRef = useRef({ open: false, close: false });

  // Core Dispatch function — The ONLY way to mutate state
  const dispatch = useCallback((symbol, source = 'user') => {
    const currentState = stateRef.current;
    let nextState;
    try {
      nextState = step(currentState, symbol);
    } catch (err) {
      console.error(`Invalid DFA step: (${currentState}, ${symbol})`, err);
      return currentState;
    }

    const newStep = {
      stepNum: logRef.current.length + 1,
      from: currentState,
      sym: symbol,
      to: nextState,
      source,
      timestamp: new Date().toLocaleTimeString()
    };

    setState(nextState);
    setPrevTransition(newStep);
    setLog(prev => [newStep, ...prev]);

    // Reset single-event flags when entering state
    if (nextState !== currentState) {
      if (nextState === 'CLOSING') {
        closingObstructionEmittedRef.current = false;
      }
      if (nextState === 'OPENING') {
        limitReachedEmittedRef.current.open = false;
      }
      if (nextState === 'CLOSING') {
        limitReachedEmittedRef.current.close = false;
      }
    }

    return nextState;
  }, []);

  // Reset entire controller to initial state
  const reset = useCallback(() => {
    setState('CLOSED');
    setPrevTransition(null);
    setLog([]);
    setP(0);
    setPersonPos({ x: 320, y: 410 });
    setPerson2Pos({ x: 320, y: 40 });
    setSecondPerson(false);
    setObstacle(false);
    setIsWalking(false);
    setWalkDirection('in');
    setActiveDemo(null);
    setDemoCaption('');
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

    const front1 = isFront(p1);
    const rear1 = isRear(p1);
    const front2 = p2Active && isFront(p2);
    const rear2 = p2Active && isRear(p2);

    const fOcc = front1 || front2;
    const rOcc = rear1 || rear2;

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
    if (mode !== 'live') return;
    const currentPadSym = getPadSymbol(personPos, person2Pos, secondPerson);
    if (currentPadSym !== lastPadSymbolRef.current) {
      lastPadSymbolRef.current = currentPadSym;
      dispatch(currentPadSym, 'sensor');
    }
  }, [personPos, person2Pos, secondPerson, mode, getPadSymbol, dispatch]);

  // 2. Timer 't' Logic when in OPEN_WAIT
  useEffect(() => {
    if (state === 'OPEN_WAIT' && mode === 'live') {
      if (timerCountdownRef.current) clearTimeout(timerCountdownRef.current);
      timerCountdownRef.current = setTimeout(() => {
        if (stateRef.current === 'OPEN_WAIT' && modeRef.current === 'live') {
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
  }, [state, mode, holdTime, dispatch]);

  // 3. Main Animation Loop: Motor drive, Person walk, Beam obstruction
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // in seconds
      lastTime = currentTime;

      const currentState = stateRef.current;
      const currentP = pRef.current;
      const motor = spec.moore[currentState].motor;

      // --- A. Motor physics & Limit switch ---
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
        nextP = Math.max(0, currentP - dt / 1.2);
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

      // --- C. Auto Walk Animation ---
      if (isWalking) {
        const speed = 110; // px/sec
        if (walkDirection === 'in') {
          // Walk from y = 410 to y = 40 along x = 320
          let newY = personPos.y - speed * dt;
          // Pause at doorway (y ≈ 262) if door is not at least 95% open
          if (personPos.y > 262 && newY <= 262 && nextP < 0.95) {
            newY = 262; // wait before doorway
          } else if (newY <= 40) {
            newY = 40;
            setIsWalking(false);
            setWalkDirection('out');
          }
          setPersonPos({ x: 320, y: newY });
        } else {
          // Walk from y = 40 to y = 410 along x = 320
          let newY = personPos.y + speed * dt;
          // Pause at doorway (y ≈ 180) if door is not at least 95% open
          if (personPos.y < 180 && newY >= 180 && nextP < 0.95) {
            newY = 180; // wait before doorway
          } else if (newY >= 410) {
            newY = 410;
            setIsWalking(false);
            setWalkDirection('in');
          }
          setPersonPos({ x: 320, y: newY });
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isWalking, walkDirection, personPos, person2Pos, secondPerson, obstacle, isBeamBroken, dispatch]);

  // Guided Demos Handler
  const startDemo = useCallback((demoKey) => {
    reset();
    setActiveDemo(demoKey);
    setMode('live');

    if (demoKey === 'demo1') {
      setDemoCaption('Demo 1: Person approaches front pad (f). Door starts opening.');
      setIsWalking(true);
      setWalkDirection('in');
    } else if (demoKey === 'demo2') {
      setDemoCaption('Demo 2: Door starts closing. Obstacle placed in doorway (o) triggers safety reopen.');
      setObstacle(true);
      setPersonPos({ x: 320, y: 410 });
      // Walk in then stop inside
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
    activeDemo,
    demoCaption,
    startDemo,
    dispatch,
    reset
  };
}
