import React, { useState } from 'react';

export function Header({ activeTab, setActiveTab, onReset }) {
  const [showHint, setShowHint] = useState(true);

  return (
    <header className="app-header-container">
      <div className="app-header">
        <div className="header-title-group">
          <h1 className="header-title">Door DFA Lab</h1>
          <p className="header-subtitle">An automatic door controller modelled as a finite automaton</p>
        </div>
        <button className="btn-reset-app" onClick={onReset} title="Reset simulation state, door position, and logs">
          ↺ Reset
        </button>
      </div>

      <nav className="tabs-navigation" aria-label="Main Navigation">
        <button
          className={`tab-button ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          Simulator
        </button>
        <button
          className={`tab-button ${activeTab === 'diagram' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagram')}
        >
          State Diagram
        </button>
        <button
          className={`tab-button ${activeTab === 'try_string' ? 'active' : ''}`}
          onClick={() => setActiveTab('try_string')}
        >
          Try a String
        </button>
        <button
          className={`tab-button ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('verify')}
        >
          Verify
        </button>
      </nav>

      {showHint && (
        <div className="hint-banner fade-in">
          <span>💡 Walk the person through the door and watch the controller think.</span>
          <button
            className="hint-close-btn"
            onClick={() => setShowHint(false)}
            aria-label="Dismiss hint"
            title="Dismiss hint"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
}
