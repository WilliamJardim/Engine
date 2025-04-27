// src/components/ThreeScene.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ThreeScene.css'; // Importa o CSS
import { EngineMain } from './engine/main'; // Importa a função EngineMain
import { EngineLoop } from './engine/main'; // Importa a função EngineLoop
import { EngineBeforeLoop } from './engine/main' //Importa a função EngineBeforeLoop
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import MovementState from './engine/interfaces/MovementState';
import createCrosshair, { TrackCrosshair, UpdateCrosshair } from './engine/utils/Crosshair';
import { GameCamera } from './engine/renderer/GameCamera';
import Scene from './engine/core/Scene';
import SceneRenderer from './engine/renderer/SceneRenderer';

const ThreeScene: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const sceneRenderer = new SceneRenderer(canvasRef);
    const renderer = sceneRenderer.renderer;

    sceneRenderer.iniciar();

    // Limpeza ao desmontar o componente
    return () => {
      canvasRef.current?.removeChild(renderer.domElement);
    };

  }, []);


  return <div className="canvas-container" ref={canvasRef}></div>;
};

export default ThreeScene;
