// src/components/MyEngineScene.tsx
import React, { useEffect, useRef } from 'react';
import RenderizadorCena             from './engine/renderer/RenderizadorCena';
import './MyEngineScene.css'; 

// SOMENTE NO NAVEGADOR: VOU IGNORAR QUANDO EU FOR PORTAR PRA C++
import injetarScriptCapurarEntradaNavegador from './engine/browser/entrada-navegador';
function ativar_coisas_especificas_navegador()
{
  injetarScriptCapurarEntradaNavegador();
}
// FIM DA FUNÇÂO ESPECIFICA PRA NAVEGADOR

const MyEngineScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {

    const renderizadorGL : RenderizadorCena = new RenderizadorCena(canvasRef);

    renderizadorGL.iniciar();

    // SOMENTE NO NAVEGADOR: VOU IGNORAR ISSO QUANDO EU FOR PORTAR PRA C++
    ativar_coisas_especificas_navegador();

    // TODO: Limpeza ao desmontar o componente
    return () => {
      renderizadorGL.encerrar();
    };  

  }, []);


  return <canvas className="canvas-container" ref={canvasRef} id="glcanvas"></canvas>;
};

export default MyEngineScene;
