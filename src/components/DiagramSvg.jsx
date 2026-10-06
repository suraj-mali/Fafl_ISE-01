import React from 'react';
import { spec, basic } from '../dfa/spec.js';

export function DiagramSvg({
  viewType, // 'full' | 'basic'
  currentState,
  prevTransition,
  showSelfLoops,
  selectedState,
  setSelectedState
}) {
  // Color palette for states
  const stateColors = {
    CLOSED: { bg: '#CBD5E1', text: '#1E293B', stroke: '#94A3B8' },
    OPENING: { bg: '#FDE68A', text: '#78350F', stroke: '#F59E0B' },
    OPEN_OCC: { bg: '#BFDBFE', text: '#1E3A8A', stroke: '#3B82F6' },
    OPEN_WAIT: { bg: '#A5F3FC', text: '#164E63', stroke: '#06B6D4' },
    CLOSING: { bg: '#FDBA74', text: '#7C2D12', stroke: '#F97316' },
    LOCKED: { bg: '#DDD6FE', text: '#4C1D95', stroke: '#8B5CF6' },
    EMERGENCY: { bg: '#FCA5A5', text: '#881337', stroke: '#EF4444' },

    // Basic 2-state fallback colors
    OPEN: { bg: '#BFDBFE', text: '#1E3A8A', stroke: '#3B82F6' }
  };

  // State coordinates in viewBox 0 0 960 520
  const coords = {
    CLOSED: { x: 110, y: 230 },
    LOCKED: { x: 110, y: 450 },
    OPENING: { x: 320, y: 90 },
    OPEN_OCC: { x: 600, y: 90 },
    OPEN_WAIT: { x: 600, y: 300 },
    CLOSING: { x: 320, y: 330 },
    EMERGENCY: { x: 850, y: 200 }
  };

  // Non-self-loop edges definition
  const edges = [
    { from: 'CLOSED', to: 'OPENING', label: 'f', path: 'M 160 200 Q 220 140 260 110' },
    { from: 'OPENING', to: 'OPEN_OCC', label: 'e', path: 'M 395 90 L 525 90' },
    { from: 'OPEN_OCC', to: 'OPEN_WAIT', label: 'n', path: 'M 570 122 L 570 268' },
    { from: 'OPEN_WAIT', to: 'OPEN_OCC', label: 'f, r, b', path: 'M 630 268 L 630 122' },
    { from: 'OPEN_WAIT', to: 'CLOSING', label: 't', path: 'M 525 315 L 395 325' },
    { from: 'CLOSING', to: 'CLOSED', label: 'e', path: 'M 250 320 Q 180 290 145 260' },
    { from: 'CLOSING', to: 'OPENING', label: 'f, r, b, o', path: 'M 300 298 L 300 122' },
    { from: 'CLOSED', to: 'LOCKED', label: 'k', path: 'M 85 260 L 85 418' },
    { from: 'LOCKED', to: 'CLOSED', label: 'k', path: 'M 135 418 L 135 260' },
    { from: 'EMERGENCY', to: 'OPEN_OCC', label: 'c', path: 'M 790 175 Q 710 130 670 115' }
  ];

  // Self loop descriptions
  const selfLoops = {
    CLOSED: 'r, b, n, e, t, o, c',
    OPENING: 'f, r, b, n, t, o, k, c',
    OPEN_OCC: 'f, r, b, e, t, o, k, c',
    OPEN_WAIT: 'n, e, o, k, c',
    CLOSING: 'n, t, k, c',
    LOCKED: 'f, r, b, n, e, t, o, c',
    EMERGENCY: 'f, r, b, n, e, t, o, k, x'
  };

  if (viewType === 'basic') {
    // Render Basic Textbook 2-State Diagram
    return (
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto', background: '#FFFFFF', borderRadius: '12px' }}>
        {/* CLOSED State */}
        <g transform="translate(150, 150)">
          <circle cx="0" cy="0" r="50" fill={stateColors.CLOSED.bg} stroke={stateColors.CLOSED.stroke} strokeWidth="3" />
          <circle cx="0" cy="0" r="44" fill="none" stroke={stateColors.CLOSED.stroke} strokeWidth="1.5" />
          <text x="0" y="5" textAnchor="middle" fill={stateColors.CLOSED.text} fontSize="14" fontWeight="bold">CLOSED</text>
        </g>
        {/* Start Arrow */}
        <path d="M 50 150 L 95 150" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />

        {/* OPEN State */}
        <g transform="translate(450, 150)">
          <circle cx="0" cy="0" r="50" fill={stateColors.OPEN.bg} stroke={stateColors.OPEN.stroke} strokeWidth="3" />
          <text x="0" y="5" textAnchor="middle" fill={stateColors.OPEN.text} fontSize="14" fontWeight="bold">OPEN</text>
        </g>

        {/* Transitions */}
        {/* CLOSED -> OPEN (FRONT) */}
        <path d="M 195 130 Q 300 80 405 130" fill="none" stroke="#0F766E" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="270" y="80" width="60" height="20" rx="4" fill="#FFFFFF" stroke="#0F766E" />
        <text x="300" y="94" textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="bold">FRONT</text>

        {/* OPEN -> CLOSED (NEITHER) */}
        <path d="M 405 170 Q 300 220 195 170" fill="none" stroke="#0F766E" strokeWidth="2" markerEnd="url(#arrow)" />
        <rect x="260" y="195" width="80" height="20" rx="4" fill="#FFFFFF" stroke="#0F766E" />
        <text x="300" y="209" textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="bold">NEITHER</text>

        {/* Self Loop CLOSED */}
        <path d="M 130 105 C 100 50, 190 50, 160 105" fill="none" stroke="#64748B" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="145" y="50" textAnchor="middle" fill="#475569" fontSize="10">REAR, BOTH, NEITHER</text>

        {/* Self Loop OPEN */}
        <path d="M 430 105 C 400 50, 490 50, 460 105" fill="none" stroke="#64748B" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="445" y="50" textAnchor="middle" fill="#475569" fontSize="10">FRONT, REAR, BOTH</text>

        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
        </defs>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 960 520" style={{ width: '100%', height: 'auto', background: '#FFFFFF', borderRadius: '12px' }}>
      <defs>
        <marker id="arrow-full" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
        <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#0F766E" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
        </marker>
      </defs>

      {/* Start Arrow to CLOSED */}
      <path d="M 20 230 L 30 230" stroke="#475569" strokeWidth="2.5" markerEnd="url(#arrow-full)" />
      <text x="25" y="218" fill="#475569" fontSize="11" fontWeight="700">start</text>

      {/* Any state box & red arrow to EMERGENCY */}
      <rect x="790" y="400" width="120" height="40" rx="8" fill="#FAFAFA" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="850" y="424" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="600">any state</text>
      <path d="M 850 400 L 850 240" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow-red)" />
      <rect x="835" y="310" width="30" height="20" rx="4" fill="#FFFFFF" stroke="#EF4444" />
      <text x="850" y="324" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="bold">x</text>

      {/* Draw Edges */}
      {edges.map((edge, idx) => {
        const isLastEdge = prevTransition && prevTransition.from === edge.from && prevTransition.to === edge.to;
        return (
          <g key={idx}>
            <path
              d={edge.path}
              fill="none"
              stroke={isLastEdge ? '#0F766E' : '#94A3B8'}
              strokeWidth={isLastEdge ? '3.5' : '2'}
              markerEnd={isLastEdge ? 'url(#arrow-active)' : 'url(#arrow-full)'}
              style={{ transition: 'all 0.3s ease' }}
            />
            {/* Label pill along edge */}
            <path
              id={`edge-path-${idx}`}
              d={edge.path}
              fill="none"
              stroke="none"
            />
            <text fill={isLastEdge ? '#0F766E' : '#334155'} fontSize="11" fontWeight="bold">
              <textPath href={`#edge-path-${idx}`} startOffset="50%" textAnchor="middle">
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
            <path d="M -30 -30 C -70 -80, 70 -80, 30 -30" fill="none" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrow-full)" />
            <text x="0" y="-72" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="600">{label}</text>
          </g>
        );
      })}

      {/* Draw State Nodes */}
      {spec.Q.map((q) => {
        const c = coords[q];
        const colors = stateColors[q];
        const isActive = q === currentState;
        const isSelected = q === selectedState;
        const isAccepting = spec.F.includes(q);

        return (
          <g
            key={q}
            transform={`translate(${c.x}, ${c.y})`}
            onClick={() => setSelectedState(q)}
            style={{ cursor: 'pointer' }}
          >
            {/* Glow ring if active */}
            {isActive && (
              <rect
                x="-82"
                y="-37"
                width="164"
                height="74"
                rx="37"
                fill="none"
                stroke="#0F766E"
                strokeWidth="4"
                opacity="0.8"
              />
            )}

            {/* Ellipse State Node */}
            <rect
              x="-75"
              y="-32"
              width="150"
              height="64"
              rx="32"
              fill={colors.bg}
              stroke={isSelected ? '#0F766E' : colors.stroke}
              strokeWidth={isSelected ? '3' : '2'}
            />

            {/* Accepting State Double Border */}
            {isAccepting && (
              <rect
                x="-69"
                y="-26"
                width="138"
                height="52"
                rx="26"
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
              fontSize="14"
              fontWeight="bold"
            >
              {q}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
