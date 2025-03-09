// src/App.tsx
import React from 'react';
import ThreeScene from './ThreeScene';
import DebugTerminal from './editor/DebugTerminal';
import SceneBuilder from './editor/SceneBuilder';
import './DivComponentes.css'

const App: React.FC = () => {
  return (
    <div className='div-principal'>
      <h1>Three.js com React e TypeScript</h1>

      <div className='div-abas'>
        <button> Scene </button>
        <button> Terminal </button>
        <button> Builder </button>
      </div>

      <div className='div-componentes'>
        <ThreeScene />
        <DebugTerminal/>
        <SceneBuilder/>
      </div>

    </div>
  );
};

export default App;