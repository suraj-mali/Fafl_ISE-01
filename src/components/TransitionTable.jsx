import React, { useState } from 'react';
import { spec } from '../dfa/spec.js';

export function TransitionTable({ currentState }) {
  const [open, setOpen] = useState(false);

  const shortCodes = {
    CLOSED: 'CL',
    OPENING: 'OPG',
    OPEN_OCC: 'OCC',
    OPEN_WAIT: 'WAIT',
    CLOSING: 'CLG',
    LOCKED: 'LCK',
    EMERGENCY: 'EMG'
  };

  return (
    <div className="card" style={{ padding: '16px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontSize: '0.9375rem',
          fontWeight: '700',
          color: 'var(--text-main)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <span>{open ? '▼' : '▶'} Collapsible Transition Table δ(Q, Σ)</span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>7 × 10 Grid</span>
      </button>

      {open && (
        <div className="fade-in" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)' }}>State Q \ Σ</th>
                  {spec.Sigma.map(sym => (
                    <th key={sym} style={{ padding: '8px', textAlign: 'center', color: 'var(--accent-teal)' }}>
                      {sym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spec.Q.map(q => {
                  const isActiveRow = q === currentState;
                  return (
                    <tr
                      key={q}
                      style={{
                        borderBottom: '1px solid #E2E8F0',
                        background: isActiveRow ? 'var(--accent-teal-bg)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '8px 12px', fontWeight: '700' }}>
                        <span className={`state-badge state-${q}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                          {q}
                        </span>
                      </td>
                      {spec.Sigma.map(sym => {
                        const target = spec.delta[q][sym];
                        const isSelfLoop = target === q;
                        return (
                          <td
                            key={sym}
                            style={{
                              padding: '8px',
                              textAlign: 'center',
                              fontWeight: isSelfLoop ? 'normal' : 'bold'
                            }}
                          >
                            <span className={`state-badge state-${target}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                              {shortCodes[target] || target}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>
            Formal Definition: <strong>M = (Q, Σ, δ, q₀, F)</strong> where |Q| = 7, |Σ| = 10, q₀ = CLOSED, F = &#123;CLOSED, LOCKED&#125;.
          </div>
        </div>
      )}
    </div>
  );
}
