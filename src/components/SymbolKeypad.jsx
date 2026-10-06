import React from 'react';
import { spec } from '../dfa/spec.js';
import { step } from '../dfa/engine.js';

export function SymbolKeypad({ currentState, onDispatch }) {
  const sensorGroup = ['f', 'r', 'b', 'n'];
  const doorTimerGroup = ['e', 't', 'o'];
  const controlGroup = ['k', 'x', 'c'];

  const renderKey = (sym) => {
    let nextState;
    try {
      nextState = step(currentState, sym);
    } catch {
      nextState = currentState;
    }
    const changesState = nextState !== currentState;

    return (
      <button
        key={sym}
        className={`keypad-btn ${!changesState ? 'dimmed' : ''}`}
        onClick={() => onDispatch(sym, 'user')}
        title={`${sym}: ${spec.symbolMeaning[sym]} → transitions to ${nextState}`}
      >
        {sym}
        {changesState && <span className="active-dot" title="Changes state" />}
      </button>
    );
  };

  return (
    <div className="card" style={{ gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Manual Symbol Keypad
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Teal dot = changes state · Dimmed = self-loop
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        <div className="keypad-group">
          <span className="keypad-group-label">Sensors</span>
          <div className="keypad-buttons">{sensorGroup.map(renderKey)}</div>
        </div>

        <div className="keypad-group">
          <span className="keypad-group-label">Door & Timer</span>
          <div className="keypad-buttons">{doorTimerGroup.map(renderKey)}</div>
        </div>

        <div className="keypad-group">
          <span className="keypad-group-label">Control</span>
          <div className="keypad-buttons">{controlGroup.map(renderKey)}</div>
        </div>
      </div>
    </div>
  );
}
