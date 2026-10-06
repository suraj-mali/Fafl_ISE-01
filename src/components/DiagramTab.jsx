import React, { useState } from 'react';
import { spec } from '../dfa/spec.js';
import { DiagramSvg } from './DiagramSvg';
import { TransitionTable } from './TransitionTable';

export function DiagramTab({ currentState, prevTransition }) {
  const [viewType, setViewType] = useState('full'); // 'full' | 'basic'
  const [showSelfLoops, setShowSelfLoops] = useState(false);
  const [selectedState, setSelectedState] = useState('CLOSED');

  // Compute δ transitions grouped by target state for selected state
  const targetGroups = {};
  if (viewType === 'full' && spec.delta[selectedState]) {
    Object.entries(spec.delta[selectedState]).forEach(([sym, target]) => {
      if (!targetGroups[target]) targetGroups[target] = [];
      targetGroups[target].push(sym);
    });
  }

  const selectedMoore = spec.moore[selectedState] || {};

  return (
    <div className="diagram-tab" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Control Bar */}
      <div className="card" style={{ padding: '16px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '700' }}>Diagram View:</span>
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '8px' }}>
            <button
              className={`btn-secondary ${viewType === 'basic' ? 'active' : ''}`}
              onClick={() => setViewType('basic')}
              style={{ padding: '6px 14px', fontSize: '0.875rem' }}
            >
              Basic (2 states)
            </button>
            <button
              className={`btn-secondary ${viewType === 'full' ? 'active' : ''}`}
              onClick={() => setViewType('full')}
              style={{ padding: '6px 14px', fontSize: '0.875rem' }}
            >
              Full (7 states)
            </button>
          </div>
        </div>

        {viewType === 'full' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: '500' }}>
              <input
                type="checkbox"
                checked={showSelfLoops}
                onChange={(e) => setShowSelfLoops(e.target.checked)}
                style={{ accentColor: 'var(--accent-teal)' }}
              />
              Show self-loops
            </label>

            <span style={{ background: 'var(--accent-teal-light)', color: 'var(--accent-teal)', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: '700' }}>
              ● Following live simulation
            </span>
          </div>
        )}
      </div>

      {/* Main Diagram Area with Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: viewType === 'full' ? '1fr 280px' : '1fr', gap: '20px' }}>
        <div className="card" style={{ padding: '16px', alignItems: 'center' }}>
          <DiagramSvg
            viewType={viewType}
            currentState={currentState}
            prevTransition={prevTransition}
            showSelfLoops={showSelfLoops}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
          />
          {viewType === 'basic' && (
            <p style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
              "The textbook door: simple, but it has no travel time, no obstruction handling and no lock. The full model fixes this."
            </p>
          )}
        </div>

        {/* Side Panel for State Inspection */}
        {viewType === 'full' && (
          <div className="card" style={{ padding: '16px', gap: '14px' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              State Inspector
            </h4>

            <div>
              <span className={`state-badge state-${selectedState}`}>
                {selectedState}
              </span>
              <p style={{ marginTop: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {spec.stateMeaning[selectedState]}
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-card)' }} />

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                δ Transitions from {selectedState}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                {Object.entries(targetGroups).map(([target, syms]) => (
                  <div key={target} style={{ fontSize: '0.8125rem', background: '#F8FAFC', padding: '6px 8px', borderRadius: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-teal)' }}>
                      {syms.join(', ')}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}> → </span>
                    <span style={{ fontWeight: '700' }}>{target === selectedState ? 'stay in ' + selectedState : target}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-card)' }} />

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Moore Outputs
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                <div>Motor: <strong>{selectedMoore.motor}</strong></div>
                <div>Bolt: <strong>{selectedMoore.bolt}</strong></div>
                <div>Lamp: <strong>{selectedMoore.lamp}</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Transition Table */}
      {viewType === 'full' && <TransitionTable currentState={currentState} />}
    </div>
  );
}
