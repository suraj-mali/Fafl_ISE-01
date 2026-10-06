import React, { useState } from 'react';
import { spec } from '../dfa/spec.js';

export function ControllerCard({ currentState, prevTransition, log }) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [logExpanded, setLogExpanded] = useState(true);

  const mooreOutputs = spec.moore[currentState] || {};
  const stateMeaning = spec.stateMeaning[currentState] || '';

  // Calculate non-self-loop next transitions
  const currentDelta = spec.delta[currentState] || {};
  const nextTransitions = Object.entries(currentDelta)
    .filter(([sym, next]) => next !== currentState)
    .slice(0, 4); // max 4 rows

  // Export CSV
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
    <div className="card" style={{ gap: '16px' }}>
      {/* 1. Large Badge & Plain English */}
      <div>
        <span className={`state-badge state-${currentState}`}>
          {currentState}
        </span>
        <p style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
          {stateMeaning}
        </p>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-card)' }} />

      {/* 2. Last Step Line */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Last Step
        </span>
        {prevTransition ? (
          <div key={prevTransition.stepNum} className="fade-in" style={{ marginTop: '4px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: '700', color: 'var(--accent-teal)' }}>
              {prevTransition.from} —{prevTransition.sym}→ {prevTransition.to}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Symbol {prevTransition.sym}: {spec.symbolMeaning[prevTransition.sym]} ({prevTransition.source})
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
            No steps executed yet. System is initialized at CLOSED.
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-card)' }} />

      {/* 3. Moore Outputs */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Outputs (Moore Machine)
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          <div style={{ background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: '600', color: '#334155' }}>
            Motor: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-teal)' }}>{mooreOutputs.motor}</span>
          </div>
          <div style={{ background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: '600', color: '#334155' }}>
            Bolt: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-teal)' }}>{mooreOutputs.bolt}</span>
          </div>
          <div style={{ background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: '600', color: '#334155' }}>
            Lamp: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-teal)' }}>{mooreOutputs.lamp}</span>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-card)' }} />

      {/* 4. What can happen next */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          What can happen next
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
          {nextTransitions.length > 0 ? (
            nextTransitions.map(([sym, next]) => (
              <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', background: '#FAFAFA', padding: '4px 8px', borderRadius: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-main)' }}>
                  {sym} → <span className={`state-badge state-${next}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{next}</span>
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {spec.symbolMeaning[sym]}
                </span>
              </div>
            ))
          ) : (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No state transitions from here.</span>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-card)' }} />

      {/* 5. Collapsible Event Log */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setLogExpanded(!logExpanded)}
            style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {logExpanded ? '▼' : '▶'} Event Log ({log.length})
          </button>

          <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
            {log.length > 5 && (
              <button onClick={() => setShowLogModal(true)} style={{ color: 'var(--accent-teal)', fontWeight: '600' }}>
                Show all
              </button>
            )}
            {log.length > 0 && (
              <button onClick={downloadCSV} style={{ color: 'var(--accent-teal)', fontWeight: '600' }}>
                Download CSV
              </button>
            )}
          </div>
        </div>

        {logExpanded && (
          <div className="log-container" style={{ marginTop: '8px' }}>
            {log.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                No events recorded yet.
              </div>
            ) : (
              log.slice(0, 5).map((item) => (
                <div key={item.stepNum} className="log-item">
                  <span style={{ width: '24px', color: 'var(--text-muted)' }}>#{item.stepNum}</span>
                  <span className={`state-badge state-${item.from}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{item.from}</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-teal)' }}>—{item.sym}→</span>
                  <span className={`state-badge state-${item.to}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{item.to}</span>
                  <span className="log-source-tag" style={{ marginLeft: 'auto' }}>{item.source}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Full Log Modal */}
      {showLogModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Complete Event Log ({log.length} steps)</h3>
              <button onClick={() => setShowLogModal(false)} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>✕</button>
            </div>
            <div className="log-container" style={{ maxHeight: '400px' }}>
              {log.map((item) => (
                <div key={item.stepNum} className="log-item">
                  <span style={{ width: '30px', color: 'var(--text-muted)' }}>#{item.stepNum}</span>
                  <span className={`state-badge state-${item.from}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{item.from}</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-teal)' }}>—{item.sym}→</span>
                  <span className={`state-badge state-${item.to}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{item.to}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({spec.symbolMeaning[item.sym]})</span>
                  <span className="log-source-tag" style={{ marginLeft: 'auto' }}>{item.source}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn-secondary" onClick={downloadCSV}>Download CSV</button>
              <button className="btn-primary" onClick={() => setShowLogModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
