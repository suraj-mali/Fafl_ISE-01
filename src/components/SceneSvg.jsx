import React, { useRef, useState, useCallback } from 'react';
import { spec } from '../dfa/spec.js';
import { resolveMove } from '../sim/collision.js';

export function SceneSvg({
  p,
  state,
  personPos,
  setPersonPos,
  person2Pos,
  setPerson2Pos,
  secondPerson,
  obstacle,
  dynamicCaption,
  isP1Waiting,
  isP2Waiting
}) {
  const svgRef = useRef(null);
  const [draggingTarget, setDraggingTarget] = useState(null); // 'p1' | 'p2' | null

  // Pad occupancies
  const isFrontOcc1 = personPos.x >= 220 && personPos.x <= 420 && personPos.y >= 300 && personPos.y <= 370;
  const isRearOcc1 = personPos.x >= 220 && personPos.x <= 420 && personPos.y >= 60 && personPos.y <= 130;

  const isFrontOcc2 = secondPerson && person2Pos.x >= 220 && person2Pos.x <= 420 && person2Pos.y >= 300 && person2Pos.y <= 370;
  const isRearOcc2 = secondPerson && person2Pos.x >= 220 && person2Pos.x <= 420 && person2Pos.y >= 60 && person2Pos.y <= 130;

  const frontPadActive = isFrontOcc1 || isFrontOcc2;
  const rearPadActive = isRearOcc1 || isRearOcc2;

  // Beam check
  const inBeam1 = personPos.x >= 240 && personPos.x <= 400 && personPos.y >= 195 && personPos.y <= 249;
  const inBeam2 = secondPerson && person2Pos.x >= 240 && person2Pos.x <= 400 && person2Pos.y >= 195 && person2Pos.y <= 249;
  const beamBroken = obstacle || inBeam1 || inBeam2;

  // Lamp colors
  const mooreOutputs = spec.moore[state] || spec.moore.CLOSED;
  const lampColors = {
    GREEN: '#10B981',
    AMBER: '#F59E0B',
    BLUE: '#3B82F6',
    CYAN: '#06B6D4',
    ORANGE: '#F97316',
    GREY: '#6B7280',
    RED: '#EF4444'
  };
  const currentLampColor = lampColors[mooreOutputs.lamp] || '#10B981';

  // Coordinate helper
  const getSvgCoords = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * 640;
    const y = ((clientY - rect.top) / rect.height) * 440;
    return { x, y };
  };

  const handlePointerDown = (target) => (e) => {
    e.preventDefault();
    setDraggingTarget(target);
  };

  const handlePointerMove = (e) => {
    if (!draggingTarget) return;
    const rawCoords = getSvgCoords(e);
    if (draggingTarget === 'p1') {
      setPersonPos(prev => resolveMove(prev, rawCoords, p));
    } else if (draggingTarget === 'p2') {
      setPerson2Pos(prev => resolveMove(prev, rawCoords, p));
    }
  };

  const handlePointerUp = () => {
    setDraggingTarget(null);
  };

  return (
    <div className="scene-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Scene Dynamic Caption Bar */}
      <div style={{ background: '#F0FDFA', border: '1px solid #CCFBF1', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8125rem', color: '#0F766E', fontWeight: '600' }}>
        ℹ️ {dynamicCaption}
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 640 440"
        className="scene-svg"
        style={{ width: '100%', height: 'auto', display: 'block', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Background Areas */}
        <rect x="0" y="0" width="640" height="215" fill="#FFFFFF" />
        <rect x="0" y="215" width="640" height="225" fill="#F8FAFC" />

        <text x="30" y="35" fill="#94A3B8" fontSize="12" fontWeight="700" letterSpacing="0.1em">INSIDE</text>
        <text x="30" y="420" fill="#94A3B8" fontSize="12" fontWeight="700" letterSpacing="0.1em">OUTSIDE</text>

        {/* Rear Pad (Inside) */}
        <rect
          x="220"
          y="60"
          width="200"
          height="70"
          rx="10"
          fill={rearPadActive ? '#CCFBF1' : '#F1F5F9'}
          stroke={rearPadActive ? '#0F766E' : '#CBD5E1'}
          strokeWidth={rearPadActive ? '2.5' : '1.5'}
          style={{ transition: 'all 0.2s ease' }}
        />
        <text x="320" y="92" textAnchor="middle" fill={rearPadActive ? '#0F766E' : '#64748B'} fontSize="13" fontWeight="700" letterSpacing="0.05em">
          REAR PAD
        </text>
        <text x="320" y="112" textAnchor="middle" fill={rearPadActive ? '#0F766E' : '#94A3B8'} fontSize="11" fontWeight="800">
          {rearPadActive ? '● OCCUPIED' : '○ CLEAR'}
        </text>

        {/* Front Pad (Outside) */}
        <rect
          x="220"
          y="300"
          width="200"
          height="70"
          rx="10"
          fill={frontPadActive ? '#CCFBF1' : '#F1F5F9'}
          stroke={frontPadActive ? '#0F766E' : '#CBD5E1'}
          strokeWidth={frontPadActive ? '2.5' : '1.5'}
          style={{ transition: 'all 0.2s ease' }}
        />
        <text x="320" y="332" textAnchor="middle" fill={frontPadActive ? '#0F766E' : '#64748B'} fontSize="13" fontWeight="700" letterSpacing="0.05em">
          FRONT PAD
        </text>
        <text x="320" y="352" textAnchor="middle" fill={frontPadActive ? '#0F766E' : '#94A3B8'} fontSize="11" fontWeight="800">
          {frontPadActive ? '● OCCUPIED' : '○ CLEAR'}
        </text>

        {/* Solid Wall Band (y=208..222) */}
        <rect x="0" y="208" width="240" height="14" fill="#64748B" rx="2" />
        <rect x="400" y="208" width="240" height="14" fill="#64748B" rx="2" />

        {/* Beam Zone */}
        <rect
          x="240"
          y="195"
          width="160"
          height="54"
          fill={beamBroken ? 'rgba(239, 68, 68, 0.08)' : 'transparent'}
          stroke={beamBroken ? '#EF4444' : '#CBD5E1'}
          strokeWidth="1.5"
          strokeDasharray={beamBroken ? 'none' : '4 4'}
          style={{ transition: 'all 0.2s ease' }}
        />
        <line x1="240" y1="215" x2="400" y2="215" stroke={beamBroken ? '#EF4444' : '#94A3B8'} strokeWidth={beamBroken ? '2' : '1'} strokeDasharray={beamBroken ? 'none' : '3 3'} />
        {beamBroken && (
          <text x="320" y="190" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="700">BEAM BROKEN</text>
        )}

        {/* Obstacle Box */}
        {obstacle && (
          <g transform="translate(302, 197)">
            <rect width="36" height="36" rx="4" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <text x="18" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="bold">📦</text>
          </g>
        )}

        {/* Sliding Door Panels */}
        {/* Left Panel: x from 240 - 80*p */}
        <rect
          x={240 - 80 * p}
          y="206"
          width="80"
          height="18"
          rx="3"
          fill="#334155"
          stroke="#1E293B"
          strokeWidth="1.5"
        />
        {/* Right Panel: x from 320 + 80*p */}
        <rect
          x={320 + 80 * p}
          y="206"
          width="80"
          height="18"
          rx="3"
          fill="#334155"
          stroke="#1E293B"
          strokeWidth="1.5"
        />

        {/* Door Position Bar & Label under Doorway */}
        <g transform="translate(260, 230)">
          <rect x="0" y="0" width="120" height="12" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
          <rect x="0" y="0" width={120 * p} height="12" rx="6" fill="#0F766E" />
          <text x="60" y="10" textAnchor="middle" fill={p > 0.5 ? '#FFFFFF' : '#475569'} fontSize="9" fontWeight="bold" fontFamily="var(--font-mono)">
            DOOR: {Math.round(p * 100)}%
          </text>
        </g>

        {/* Bolt Padlock Icon when LOCKED */}
        {mooreOutputs.bolt === 'ENGAGED' && (
          <g transform="translate(310, 196)">
            <circle cx="10" cy="10" r="14" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2" />
            <text x="10" y="14" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">🔒</text>
          </g>
        )}

        {/* Lamp Output in Scene Top-Right */}
        <g transform="translate(560, 18)">
          <rect x="0" y="0" width="65" height="28" rx="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="16" cy="14" r="7" fill={currentLampColor} stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="32" y="18" fill="#475569" fontSize="10" fontWeight="700">{mooreOutputs.lamp}</text>
        </g>

        {/* Emergency Alarm Chip */}
        {state === 'EMERGENCY' && (
          <g transform="translate(20, 18)">
            <rect x="0" y="0" width="110" height="28" rx="6" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
            <text x="55" y="18" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="800" letterSpacing="0.1em">🚨 ALARM</text>
          </g>
        )}

        {/* Person 1 Token (Blue) */}
        <g
          transform={`translate(${personPos.x}, ${personPos.y})`}
          style={{ cursor: 'grab', userSelect: 'none' }}
          onMouseDown={handlePointerDown('p1')}
          onTouchStart={handlePointerDown('p1')}
        >
          <circle cx="0" cy="-10" r="14" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M -12 12 C -12 0, 12 0, 12 12 Z" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
          <text x="0" y="-6" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">P1</text>
          {isP1Waiting && (
            <g transform="translate(20, -10)">
              <rect x="0" y="-12" width="105" height="20" rx="4" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1" />
              <text x="5" y="2" fill="#B45309" fontSize="9" fontWeight="bold">waiting for door</text>
            </g>
          )}
        </g>

        {/* Person 2 Token (Orange, Optional) */}
        {secondPerson && (
          <g
            transform={`translate(${person2Pos.x}, ${person2Pos.y})`}
            style={{ cursor: 'grab', userSelect: 'none' }}
            onMouseDown={handlePointerDown('p2')}
            onTouchStart={handlePointerDown('p2')}
          >
            <circle cx="0" cy="-10" r="14" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2.5" />
            <path d="M -12 12 C -12 0, 12 0, 12 12 Z" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2" />
            <text x="0" y="-6" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">P2</text>
            {isP2Waiting && (
              <g transform="translate(20, -10)">
                <rect x="0" y="-12" width="105" height="20" rx="4" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1" />
                <text x="5" y="2" fill="#B45309" fontSize="9" fontWeight="bold">waiting for door</text>
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
