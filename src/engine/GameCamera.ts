import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import MovementState from './interfaces/MovementState';
import Crosshair from './interfaces/Crosshair';
import createCrosshair, { TrackCrosshair, UpdateCrosshair } from './utils/Crosshair';

export class GameCamera{
    private scene:THREE.Scene;
    private renderer:THREE.WebGLRenderer;
    private canvasRef:React.RefObject<HTMLDivElement>;
    private camera:THREE.PerspectiveCamera;
    private cameraControls:PointerLockControls;
    private raycaster:THREE.Raycaster;
    private mousePosition:THREE.Vector2;
    private cameraMovement:MovementState;
    private cameraVelocity:THREE.Vector3;
    private cameraDirection:THREE.Vector3;
    private crosshair:Crosshair;

    constructor( scene:THREE.Scene,
                 renderer:THREE.WebGLRenderer, 
                 canvasRef:React.RefObject<HTMLDivElement>,
                 posicaoYchao_inicial:number,
                
    ){
        const contexto = this;

        this.scene = scene;

        this.canvasRef = canvasRef;

        this.renderer = renderer;

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);

        this.camera.position.set(0, posicaoYchao_inicial, 5); // Altura da câmera simulando altura de uma pessoa
        
        this.camera.position.z = 5;
    
        // Configurar movimentação da camera
        this.cameraControls = new PointerLockControls(this.camera, 
                                                      renderer.domElement);

        this.cameraMovement = { forward: false, 
                                backward: false, 
                                left: false, 
                                right: false,
                                isJumping: false,
                                jumpVelocityY: 0,
                                jumpCooldown: false,
                                jumpStrength: 1 };
        
        this.cameraVelocity = new THREE.Vector3();
        this.cameraDirection = new THREE.Vector3();

        // Adicionar o crosshair à câmera
        this.crosshair = createCrosshair();
        this.scene.add(this.crosshair);
    
        // Adicionar um RayCaster para permitir rastrear onde o jogador está apontando
        this.raycaster = new THREE.Raycaster();
        this.mousePosition = new THREE.Vector2(0, 0); // Coordenadas do mouse (fixo no centro)
    
        // Atualiza a posição do mouse
        function onMouseMove(event: MouseEvent) {
            // Normaliza a posição do mouse para o intervalo de -1 a 1
            contexto.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
            contexto.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    
        // Adiciona o evento de movimento do mouse
        window.addEventListener('mousemove', onMouseMove, false);
    
        // Adicionar evento de clique para ativar o controle do cursor
        this.canvasRef!.current!.addEventListener('click', () => {
            contexto.cameraControls.lock();
        });
    }

    public setAspect( aspecto:number ): void{
        this.camera.aspect = aspecto;
    }

    public updateProjectionMatrix(): void{
        this.camera.updateProjectionMatrix();
    }

    public getMovement(): MovementState{
        return this.cameraMovement;
    }

    public getPosition(): THREE.Vector3{
        return this.camera.position;
    }

    public getMousePosition(): THREE.Vector2{
        return this.mousePosition;
    }

    public getControls(): PointerLockControls{
        return this.cameraControls;
    }

    public getVelocity(): THREE.Vector3{
        return this.cameraVelocity;
    }

    public getDirection(): THREE.Vector3{
        return this.cameraDirection;
    }
    
    public getCamera(): THREE.PerspectiveCamera{
        return this.camera;
    }

    public getQuaternion(): THREE.Quaternion{
        return this.camera.quaternion;
    }

    public getCrosshair(): Crosshair{
        return this.crosshair;
    }

    public getRaycaster(): THREE.Raycaster{
        return this.raycaster;
    }
}