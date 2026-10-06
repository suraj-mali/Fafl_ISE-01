import React, { useState, useEffect, useRef } from 'react';
import { spec } from '../dfa/spec.js';
import { run, occupancy, step } from '../dfa/engine.js';

export function TryStringTab() {
  const [inputStr, setInputStr] = useState('febntoenterkfxfcnte');
  const [invalidCharHint, setInvalidCharHint] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0 = not started
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  const presets = [
    { label: 'Normal visit', value: 'fente' },
    { label: 'Obstruction', value: 'fentoente' },
    { label: 'Lock the door', value: 'k' },
    { label: 'Fire alarm and recovery', value: 'xcnte' },
    { label: 'A day at the shop', value: 'febntoenterkfxfcnte' }
  ];

  // Clean input string (only valid symbols)
  const cleanSymbols = inputStr.replace(/\s+/g, '').split('');
  const fullResult = run(inputStr);
  const currentTrace = fullResult.trace.slice(0, currentStepIndex);
  const isFinished = currentStepIndex === fullResult.trace.length && fullResult.trace.length > 0;
  const finalState = currentStepIndex > 0 ? fullResult.trace[currentStepIndex - 1].to : 'CLOSED';
  const isAccepted = spec.F.includes(finalState);

  // Compute occupancy chart data for current trace
  const occCounts = occupancy(currentTrace);

  // Validate input
  const handleInputChange = (val) => {
    setInputStr(val);
    setCurrentStepIndex(0);
    setIsPlaying(false);

    const invalid = [...val.replace(/\s+/g, '')].filter(ch => !spec.Sigma.includes(ch));
    if (invalid.length > 0) {
      setInvalidCharHint(`Invalid character(s): '${invalid.join(', ')}'. Valid symbols are f, r, b, n, e, t, o, k, x, c.`);
    } else {
      setInvalidCharHint('');
    }
  };

  const handleRunAll = () => {
    setIsPlaying(false);
    setCurrentStepIndex(fullResult.trace.length);
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < fullResult.trace.length) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStepIndex >= fullResult.trace.length) {
        setCurrentStepIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleClear = () => {
    setInputStr('');
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setInvalidCharHint('');
  };

  // Play animation timer (600ms per step)
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= fullResult.trace.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, fullResult.trace.length]);

  // CSV Export for trace
  const downloadTraceCSV = () => {
    const rows = ['Step,From,Symbol,Symbol Meaning,To'];
    currentTrace.forEach(t => {
      rows.push(`${t.i},${t.from},${t.sym},"${spec.symbolMeaning[t.sym] || ''}",${t.to}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dfa_trace_${inputStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // State bar chart colors
  const stateColors = {
    CLOSED: '#CBD5E1',
    OPENING: '#FDE68A',
    OPEN_OCC: '#BFDBFE',
    OPEN_WAIT: '#A5F3FC',
    CLOSING: '#FDBA74',
    LOCKED: '#DDD6FE',
    EMERGENCY: '#FCA5A5'
  };

  const maxOcc = Math.max(1, ...Object.values(occCounts));

  return (
    <div className="try-string-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Input Card */}
      <div className="card" style={{ gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Try an Input String</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Presets:</span>
            <select
              onChange={(e) => {
                if (e.target.value) handleInputChange(e.target.value);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-card)',
                fontSize: '0.8125rem',
                background: '#FFFFFF'
              }}
            >
              <option value="">Select a preset string...</option>
              {presets.map(p => (
                <option key={p.value} value={p.value}>{p.label} (`{p.value}`)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Monospace Input */}
        <div>
          <input
            type="text"
            value={inputStr}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type symbols e.g. fente"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: invalidCharHint ? '2px solid #EF4444' : '1px solid var(--border-card)',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.1rem',
              fontWeight: '600',
              letterSpacing: '0.1em'
            }}
          />
          {invalidCharHint && (
            <p style={{ color: '#DC2626', fontSize: '0.8125rem', marginTop: '6px', fontWeight: '500' }}>
              ⚠️ {invalidCharHint}
            </p>
          )}
        </div>

        {/* Symbol Chips to Append */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Append Symbol:
          </span>
          {spec.Sigma.map(sym => (
            <button
              key={sym}
              onClick={() => handleInputChange(inputStr + sym)}
              className="keypad-btn"
              style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
              title={`${sym}: ${spec.symbolMeaning[sym]}`}
            >
              +{sym}
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button className="btn-primary" onClick={handleRunAll}>
            ▶ Run All ({fullResult.trace.length} steps)
          </button>
          <button className="btn-secondary" onClick={handleStepNext} disabled={currentStepIndex >= fullResult.trace.length}>
            ➔ Step ({currentStepIndex}/{fullResult.trace.length})
          </button>
          <button className="btn-secondary" onClick={handlePlayToggle}>
            {isPlaying ? '⏸ Pause' : '▶ Play (600ms)'}
          </button>
          <button className="btn-secondary" onClick={handleClear}>
            🗑 Clear
          </button>
        </div>
      </div>

      {/* Trace Execution Table & Verdict */}
      <div className="card" style={{ gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Execution Trace</h4>
          {currentTrace.length > 0 && (
            <button className="btn-secondary" onClick={downloadTraceCSV} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              Download Trace CSV
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Step #</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>From State</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Symbol</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>To State</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>What Happened</th>
              </tr>
            </thead>
            <tbody>
              {currentTrace.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Click "Run All", "Step", or "Play" to execute the DFA on the string.
                  </td>
                </tr>
              ) : (
                currentTrace.map((row, idx) => {
                  const isCurrent = idx === currentStepIndex - 1;
                  return (
                    <tr
                      key={row.i}
                      style={{
                        borderBottom: '1px solid #E2E8F0',
                        background: isCurrent ? 'var(--accent-teal-bg)' : 'transparent',
                        fontWeight: isCurrent ? 'bold' : 'normal'
                      }}
                    >
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>#{row.i}</td>
                      <td style={{ padding: '10px' }}>
                        <span className={`state-badge state-${row.from}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                          {row.from}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-teal)' }}>
                        {row.sym}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span className={`state-badge state-${row.to}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                          {row.to}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {spec.symbolMeaning[row.sym]}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Final Verdict Badge */}
        {isFinished && (
          <div
            className="fade-in"
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: isAccepted ? '#ECFDF5' : '#FEF3C7',
              border: `1.5px solid ${isAccepted ? '#10B981' : '#F59E0B'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: '800',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: isAccepted ? '#10B981' : '#F59E0B',
                  color: '#FFFFFF'
                }}
              >
                {isAccepted ? '✓ ACCEPTED' : '⚠️ REJECTED'}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Final State: <span className={`state-badge state-${finalState}`}>{finalState}</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Accepted means the door ends fully closed (CLOSED or LOCKED).
            </p>
          </div>
        )}
      </div>

      {/* SVG Bar Chart: State Occupancy */}
      <div className="card" style={{ gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>State Occupancy (Symbols Read in Each State)</h4>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Total steps: {currentTrace.length}
          </span>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox="0 0 700 200" style={{ width: '100%', height: 'auto', background: '#FFFFFF' }}>
            {spec.Q.map((q, idx) => {
              const count = occCounts[q] || 0;
              const barHeight = (count / maxOcc) * 120;
              const x = 50 + idx * 90;
              const y = 150 - barHeight;

              return (
                <g key={q}>
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width="50"
                    height={barHeight}
                    rx="4"
                    fill={stateColors[q]}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  {/* Count Value on top */}
                  <text x={x + 25} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">
                    {count}
                  </text>
                  {/* State Name below */}
                  <text x={x + 25} y="170" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748B" fontFamily="var(--font-mono)">
                    {q}
                  </text>
                </g>
              );
            })}
            {/* Baseline */}
            <line x1="30" y1="150" x2="670" y2="150" stroke="#CBD5E1" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
