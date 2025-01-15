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

    const posicaoYchao = 1.6;

    camera.position.set(0, posicaoYchao, 5); // Altura da câmera simulando altura de uma pessoa

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
                                            right: false,
                                            isJumping: false,
                                            jumpVelocityY: 0,
                                            jumpCooldown: false,
                                            jumpStrength: 1 };

    const cameraVelocity = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();

    let gravity = -0.09;     // Gravidade que puxa para baixo

    // Adicionar o crosshair à câmera
    const crosshair = createCrosshair();
    scene.add(crosshair);

    // Adicionar um RayCaster para permitir rastrear onde o jogador está apontando
    const raycaster = new THREE.Raycaster();
    const mousePosition = new THREE.Vector2(0, 0); // Coordenadas do mouse (fixo no centro)

    // Atualiza a posição do mouse
    function onMouseMove(event: MouseEvent) {
      // Normaliza a posição do mouse para o intervalo de -1 a 1
      mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Adiciona o evento de movimento do mouse
    window.addEventListener('mousemove', onMouseMove, false);

    //Função para atualizar o pulo do personagem em primeira pessoa
    function updateJump() {
      if(cameraMovement.jumpVelocityY == undefined){
        cameraMovement.jumpVelocityY = 0;
      }

      // Se estiver pulando, aplicar o movimento vertical
      if (cameraMovement.isJumping == true) {
        // Aplica a gravidade (reduz a velocidade vertical a cada frame)

        // Se está subindo, aplicamos a gravidade para diminuir a velocidade
        cameraMovement.jumpVelocityY += gravity;  // Acelera negativamente para reduzir a velocidade de subida
        camera.position.y += cameraMovement.jumpVelocityY;  // Move a câmera para cima
    
  
        // Verifica se o personagem alcançou o pico do pulo e começou a cair
        if (camera.position.y <= posicaoYchao) { 
          camera.position.y = posicaoYchao;  // Impede de ultrapassar o chão
          cameraMovement.isJumping = false;  // O pulo terminou, agora está de volta no chão
          cameraMovement.jumpVelocityY = 0;  // Zera a velocidade vertical
        }
      }
    }

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

      //Atualiza o pulo
      updateJump();

      //Atualiza a posição do crosshair
      UpdateCrosshair( scene, 
                       camera,
                       crosshair );

      //Atualiza para onde a camera está apontando
      TrackCrosshair( scene, 
                      camera,
                      crosshair,
                      raycaster,
                      mousePosition);

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
        case 'Space':
          debugger
          if( !cameraMovement.isJumping )
          {
             cameraMovement.isJumping = true;
             cameraMovement.jumpVelocityY = cameraMovement.jumpStrength;
          }
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
        case 'Space':
          cameraMovement.jumpCooldown = false;
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
