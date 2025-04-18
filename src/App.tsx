// src/App.tsx
import React, { useState } from 'react';
import ThreeScene from './ThreeScene';
import DebugTerminal from './editor/DebugTerminal';
import SceneBuilder from './editor/SceneBuilder';
import './DivComponentes.scss'

const App: React.FC = () => {
  const [sceneEnabled, setSceneEnabled] = useState(true);
  const [terminalEnabled, setTerminalEnabled] = useState(false);
  const [builderEnabled, setBuilderEnabled] = useState(false);

  function onSceneClick()
  { 
    setSceneEnabled( !sceneEnabled );
  }

  function onTerminalClick()
  {
    setTerminalEnabled( !terminalEnabled );
  }

  function onBuilderClick()
  {
    setBuilderEnabled( !builderEnabled );
  }

  return (
    <div className='div-principal'>
      <h1>Three.js com React e TypeScript</h1>

      <div className='div-abas'>
        <button className={ sceneEnabled    ? 'enabled' : 'disabled' } onClick={ onSceneClick }    > Scene    </button>
        <button className={ builderEnabled  ? 'enabled' : 'disabled' } onClick={ onBuilderClick }  > Builder  </button>
        <button className={ terminalEnabled ? 'enabled' : 'disabled' } onClick={ onTerminalClick } > Terminal </button>
      </div>

      <div className='div-componentes'>
        {
          sceneEnabled && <ThreeScene />
        }
        {
          terminalEnabled && <DebugTerminal />
        }
        {
          builderEnabled && <SceneBuilder />
        }
      </div>

    </div>
  );
};

export default App;