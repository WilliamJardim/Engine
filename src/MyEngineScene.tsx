// src/components/MyEngineScene.tsx
import React, { useEffect, useRef } from 'react';
import RenderizadorCena             from './engine/renderer/RenderizadorCena';
import './MyEngineScene.css'; 

const MyEngineScene: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const renderizadorGL = new RenderizadorCena(canvasRef);

    renderizadorGL.iniciar();

    // TODO: Limpeza ao desmontar o componente

  }, []);


  return <div className="canvas-container" ref={canvasRef}></div>;
};

export default MyEngineScene;
