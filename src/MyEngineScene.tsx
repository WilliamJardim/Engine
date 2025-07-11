// src/components/MyEngineScene.tsx
import React, { useEffect, useRef } from 'react';
import RenderizadorCena             from './engine/renderer/RenderizadorCena';
import './MyEngineScene.css'; 

const MyEngineScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {

    const renderizadorGL : RenderizadorCena = new RenderizadorCena(canvasRef);

    renderizadorGL.iniciar();

    // TODO: Limpeza ao desmontar o componente
    return () => {
      renderizadorGL.encerrar();
    };  

  }, []);


  return <canvas className="canvas-container" ref={canvasRef} id="glcanvas"></canvas>;
};

export default MyEngineScene;
