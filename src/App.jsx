import React from 'react';
import { useDoorController } from './hooks/useDoorController';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SimulatorTab } from './components/SimulatorTab';
import { DiagramTab } from './components/DiagramTab';
import { TryStringTab } from './components/TryStringTab';
import { VerifyTab } from './components/VerifyTab';

export default function App() {
  const controller = useDoorController();

  return (
    <div className="app-container">
      <Header
        activeTab={controller.activeTab}
        setActiveTab={controller.setActiveTab}
        onReset={controller.reset}
      />

      <main style={{ flex: 1 }}>
        {controller.activeTab === 'simulator' && (
          <SimulatorTab controller={controller} />
        )}
        {controller.activeTab === 'diagram' && (
          <DiagramTab
            currentState={controller.state}
            prevTransition={controller.prevTransition}
          />
        )}
        {controller.activeTab === 'try_string' && (
          <TryStringTab />
        )}
        {controller.activeTab === 'verify' && (
          <VerifyTab />
        )}
      </main>

      <Footer />
    </div>
  );
}
