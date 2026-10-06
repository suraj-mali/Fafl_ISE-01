import React from 'react';
import { SceneSvg } from './SceneSvg';
import { ControllerCard } from './ControllerCard';
import { SymbolKeypad } from './SymbolKeypad';
import { StateStrip } from './StateStrip';

export function SimulatorTab({ controller }) {
  const {
    state,
    prevTransition,
    log,
    p,
    holdTime,
    setHoldTime,
    mode,
    setMode,
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
    activeDemo,
    demoCaption,
    startDemo,
    dispatch
  } = controller;

  const handleWalkToggle = () => {
    setIsWalking(!isWalking);
  };

  return (
    <div className="simulator-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="simulator-grid">
        {/* Left Column: Scene Card & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px', gap: '12px' }}>
            {/* Top Bar above Scene: Mode Switch & Guided Demos */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>Mode:</span>
                <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '6px' }}>
                  <button
                    className={`btn-secondary ${mode === 'live' ? 'active' : ''}`}
                    onClick={() => setMode('live')}
                    style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
                  >
                    Live
                  </button>
                  <button
                    className={`btn-secondary ${mode === 'manual' ? 'active' : ''}`}
                    onClick={() => setMode('manual')}
                    style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
                  >
                    Manual
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Guided demos:</span>
                <select
                  value={activeDemo || ''}
                  onChange={(e) => {
                    if (e.target.value) startDemo(e.target.value);
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-card)',
                    fontSize: '0.8125rem',
                    background: '#FFFFFF',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="">Select a demo...</option>
                  <option value="demo1">1. Normal visit (walk through)</option>
                  <option value="demo2">2. Obstruction safety reopen</option>
                  <option value="demo3">3. Lock & Fire Alarm override</option>
                </select>
              </div>
            </div>

            {/* Guided Demo Caption Banner */}
            {demoCaption && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8125rem', color: '#1E40AF', fontWeight: '500' }}>
                ℹ️ {demoCaption}
              </div>
            )}

            {/* SVG Interactive Scene */}
            <SceneSvg
              p={p}
              state={state}
              personPos={personPos}
              setPersonPos={setPersonPos}
              person2Pos={person2Pos}
              setPerson2Pos={setPerson2Pos}
              secondPerson={secondPerson}
              obstacle={obstacle}
            />

            {/* Controls Row Below Scene (Live Mode) */}
            {mode === 'live' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <button
                    className="btn-primary"
                    onClick={handleWalkToggle}
                    title="Animate person walking through doorway"
                  >
                    {isWalking ? 'Pause walk' : walkDirection === 'in' ? 'Walk inside 🚶‍♂️' : 'Walk outside 🚶‍♂️'}
                  </button>

                  <button
                    className={`btn-secondary ${obstacle ? 'active' : ''}`}
                    onClick={() => setObstacle(!obstacle)}
                    title="Place or remove obstacle box in doorway"
                  >
                    {obstacle ? 'Remove obstacle 📦' : '+ Obstacle 📦'}
                  </button>

                  <button
                    className={`btn-secondary ${secondPerson ? 'active' : ''}`}
                    onClick={() => setSecondPerson(!secondPerson)}
                    title="Toggle second person inside"
                  >
                    {secondPerson ? 'Remove 2nd person 👤' : '+ 2nd person 👤'}
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => dispatch('k', 'user')}
                    title="Key switch turned (k): lock/unlock door when CLOSED"
                  >
                    🔑 Lock key
                  </button>

                  <button
                    className="btn-danger"
                    onClick={() => dispatch('x', 'user')}
                    title="Fire alarm (x): immediately forces door OPEN"
                  >
                    🚨 Fire alarm
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => dispatch('c', 'user')}
                    title="Reset alarm (c): clear emergency mode"
                  >
                    🧯 Reset alarm
                  </button>
                </div>

                {/* Slider for Hold Time */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  <label htmlFor="holdTimeSlider">Hold time:</label>
                  <input
                    id="holdTimeSlider"
                    type="range"
                    min="1"
                    max="8"
                    value={holdTime}
                    onChange={(e) => setHoldTime(Number(e.target.value))}
                    style={{ width: '100px', accentColor: 'var(--accent-teal)' }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-main)', minWidth: '24px' }}>
                    {holdTime}s
                  </span>
                </div>
              </div>
            ) : (
              /* Manual Mode Keypad */
              <SymbolKeypad currentState={state} onDispatch={dispatch} />
            )}
          </div>
        </div>

        {/* Right Column: Controller Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ControllerCard
            currentState={state}
            prevTransition={prevTransition}
            log={log}
          />
        </div>
      </div>

      {/* Bottom Thin State Strip */}
      <StateStrip currentState={state} />
    </div>
  );
}
