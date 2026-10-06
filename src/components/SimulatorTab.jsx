import React from 'react';
import { SceneSvg } from './SceneSvg';
import { LiveAutomatonCard } from './LiveAutomatonCard';
import { SymbolKeypad } from './SymbolKeypad';
import { StateStrip } from './StateStrip';
import { spec } from '../dfa/spec.js';

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
    isP1Waiting,
    isP2Waiting,
    activeDemo,
    demoCaption,
    dynamicCaption,
    startDemo,
    dispatch
  } = controller;

  const mooreOutputs = spec.moore[state] || {};
  const currentDelta = spec.delta[state] || {};
  const nextTransitions = Object.entries(currentDelta)
    .filter(([sym, next]) => next !== state)
    .slice(0, 4);

  const downloadCSV = () => {
    const csvRows = ['Step,From,Symbol,Symbol Meaning,To,Source,Time'];
    log.forEach(item => {
      csvRows.push(`${item.stepNum},${item.from},${item.sym},"${spec.symbolMeaning[item.sym] || ''}",${item.to},${item.source},${item.timestamp}`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'door_dfa_event_log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="simulator-tab" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* TOP ROW: Scene Card (Left) & Live Automaton Card (Right) */}
      <div className="simulator-top-row">
        {/* Left Column: Scene Card & Controls */}
        <div className="card" style={{ padding: '14px', gap: '10px' }}>
          {/* Top Bar: Mode Switch & Guided Demos */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>Mode:</span>
              <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '6px' }}>
                <button
                  className={`btn-secondary ${mode === 'live' ? 'active' : ''}`}
                  onClick={() => setMode('live')}
                  style={{ padding: '3px 8px', fontSize: '0.8125rem' }}
                >
                  Live
                </button>
                <button
                  className={`btn-secondary ${mode === 'manual' ? 'active' : ''}`}
                  onClick={() => setMode('manual')}
                  style={{ padding: '3px 8px', fontSize: '0.8125rem' }}
                >
                  Manual
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>Guided demos:</span>
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
                  background: '#FFFFFF'
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
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8125rem', color: '#1E40AF', fontWeight: '500' }}>
              ℹ️ {demoCaption}
            </div>
          )}

          {/* Scene SVG */}
          <SceneSvg
            p={p}
            state={state}
            personPos={personPos}
            setPersonPos={setPersonPos}
            person2Pos={person2Pos}
            setPerson2Pos={setPerson2Pos}
            secondPerson={secondPerson}
            obstacle={obstacle}
            dynamicCaption={dynamicCaption}
            isP1Waiting={isP1Waiting}
            isP2Waiting={isP2Waiting}
          />

          {/* Controls Row (Live Mode) */}
          {mode === 'live' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={() => setIsWalking(!isWalking)}
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
                  style={{ width: '90px', accentColor: 'var(--accent-teal)' }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-main)', minWidth: '24px' }}>
                  {holdTime}s
                </span>
              </div>
            </div>
          ) : (
            <SymbolKeypad currentState={state} onDispatch={dispatch} />
          )}
        </div>

        {/* Right Column: Live Automaton Card */}
        <LiveAutomatonCard controller={controller} />
      </div>

      {/* SECOND ROW: Controller Details (3 Compact Columns) */}
      <div className="card" style={{ padding: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Column 1: State Badge & Plain English */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Current State
            </span>
            <span className={`state-badge state-${state}`}>
              {state}
            </span>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '4px' }}>
              {spec.stateMeaning[state]}
            </p>
          </div>

          {/* Column 2: Outputs & Next Transitions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Moore Outputs
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>Motor: {mooreOutputs.motor}</span>
                <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>Bolt: {mooreOutputs.bolt}</span>
                <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>Lamp: {mooreOutputs.lamp}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                What can happen next
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', fontSize: '0.75rem' }}>
                {nextTransitions.map(([sym, next]) => (
                  <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', background: '#FAFAFA', padding: '2px 6px', borderRadius: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{sym} → {next}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{spec.symbolMeaning[sym]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Event Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Event Log ({log.length})
              </span>
              {log.length > 0 && (
                <button onClick={downloadCSV} style={{ color: 'var(--accent-teal)', fontSize: '0.75rem', fontWeight: '600' }}>
                  Download CSV
                </button>
              )}
            </div>

            <div className="log-container" style={{ maxHeight: '110px' }}>
              {log.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>
                  No events recorded.
                </div>
              ) : (
                log.slice(0, 4).map((item) => (
                  <div key={item.stepNum} className="log-item" style={{ fontSize: '0.75rem' }}>
                    <span>#{item.stepNum}</span>
                    <span className={`state-badge state-${item.from}`} style={{ fontSize: '0.6rem', padding: '1px 4px' }}>{item.from}</span>
                    <span>—{item.sym}→</span>
                    <span className={`state-badge state-${item.to}`} style={{ fontSize: '0.6rem', padding: '1px 4px' }}>{item.to}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thin State Strip */}
      <StateStrip currentState={state} />
    </div>
  );
}
