import React from 'react';
import { spec } from '../dfa/spec.js';

export function StateStrip({ currentState }) {
  return (
    <div className="state-strip" aria-label="Current State Strip">
      {spec.Q.map(q => {
        const isActive = q === currentState;
        return (
          <div
            key={q}
            className={`state-strip-pill state-${q} ${isActive ? 'active' : ''}`}
            title={spec.stateMeaning[q]}
          >
            {q}
          </div>
        );
      })}
    </div>
  );
}
