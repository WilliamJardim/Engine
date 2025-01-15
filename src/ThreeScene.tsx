// src/components/ThreeScene.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ThreeScene.css'; // Importa o CSS
import { EngineMain } from './engine/main'; // Importa a função EngineMain
import { EngineLoop } from './engine/main'; // Importa a função EngineLoop
import { EngineBeforeLoop } from './engine/main' //Importa a função EngineBeforeLoop
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import MovementState from './engine/interfaces/MovementState';
import createCrosshair, { UpdateCrosshair } from './engine/utils/Crosshair';

const ThreeScene: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Configurar cena, câmera e renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff, 1); // Luz ambiente
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direcional
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    camera.position.set(0, 1.6, 5); // Altura da câmera simulando altura de uma pessoa

    camera.position.z = 5;

    // Configurar movimentação da camera
    const cameraControls = new PointerLockControls(camera, renderer.domElement);

    // Adicionar evento de clique para ativar o controle do cursor
    canvasRef.current.addEventListener('click', () => {
      cameraControls.lock();
    });

    const clockCamera = new THREE.Clock();

    const cameraMovement: MovementState = { forward: false, 
                                            backward: false, 
                                            left: false, 
                                            right: false };

    const cameraVelocity = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();

    // Adicionar o crosshair à câmera
    const crosshair = createCrosshair();
    scene.add(crosshair);

    // Função de animação
    const animate = () => {
      requestAnimationFrame(animate);

      EngineBeforeLoop( scene, 
                        camera, 
                        cameraControls);

      //Outras coisas que vão acontecer
      const frameDelta = clockCamera.getDelta(); // Tempo entre frames

      cameraVelocity.x -= cameraVelocity.x * 10.0 * frameDelta;
      cameraVelocity.z -= cameraVelocity.z * 10.0 * frameDelta;

      cameraDirection.z = Number(cameraMovement.forward) - Number(cameraMovement.backward);
      cameraDirection.x = Number(cameraMovement.right) - Number(cameraMovement.left);

      cameraDirection.normalize(); // Garante que a direção tenha comprimento 1

      if (cameraMovement.forward == true || cameraMovement.backward == true){
        cameraVelocity.z -= cameraDirection.z * 200.0 * frameDelta;
      }

      if (cameraMovement.left == true || cameraMovement.right == true ) {
        cameraVelocity.x -= cameraDirection.x * 200.0 * frameDelta;
      }

      cameraControls.moveRight(-cameraVelocity.x * frameDelta);
      cameraControls.moveForward(-cameraVelocity.z * frameDelta);

      //Atualiza a posição do crosshair
      UpdateCrosshair( scene, 
                       camera,
                       crosshair );

      EngineLoop( scene, 
                  camera, 
                  cameraControls );

      renderer.render(scene, camera);
    };

    const handleResize = () => {
      if (!canvasRef.current) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
  
    window.addEventListener('resize', handleResize);

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          cameraMovement.forward = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          cameraMovement.backward = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          cameraMovement.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          cameraMovement.right = true;
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          cameraMovement.forward = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          cameraMovement.backward = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          cameraMovement.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          cameraMovement.right = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup',   onKeyUp);

    camera.position.y = 1.6; // Altura inicial da câmera (simula a altura de uma pessoa)
    camera.position.z = 5;

    animate();

    // Chamar a função EngineMain
    EngineMain( scene, 
                camera, 
                cameraControls );

    // Limpeza ao desmontar o componente
    return () => {
      canvasRef.current?.removeChild(renderer.domElement);
    };
  }, []);


  return <div className="canvas-container" ref={canvasRef}></div>;
};

export default ThreeScene;
