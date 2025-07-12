/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import React, { useState } from 'react';
import MyEngineScene from './MyEngineScene';
import DebugTerminal from './editor/DebugTerminal';
import './DivComponentes.scss'

const App: React.FC = () => {
  const [sceneEnabled, setSceneEnabled] = useState(true);
  const [terminalEnabled, setTerminalEnabled] = useState(false);

  function onSceneClick()
  { 
    setSceneEnabled( !sceneEnabled );
  }

  function onTerminalClick()
  {
    setTerminalEnabled( !terminalEnabled );
  }

  return (
    <div className='div-principal'>
      
      <div className='div-abas'>
        <button className={ sceneEnabled    ? 'enabled' : 'disabled' } onClick={ onSceneClick }    > Scene    </button>
        <button className={ terminalEnabled ? 'enabled' : 'disabled' } onClick={ onTerminalClick } > Terminal </button>
      </div>

      <div className='div-componentes'>
        {
          sceneEnabled && <MyEngineScene />
        }
        {
          terminalEnabled && <DebugTerminal />
        }
      </div>

    </div>
  );
};

export default App;