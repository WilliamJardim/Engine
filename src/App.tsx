// src/App.tsx
import React from 'react';
import ThreeScene from './ThreeScene';
import DebugTerminal from './editor/DebugTerminal';
import './DivComponentes.css'

const App: React.FC = () => {
  return (
    <div className='div-principal'>
      <h1>Three.js com React e TypeScript</h1>

      <div className='div-componentes'>
        <ThreeScene />
        <DebugTerminal/>
      </div>

    </div>
  );
};

export default App;