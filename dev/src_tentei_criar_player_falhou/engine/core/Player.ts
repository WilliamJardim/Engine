import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import MovementState from '../interfaces/MovementState';
import Crosshair from '../interfaces/Crosshair';
import createCrosshair, { TrackCrosshair, UpdateCrosshair } from '../utils/Crosshair';
import Base from './Base';
import ObjectBase from './ObjectBase';
import ObjectProps from '../interfaces/ObjectProps';
import Scene from './Scene';
import { GameCamera } from './GameCamera';
import createCube from '../utils/createCube';
import createMaterialByImage from '../utils/createMaterialByImage';
import ObjectAttachment from '../interfaces/ObjectAttachment';

export class Player{
    public  tipo = 'Player';
    public  objectBase:ObjectBase;
    public objProps:ObjectProps;
    public scene:Scene;
    public renderer:THREE.WebGLRenderer;
    public canvasRef:React.RefObject<HTMLDivElement>;
    public camera:GameCamera;
    public mousePosition:THREE.Vector2;
    public playerMovement:MovementState;
    public playerVelocity:THREE.Vector3;
    public playerDirection:THREE.Vector3;
    public crosshair:Crosshair;

    constructor( scene:Scene,
                 objProps?:ObjectProps
                
    ){
        const contexto = this;
        const canvasRef = scene.getCanvas();
        const renderer  = scene.getRenderer();

        const camera    = new GameCamera( scene, {
                              havePhysics: false,
                              name: 'PlayerCamera'
                          } );

        //Define as propriedades do objeto
        this.objProps  = {
          havePhysics: true,
          collide: true,
          collisionEvents: true,
          material: createMaterialByImage('/textures/1piso.png'), //The material,
          name: 'PlayerBody',
          scaleReduce: 1.5,
          weight: 40,
          
          attachments: [
            { 
                name: 'PlayerCamera', //Vou criar logo abaixo
                position: {
                  y: -500
                }

            } as ObjectAttachment
          ]

        };
        
        // O ObjectBase responsavel pela camera
        this.objectBase = createCube(this.objProps);
        
        // Repassa coisas importantes
        this.objectBase.scene = scene;

        this.scene = scene;

        this.canvasRef = canvasRef;

        this.renderer = renderer;

        this.camera = camera;
      
        this.playerMovement = { forward: false, 
                                backward: false, 
                                left: false, 
                                right: false,
                                isJumping: false,
                                stopJumpStartFallAgain: false,
                                jumpVelocityY: 0,
                                jumpCooldown: false,
                                jumpStrength: 0.5 };
        
        this.playerVelocity = new THREE.Vector3();
        this.playerDirection = new THREE.Vector3();

        // Adicionar o crosshair à câmera
        this.crosshair = createCrosshair();
        this.scene.add(this.crosshair);
    
        this.mousePosition = new THREE.Vector2(0, 0); // Coordenadas do mouse (fixo no centro)
    
        // Atualiza a posição do mouse
        function onMouseMove(event: MouseEvent) {
            // Normaliza a posição do mouse para o intervalo de -1 a 1
            contexto.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
            contexto.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    
        // Adiciona o evento de movimento do mouse
        window.addEventListener('mousemove', onMouseMove, false);
    
        const onKeyDown = (event: KeyboardEvent) => {
            const playerMovement = this.getMovement();
      
            switch (event.code) {
              case 'ArrowUp':
              case 'KeyW':
                playerMovement.forward = true;
                break;
              case 'ArrowDown':
              case 'KeyS':
                playerMovement.backward = true;
                break;
              case 'ArrowLeft':
              case 'KeyA':
                playerMovement.left = true;
                break;
              case 'ArrowRight':
              case 'KeyD':
                playerMovement.right = true;
                break;
              case 'Space':
                if( !playerMovement.isJumping )
                {
                   playerMovement.stopJumpStartFallAgain = false;
                   playerMovement.isJumping = true;
                   playerMovement.jumpVelocityY = playerMovement.jumpStrength;

                   setTimeout(()=>{
                     playerMovement.stopJumpStartFallAgain = true;
                     playerMovement.isJumping = false;
                     playerMovement.jumpVelocityY = 0;
                   }, 300)
                }
                break;
            }
          };
      
        const onKeyUp = (event: KeyboardEvent) => {
            const playerMovement = this.getMovement();
      
            switch (event.code) {
              case 'ArrowUp':
              case 'KeyW':
                playerMovement.forward = false;
                break;
              case 'ArrowDown':
              case 'KeyS':
                playerMovement.backward = false;
                break;
              case 'ArrowLeft':
              case 'KeyA':
                playerMovement.left = false;
                break;
              case 'ArrowRight':
              case 'KeyD':
                playerMovement.right = false;
                break;
              case 'Space':
                playerMovement.jumpCooldown = false;
                break;
            }
         };
      
         document.addEventListener('keydown', onKeyDown);
         document.addEventListener('keyup',   onKeyUp);
      
         this.getPosition().y = 1.6; // Altura inicial da câmera (simula a altura de uma pessoa)
         this.getPosition().z = 5;
    }

    /**
    * Faz as atualizações do Player
    */
    public Update( frameDelta:number ){
        //Atualiza o ObjectBase
        this.objectBase.updateObject();

        //Atualiza a camera
        this.camera.Update( frameDelta );
    }

    public getMovement(): MovementState{
        return this.playerMovement;
    }

    public getPosition(): THREE.Vector3{
        return this.objectBase.getMesh().position;
    }

    public getMousePosition(): THREE.Vector2{
        return this.mousePosition;
    }

    public getVelocity(): THREE.Vector3{
        return this.playerVelocity;
    }

    public getDirection(): THREE.Vector3{
        return this.playerDirection;
    }
    
    public getCamera(): GameCamera{
        return this.camera;
    }

    public getCrosshair(): Crosshair{
        return this.crosshair;
    }
}