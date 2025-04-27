// src/components/ThreeScene.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import '../../../ThreeScene.css';
import './BuilderEditor.css'; // Importa o CSS
import { EngineMain } from '../../../engine/main.ts'; // Importa a função EngineMain
import { EngineLoop } from '../../../engine/main'; // Importa a função EngineLoop
import { EngineBeforeLoop } from '../../../engine/main' //Importa a função EngineBeforeLoop
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import MovementState from '../../../engine/interfaces/MovementState';
import createCrosshair, { TrackCrosshair, UpdateCrosshair } from '../../../engine/utils/Crosshair';
import { GameCamera } from '../../../engine/renderer/GameCamera.ts';
import Scene from '../../../engine/core/Scene';
import { globalContext } from '../../../engine/main.ts';

const BuilderEditor: React.FC = () => {
  const mirrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Criar a cena e o renderizador
    const mainScene   = globalContext.get('gameScene');

    //Se não carregou o mainScene, ignora
    if(!mainScene){
      return;
    }

    const mirrorScene = new THREE.Scene();
    const mirrorRenderer = new THREE.WebGLRenderer({ antialias: true });
    mirrorRenderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    mirrorRef.current?.appendChild(mirrorRenderer.domElement);

    // Criar a câmera livre
    const freeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    freeCamera.position.set(0, 5, 10);

    // Criar os controles (PointerLockControls)
    const controls = new PointerLockControls(freeCamera, document.body);

    //Os controles da cena de execução
    const sceneCameraControls = globalContext.get('sceneCameraControls'); 

    //Se ainda não carregou sceneCameraControls, ignora
    if(!sceneCameraControls){
      return;
    }

    controls.lock(); // Bloqueia o mouse e ativa os controles

    // Criar objetos na cena (exemplo)
    const mirrorCube = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    mirrorCube.position.set(0, 1, 0);
    mirrorScene.add(mirrorCube);

    // Adicionar luzes na cena
    const mirrorLight = new THREE.AmbientLight(0xffffff, 1);
    mirrorScene.add(mirrorLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5).normalize(); // Define a posição da luz direcional
    mirrorScene.add(directionalLight);

    // Controle de movimento (andar para onde está olhando)
    const movement = { forward: false, backward: false, left: false, right: false };
    document.addEventListener("keydown", (event) => {
      if (event.code === "KeyW") movement.forward = true;
      if (event.code === "KeyS") movement.backward = true;
      if (event.code === "KeyA") movement.left = true;
      if (event.code === "KeyD") movement.right = true;
    });
    document.addEventListener("keyup", (event) => {
      if (event.code === "KeyW") movement.forward = false;
      if (event.code === "KeyS") movement.backward = false;
      if (event.code === "KeyA") movement.left = false;
      if (event.code === "KeyD") movement.right = false;
    });

    // Função para clonar objetos para a cena espelho
    function mirrorObjects() {
     
    } 

    // Loop de animação para movimentação
    function animateMirror() {
      requestAnimationFrame(animateMirror);

      const speed = 0.2;
      const direction = new THREE.Vector3();

      // Atualiza a direção para onde a câmera está olhando
      freeCamera.getWorldDirection(direction);

      if (movement.forward) freeCamera.position.addScaledVector(direction, speed);
      if (movement.backward) freeCamera.position.addScaledVector(direction, -speed);
      if (movement.left) {
        const left = new THREE.Vector3().crossVectors(freeCamera.up, direction).normalize();
        freeCamera.position.addScaledVector(left, speed);
      }
      if (movement.right) {
        const right = new THREE.Vector3().crossVectors(direction, freeCamera.up).normalize();
        freeCamera.position.addScaledVector(right, speed);
      }

      // Espelha os objetos da cena principal
      mirrorObjects();

      mirrorRenderer.render(mirrorScene, freeCamera);
    }
    animateMirror();

    return () => {
      mirrorRef.current?.removeChild(mirrorRenderer.domElement);
    };

  }, []);

  return <div className="canvas-container" ref={mirrorRef}></div>;
};

export default BuilderEditor;
