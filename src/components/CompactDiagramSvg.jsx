import React, { useState, useEffect } from 'react';
import { spec } from '../dfa/spec.js';

export function CompactDiagramSvg({
  currentState,
  activeStepAnimation,
  traversedTrail,
  showSelfLoops = false,
  selectedState,
  setSelectedState
}) {
  const [animatedTokenPos, setAnimatedTokenPos] = useState(null);

  // State coordinates in viewBox 0 0 760 440
  const coords = {
    CLOSED: { x: 95, y: 200 },
    LOCKED: { x: 95, y: 385 },
    OPENING: { x: 265, y: 70 },
    OPEN_OCC: { x: 490, y: 70 },
    OPEN_WAIT: { x: 490, y: 250 },
    CLOSING: { x: 265, y: 305 },
    EMERGENCY: { x: 675, y: 160 }
  };

  // SVG Non-self-loop edges
  const edges = [
    { from: 'CLOSED', to: 'OPENING', label: 'f', path: 'M 140 175 Q 185 110 220 85' },
    { from: 'OPENING', to: 'OPEN_OCC', label: 'e', path: 'M 330 70 L 425 70' },
    { from: 'OPEN_OCC', to: 'OPEN_WAIT', label: 'n', path: 'M 470 96 L 470 224' },
    { from: 'OPEN_WAIT', to: 'OPEN_OCC', label: 'f, r, b', path: 'M 510 224 L 510 96' },
    { from: 'OPEN_WAIT', to: 'CLOSING', label: 't', path: 'M 425 260 L 330 290' },
    { from: 'CLOSING', to: 'CLOSED', label: 'e', path: 'M 205 295 Q 150 265 125 226' },
    { from: 'CLOSING', to: 'OPENING', label: 'f, r, b, o', path: 'M 265 279 L 265 96' },
    { from: 'CLOSED', to: 'LOCKED', label: 'k', path: 'M 75 226 L 75 359' },
    { from: 'LOCKED', to: 'CLOSED', label: 'k', path: 'M 115 359 L 115 226' },
    { from: 'EMERGENCY', to: 'OPEN_OCC', label: 'c', path: 'M 625 140 Q 555 105 525 90' }
  ];

  // Self loops descriptions
  const selfLoops = {
    CLOSED: 'r, b, n, e, t, o, c',
    OPENING: 'f, r, b, n, t, o, k, c',
    OPEN_OCC: 'f, r, b, e, t, o, k, c',
    OPEN_WAIT: 'n, e, o, k, c',
    CLOSING: 'n, t, k, c',
    LOCKED: 'f, r, b, n, e, t, o, c',
    EMERGENCY: 'f, r, b, n, e, t, o, k, x'
  };

  const stateColors = {
    CLOSED: { bg: '#CBD5E1', text: '#0F172A', stroke: '#94A3B8' },
    OPENING: { bg: '#FDE68A', text: '#78350F', stroke: '#F59E0B' },
    OPEN_OCC: { bg: '#BFDBFE', text: '#1E3A8A', stroke: '#3B82F6' },
    OPEN_WAIT: { bg: '#A5F3FC', text: '#164E63', stroke: '#06B6D4' },
    CLOSING: { bg: '#FDBA74', text: '#7C2D12', stroke: '#F97316' },
    LOCKED: { bg: '#DDD6FE', text: '#4C1D95', stroke: '#8B5CF6' },
    EMERGENCY: { bg: '#FCA5A5', text: '#7F1D1D', stroke: '#EF4444' }
  };

  // B3 Step animation token travel along path
  useEffect(() => {
    if (!activeStepAnimation) {
      setAnimatedTokenPos(null);
      return;
    }

    const { step: stepData } = activeStepAnimation;
    const { from, to, isIgnored, sym } = stepData;

    if (isIgnored) {
      const pos = coords[from] || { x: 0, y: 0 };
      setAnimatedTokenPos({ x: pos.x, y: pos.y - 30, sym, isIgnored: true });
      return;
    }

    // Find edge path
    const edge = edges.find(e => e.from === from && e.to === to);
    const startPos = coords[from];
    const endPos = coords[to];

    if (!startPos || !endPos) return;

    let animId;
    const startTime = performance.now();
    const duration = 400; // ms

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      const currentX = startPos.x + (endPos.x - startPos.x) * progress;
      const currentY = startPos.y + (endPos.y - startPos.y) * progress;

      setAnimatedTokenPos({ x: currentX, y: currentY, sym, isIgnored: false });

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [activeStepAnimation]);

  return (
    <svg viewBox="0 0 760 440" style={{ width: '100%', height: 'auto', background: '#FFFFFF', borderRadius: '12px', display: 'block' }}>
      <defs>
        <marker id="compact-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
        <marker id="compact-arrow-active" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#0F766E" />
        </marker>
        <marker id="compact-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
        </marker>
      </defs>

      {/* Start Arrow to CLOSED */}
      <path d="M 15 200 L 30 200" stroke="#475569" strokeWidth="2.5" markerEnd="url(#compact-arrow)" />
      <text x="20" y="188" fill="#475569" fontSize="11" fontWeight="700">start</text>

      {/* Any state box & red arrow to EMERGENCY */}
      <rect x="615" y="335" width="120" height="40" rx="6" fill="#FAFAFA" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="675" y="359" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="600">any state</text>
      <path d="M 675 335 L 675 195" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#compact-arrow-red)" />
      <rect x="660" y="255" width="30" height="20" rx="4" fill="#FFFFFF" stroke="#EF4444" />
      <text x="675" y="269" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="bold">x</text>

      {/* Draw Edges with Opacity Trail */}
      {edges.map((edge, idx) => {
        // Calculate trail opacity (100%, 70%, 45%, 25%)
        const trailIndex = (traversedTrail || []).findIndex(t => t.from === edge.from && t.to === edge.to);
        let opacity = 0.35; // Default edge opacity
        let strokeColor = '#94A3B8';
        let strokeWidth = '2';

        if (trailIndex === 0) {
          opacity = 1.0;
          strokeColor = '#0F766E';
          strokeWidth = '3.5';
        } else if (trailIndex === 1) {
          opacity = 0.70;
          strokeColor = '#0F766E';
          strokeWidth = '2.5';
        } else if (trailIndex === 2) {
          opacity = 0.45;
          strokeColor = '#0F766E';
          strokeWidth = '2.5';
        } else if (trailIndex === 3) {
          opacity = 0.25;
          strokeColor = '#0F766E';
          strokeWidth = '2';
        }

        return (
          <g key={idx} style={{ opacity, transition: 'all 0.3s ease' }}>
            <path
              id={`compact-path-${idx}`}
              d={edge.path}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              markerEnd={trailIndex === 0 ? 'url(#compact-arrow-active)' : 'url(#compact-arrow)'}
            />
            <text fill={trailIndex === 0 ? '#0F766E' : '#334155'} fontSize="14" fontWeight="bold">
              <textPath href={`#compact-path-${idx}`} startOffset="50%" textAnchor="middle">
                {edge.label}
              </textPath>
            </text>
          </g>
        );
      })}

      {/* Self Loops Option */}
      {showSelfLoops && Object.entries(selfLoops).map(([q, label]) => {
        const c = coords[q];
        return (
          <g key={`loop-${q}`} transform={`translate(${c.x}, ${c.y})`}>
            <path d="M -25 -25 C -55 -65, 55 -65, 25 -25" fill="none" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#compact-arrow)" />
            <text x="0" y="-55" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600">{label}</text>
          </g>
        );
      })}

      {/* Draw State Nodes (130x52) */}
      {spec.Q.map((q) => {
        const c = coords[q];
        const colors = stateColors[q];
        const isActive = q === currentState;
        const isSelected = selectedState && q === selectedState;
        const isAccepting = spec.F.includes(q);

        return (
          <g
            key={q}
            transform={`translate(${c.x}, ${c.y}) scale(${isActive ? 1.06 : 1})`}
            onClick={() => setSelectedState && setSelectedState(q)}
            style={{ cursor: setSelectedState ? 'pointer' : 'default', transition: 'all 250ms ease-in-out' }}
          >
            {/* Active Teal Glow Ring */}
            {isActive && (
              <rect
                x="-71"
                y="-31"
                width="142"
                height="62"
                rx="31"
                fill="none"
                stroke="#0F766E"
                strokeWidth="4"
                opacity="0.9"
              />
            )}

            {/* Node Box */}
            <rect
              x="-65"
              y="-26"
              width="130"
              height="52"
              rx="26"
              fill={colors.bg}
              stroke={isSelected ? '#0F766E' : colors.stroke}
              strokeWidth={isSelected ? '3' : '2'}
              opacity={isActive ? 1 : 0.85}
            />

            {/* Accepting State Double Border */}
            {isAccepting && (
              <rect
                x="-59"
                y="-20"
                width="118"
                height="40"
                rx="20"
                fill="none"
                stroke={colors.stroke}
                strokeWidth="1.5"
              />
            )}

            <text
              x="0"
              y="5"
              textAnchor="middle"
              fill={colors.text}
              fontFamily="var(--font-mono)"
              fontSize="16"
              fontWeight="bold"
            >
              {q}
            </text>
          </g>
        );
      })}

      {/* B3 Animated Symbol Token */}
      {animatedTokenPos && (
        <g transform={`translate(${animatedTokenPos.x}, ${animatedTokenPos.y})`}>
          <circle cx="0" cy="0" r="14" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
          <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="var(--font-mono)">
            {animatedTokenPos.sym}
          </text>
          {animatedTokenPos.isIgnored && (
            <text x="0" y="-18" textAnchor="middle" fill="#DC2626" fontSize="10" fontWeight="bold">
              ignored
            </text>
          )}
        </g>
      )}
    </svg>
  );
}
