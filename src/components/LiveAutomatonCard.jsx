import React, { useEffect } from 'react';
import { spec } from '../dfa/spec.js';
import { CompactDiagramSvg } from './CompactDiagramSvg';

export function LiveAutomatonCard({ controller }) {
  const {
    state,
    prevTransition,
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
    setIsExpanded
  } = controller;

  // ESC key listener to close expanded modal overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, setIsExpanded]);

  const shortCodes = {
    CLOSED: 'CL',
    OPENING: 'OPG',
    OPEN_OCC: 'OCC',
    OPEN_WAIT: 'WAIT',
    CLOSING: 'CLG',
    LOCKED: 'LCK',
    EMERGENCY: 'EMG'
  };

  const mooreOutputs = spec.moore[state] || {};

  // Render causality bar content
  const renderCausalityBar = () => {
    if (!prevTransition) {
      return (
        <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 10px', fontSize: '0.875rem' }}>
          Waiting for the first event...
        </div>
      );
    }

    const { from, sym, to, source, isIgnored } = prevTransition;
    const symDesc = spec.symbolMeaning[sym] || sym;

    return (
      <div className="causality-bar fade-in" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
        {/* EVENT Chip */}
        <div style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
          {sym} <span style={{ fontWeight: 'normal', fontSize: '0.75rem' }}>({symDesc} · {source})</span>
        </div>

        <span style={{ color: 'var(--text-muted)' }}>→</span>

        {/* FORMULA Chip */}
        <div style={{ background: isIgnored ? '#FEF2F2' : '#F0FDFA', color: isIgnored ? '#991B1B' : '#0F766E', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', border: `1px solid ${isIgnored ? '#FCA5A5' : '#CCFBF1'}` }}>
          δ({from}, {sym}) = {to} {isIgnored ? '(ignored)' : ''}
        </div>

        <span style={{ color: 'var(--text-muted)' }}>→</span>

        {/* OUTPUT Chip */}
        <div style={{ background: '#F1F5F9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
          Motor: {mooreOutputs.motor} · Bolt: {mooreOutputs.bolt}
        </div>
      </div>
    );
  };

  // Card Core Content
  const renderCardContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 1. Control Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>Live automaton</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Pace Selector */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '6px' }}>
            {['slow', 'normal', 'fast'].map(p => (
              <button
                key={p}
                className={`btn-secondary ${pace === p ? 'active' : ''}`}
                onClick={() => setPace(p)}
                style={{ padding: '3px 8px', fontSize: '0.75rem', textTransform: 'capitalize' }}
                title={`Pace: ${p}`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Pause / Resume */}
          <button
            className="btn-secondary"
            onClick={() => setIsPaused(!isPaused)}
            style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
            title={isPaused ? 'Resume simulation' : 'Pause simulation'}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>

          {/* Step Mode Toggle */}
          <button
            className={`btn-secondary ${stepMode ? 'active' : ''}`}
            onClick={() => setStepMode(!stepMode)}
            style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
            title="Step mode: manual single-step execution"
          >
            Step mode
          </button>

          {/* Step Button when Step Mode is ON */}
          {stepMode && (
            <button
              className="btn-primary"
              onClick={processNextEvent}
              disabled={eventQueue.length === 0}
              style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
            >
              Next step ➔
            </button>
          )}

          {/* Expand Modal Button */}
          <button
            className="btn-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ padding: '4px 8px', fontSize: '0.875rem' }}
            title="Expand automaton view overlay"
          >
            ⤢
          </button>
        </div>
      </div>

      {/* Step Mode Pending Badge */}
      {stepMode && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#B45309', fontFamily: 'var(--font-mono)' }}>
          {eventQueue.length > 0 ? (
            <span>
              Next: <strong>{eventQueue[0].symbol}</strong> ({spec.symbolMeaning[eventQueue[0].symbol]})
              {eventQueue.length > 1 && ` · then: ${eventQueue.slice(1).map(e => e.symbol).join(', ')}`}
            </span>
          ) : (
            <span>No pending events in queue.</span>
          )}
        </div>
      )}

      {/* 2. Causality Bar */}
      {renderCausalityBar()}

      {/* 3. Compact Diagram SVG */}
      <CompactDiagramSvg
        currentState={state}
        activeStepAnimation={activeStepAnimation}
        traversedTrail={traversedTrail}
      />

      {/* 4. δ Lookup Strip */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
          δ Transition Lookup Strip ({state})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px' }}>
          {spec.Sigma.map(sym => {
            const target = spec.delta[state][sym];
            const changes = target !== state;
            const isLastSym = prevTransition && prevTransition.sym === sym;

            return (
              <div
                key={sym}
                style={{
                  padding: '4px 2px',
                  textAlign: 'center',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  background: changes ? `var(--state-${target}-bg, #E2E8F0)` : '#F8FAFC',
                  color: changes ? `var(--state-${target}-text, #1E293B)` : '#64748B',
                  fontWeight: changes ? 'bold' : 'normal',
                  border: isLastSym ? '2px solid #0F766E' : '1px solid #E2E8F0'
                }}
                title={`${sym}: ${spec.symbolMeaning[sym]} → ${target}`}
              >
                <div style={{ fontSize: '0.65rem', color: '#475569' }}>{sym}</div>
                <div>{shortCodes[target]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="card" style={{ padding: '14px', gap: '10px' }}>
        {renderCardContent()}
      </div>

      {/* Expand Overlay Modal */}
      {isExpanded && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '24px'
          }}
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Live Automaton (Expanded Overlay)</h3>
              <button onClick={() => setIsExpanded(false)} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>✕</button>
            </div>
            {renderCardContent()}
          </div>
        </div>
      )}
    </>
  );
}
