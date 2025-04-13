import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import MovementState from '../interfaces/MovementState';
import Crosshair from '../interfaces/Crosshair';
import createCrosshair, { TrackCrosshair, UpdateCrosshair } from '../utils/Crosshair';
import Base from './Base';
import ObjectBase from './ObjectBase';
import ObjectProps from '../interfaces/ObjectProps';
import Scene from './Scene';

export class GameCamera{
    public  tipo = 'Camera';
    public  objectBase:ObjectBase;
    private objProps:ObjectProps;
    private scene:Scene;
    private renderer:THREE.WebGLRenderer;
    private canvasRef:React.RefObject<HTMLDivElement>;
    private camera:THREE.PerspectiveCamera;
    private cameraControls:PointerLockControls;

    constructor( scene:Scene,
                 objProps?:ObjectProps
                
    ){
        const contexto = this;
        const canvasRef = scene.getCanvas();
        const renderer  = scene.getRenderer();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);

        //Define as propriedades do objeto
        this.objProps   = (objProps || {
          havePhysics: true,
          name: 'PlayerCamera',
          collide: true,
          collisionEvents: true,
        }as ObjectProps);
        
        // O ObjectBase responsavel pela camera
        this.objectBase = new ObjectBase( camera, 
                                          this.objProps );
        
        // Repassa coisas importantes
        this.objectBase.scene = scene;

        this.scene = scene;

        this.canvasRef = canvasRef;

        this.renderer = renderer;

        this.camera = camera;

        //The prop that will be used to reffer to the main Mesh that this Object will manipulate
        this.objectBase.setMesh( this.camera );

        this.camera.position.set(0, 0, 5); // Altura da câmera simulando altura de uma pessoa
        
        this.camera.position.z = 5;

        // Configurar movimentação da camera
        this.cameraControls = new PointerLockControls(this.camera, 
                                                      renderer.domElement);

        // Adicionar evento de clique para ativar o controle do cursor
        this.canvasRef!.current!.addEventListener('click', () => {
          contexto.cameraControls.lock();
        });
    }

    getMesh(): THREE.Mesh{
      return this.objectBase.getMesh();
    }

    /**
    * Faz as atualizações na camera 
    */
    public Update( frameDelta:number ){
        //Atualiza o ObjectBase
        this.objectBase.updateObject();
    }

    public getCamera(): THREE.Camera{
      return this.camera;
    }

    public setAspect( aspect:number ): void{
      this.camera.aspect = aspect;
    }

    public updateProjectionMatrix(): void{
      this.camera.updateProjectionMatrix();
    }

    public getQuaternion(): THREE.Quaternion{
        return this.camera.quaternion;
    }

    


}