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
import { GameCamera } from './engine/GameCamera';

const ThreeScene: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Configurar cena, câmera e renderizador
    const scene = new THREE.Scene();
  
    const renderer = new THREE.WebGLRenderer();

    const posicaoYchao = 1.6;

    const camera = new GameCamera(scene,
                                  renderer,
                                  canvasRef,
                                  posicaoYchao);

    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(renderer.domElement);

    const clockCamera = new THREE.Clock();

    let gravity = -0.09;     // Gravidade que puxa para baixo

    //Função para atualizar o pulo do personagem em primeira pessoa
    function updateJump() {
      const cameraMovement = camera.getMovement();

      if(cameraMovement.jumpVelocityY == undefined){
        cameraMovement.jumpVelocityY = 0;
      }

      // Se estiver pulando, aplicar o movimento vertical
      if (cameraMovement.isJumping == true) {
        // Aplica a gravidade (reduz a velocidade vertical a cada frame)

        // Se está subindo, aplicamos a gravidade para diminuir a velocidade
        cameraMovement.jumpVelocityY += gravity;  // Acelera negativamente para reduzir a velocidade de subida
        camera.getPosition().y += cameraMovement.jumpVelocityY;  // Move a câmera para cima
    
  
        // Verifica se o personagem alcançou o pico do pulo e começou a cair
        if (camera.getPosition().y <= posicaoYchao) { 
          camera.getPosition().y = posicaoYchao;  // Impede de ultrapassar o chão
          cameraMovement.isJumping = false;  // O pulo terminou, agora está de volta no chão
          cameraMovement.jumpVelocityY = 0;  // Zera a velocidade vertical
        }
      }
    }

    // Função de animação
    const animate = () => {
      requestAnimationFrame(animate);

      EngineBeforeLoop( scene, 
                        renderer,
                        canvasRef,
                        camera, 
                        camera.getControls() );

      //Outras coisas que vão acontecer
      const frameDelta = clockCamera.getDelta(); // Tempo entre frames
      
      //Atualiza a camera
      camera.Update( frameDelta );

      //Atualiza o pulo
      updateJump();

      //Atualiza a posição do crosshair
      UpdateCrosshair( scene, 
                       camera,
                       camera.getCrosshair() );

      //Atualiza para onde a camera está apontando
      TrackCrosshair( scene, 
                      camera,
                      camera.getCrosshair(),
                      camera.getRaycaster(),
                      camera.getMousePosition() );

      EngineLoop( scene, 
                  renderer,
                  canvasRef,
                  camera, 
                  camera.getControls() );

      renderer.render( scene, camera.getCamera() );
    };

    const handleResize = () => {
      if (!canvasRef.current) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.setAspect( window.innerWidth / window.innerHeight );
      camera.updateProjectionMatrix();
    };
  
    window.addEventListener('resize', handleResize);

    animate();

    // Chamar a função EngineMain
    EngineMain( scene, 
                renderer,
                canvasRef,
                camera, 
                camera.getControls() );

    // Limpeza ao desmontar o componente
    return () => {
      canvasRef.current?.removeChild(renderer.domElement);
    };
  }, []);


  return <div className="canvas-container" ref={canvasRef}></div>;
};

export default ThreeScene;
