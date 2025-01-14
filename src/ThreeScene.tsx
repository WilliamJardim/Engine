// src/components/ThreeScene.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ThreeScene.css'; // Importa o CSS
import { EngineMain } from './engine/main'; // Importa a função EngineMain

const ThreeScene: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Configurar cena, câmera e renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff, 1); // Luz ambiente
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direcional
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Chamar a função EngineMain
    EngineMain( scene );

    camera.position.z = 5;

    // Função de animação
    const animate = () => {
      requestAnimationFrame(animate);

      //Outras coisas que vão acontecer
      
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
  
    window.addEventListener('resize', handleResize);

    // Limpeza ao desmontar o componente
    return () => {
      canvasRef.current?.removeChild(renderer.domElement);
    };
  }, []);


  return <div className="canvas-container" ref={canvasRef}></div>;
};

export default ThreeScene;
