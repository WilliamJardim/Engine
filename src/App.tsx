// src/App.tsx
import React from 'react';
import ThreeScene from './ThreeScene';
import DebugTerminal from './editor/DebugTerminal';

const App: React.FC = () => {
  return (
    <div>
      <h1>Three.js com React e TypeScript</h1>
      <ThreeScene />
      <DebugTerminal/>
    </div>
  );
};

export default App;