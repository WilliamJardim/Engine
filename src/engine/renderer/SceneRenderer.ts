import React from 'react';
import * as THREE from 'three';
import ObjectBase from '../core/ObjectBase';
import Scene from '../core/Scene';
import parseMeshType from '../utils/render/parseMeshType';
import ObjectProps from '../interfaces/ObjectProps';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import MovementState from '../interfaces/MovementState';
import InputListener from '../input/InputListener';
import SceneConfig from '../interfaces/SceneConfig';
import Camera from '../core/Camera';

export default class SceneRenderer{
    public engineScene:Scene;
    public inputListener:InputListener;
    public toRenderAssociation:Map<string, any>;
    public scene:THREE.Scene;
    public renderer:THREE.WebGLRenderer;
    public canvasRef:React.RefObject<HTMLDivElement>;
    public camera:THREE.PerspectiveCamera;
    public cameraControls:PointerLockControls;
    public firstRender:boolean = true;
    public cameraVelocity:THREE.Vector3;
    public cameraDirection:THREE.Vector3;
    public cameraMovement:MovementState;
    public provavelmentePronto:boolean = false; //Sinaliza se os objetos iniciais foram carregados

    constructor( canvasRef:any ){
        const contexto = this;

        this.provavelmentePronto = false;

        this.inputListener = new InputListener();

        this.cameraMovement = {
            forward: false,
            backward: false,
            left: false,
            right: false
        }

        this.cameraVelocity = new THREE.Vector3();
        this.cameraDirection = new THREE.Vector3();

        // Cria a cena da Engine
        this.engineScene = new Scene({
            inputListener: this.inputListener
            
        }as SceneConfig);

        // Cria um mapa que associa o id dos objetos da minha engine com o que o Three vai desenhar
        this.toRenderAssociation = new Map<string, any>();

        //Obtem o canvas
        this.canvasRef = canvasRef;
        
        // Configurar cena, câmera e renderizador
        this.scene = new THREE.Scene();

        // Adicionar uma luz ambiente para iluminar a cena de forma geral
        const ambientLight = new THREE.AmbientLight(0x555555);
        this.scene.add(ambientLight);

        this.renderer = new THREE.WebGLRenderer();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
        this.camera.position.set(20, -42, 50);

        this.cameraControls = new PointerLockControls(this.camera, this.renderer.domElement);
        
        // Adicionar evento de clique para ativar o controle do cursor
        this.canvasRef!.current!.addEventListener('click', () => {
            contexto.cameraControls.lock();
        });
    }

    public updateCameraMovement(){
        /**
        * Escuta o teclado e o mouse, para aplicar os eventos de camera
        */
        const cameraMovement = this.cameraMovement;
        const inputListener  = this.inputListener;

        // Esquerda
        if( inputListener.isKey('A') == true ) {
            cameraMovement.left = true;
        }else if( inputListener.isKey('A') == false ) {
            cameraMovement.left = false;
        }

        // Direita
        if( inputListener.isKey('D') == true ) {
            cameraMovement.right = true;
        }else if( inputListener.isKey('D') == false ){
            cameraMovement.right = false;
        }
        
        // Frente
        if( inputListener.isKey('W') == true ) {
            cameraMovement.forward = true;
        }else if( inputListener.isKey('W') == false ){
            cameraMovement.forward = false;
        }

        // Traz
        if( inputListener.isKey('S') == true ) {
            cameraMovement.backward = true;
        }else if( inputListener.isKey('S') == false ){
            cameraMovement.backward = false;
        }
    }

    /**
    * Lê as cameras da engine, e faz o Three acompanhar acompanhar a posição da camera principal 
    * Lembrando que a camera principal pode mudar a qualquer momento
    */
    public processCameras()
    {   
        const engineScene   : Scene    = this.engineScene;
        const engineCameras : Camera[] = this.engineScene.cameras;

        /**
        * Faz a camera do renderizador acompanhar a camera principal 
        */
        for( let i = 0 ; i < engineCameras.length ; i++ )
        {
            const currentCamera: Camera = engineCameras[i];

            if( currentCamera.isMainCamera() == true )
            {   
                if( currentCamera.getPosition().x != undefined )
                {
                    this.camera.position.x = currentCamera.getPosition().x!;
                }
                if( currentCamera.getPosition().y != undefined )
                {
                    this.camera.position.y = currentCamera.getPosition().y!;
                }
                if( currentCamera.getPosition().z != undefined )
                {
                    this.camera.position.z = currentCamera.getPosition().z!;
                }
                break;
            }
        }
    }

    /**
    * Adiciona um objeto na cena que o Three está renderizando para que este objeto seja renderizado visualmente
    */
    public addToRender( objeto:any ): void{
        if( objeto != null && objeto != undefined ){
            this.scene.add( objeto );
        }
    }

    /** 
    * Atualiza os objetos visualmente
    */
    public updateObjectsVisually(): void{

        const engineScene = this.engineScene;

        const engineSceneObjects = Array<ObjectBase>(0).concat( engineScene.objects )
                                                       .concat( engineScene.additionalObjects );

        /**
        * Para cada objeto da cena da minha engine 
        */
        for( let i = 0 ; i < engineSceneObjects.length ; i++ )
        {
            const objetoAtual:ObjectBase = engineSceneObjects[i];
            const objProps:ObjectProps   = objetoAtual.objProps;
            const tipoObjeto:string      = objProps.type;

            //Se o objeto já não foi criado na renderização do Three, cria ele pela primeira vez
            if ( !this.toRenderAssociation.has(objetoAtual.id) ) 
            {
                const newThreeMesh:THREE.Mesh|THREE.Object3D|THREE.Group|THREE.Group<any>|null = parseMeshType( tipoObjeto, objProps ); //Cria um objeto do THREE correspondente ao tipo usado

                this.addToRender(newThreeMesh);
                this.toRenderAssociation.set(objetoAtual.id, newThreeMesh);
            }   

            /**
            * Atualiza visualmente a posição, rotação e escala dos objetos
            */
            let threeMesh:THREE.Mesh|THREE.Object3D|THREE.Group|THREE.Group<any>|null = this.toRenderAssociation.get(objetoAtual.id);

            // ENQUANTO ESSA LINHA DE CÒDIGO NUNCA FOR EXECUTADA, OS OBJETOS TODOS APARECEM NORMALMENTE
            // MAIS A PARTIR DO MOMENTO EM QUE ESSA LINHA DE CÒDIGO È EXECUTADA, TUDO SOME
            // E AI O RESTO DO BUG OCORRE, ALGUNS VOLTAM DEPOIS DE CAIR NO CHAO (os objetos com fisica), mais outros não voltam(como os objetos sem fisica)
            if( threeMesh != null && threeMesh != undefined )
            {
                /**
                * Espelha atributos que a minha engine informou
                */
                const position : THREE.Vector3 = objetoAtual.getMesh().position as THREE.Vector3;
                const rotation : THREE.Vector3 = objetoAtual.getMesh().rotation as THREE.Vector3;
                const scale    : THREE.Vector3 = objetoAtual.getMesh().scale    as THREE.Vector3;

                if(position != undefined && position != null)
                {
                    threeMesh.position.x = position.x;
                    threeMesh.position.y = position.y;
                    threeMesh.position.z = position.z;
                }

                if(rotation != undefined && rotation != null)
                {
                    threeMesh.rotation.x = rotation.x;
                    threeMesh.rotation.y = rotation.y;
                    threeMesh.rotation.z = rotation.z;
                }
                
                if(scale != undefined && scale != null)
                {
                    threeMesh.scale.x = scale.x;
                    threeMesh.scale.y = scale.y;
                    threeMesh.scale.z = scale.z;
                }

                threeMesh.visible = true;

                threeMesh.updateMatrix();
                threeMesh.updateMatrixWorld(true);
            }
        }

    }

    //Função que chama o loop "animate"
    public iniciar(): void{
        const context = this;

        //Se não tem, ignora
        if (!this.canvasRef.current) return;

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.canvasRef.current.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.handleResize);

        function animate(){
            requestAnimationFrame(animate);
    
            //Outras coisas que vão acontecer
            const frameDelta  = context.engineScene.sceneCounter.calculateFrameDelta(); // Tempo entre frames
            const frameNumber = context.engineScene.sceneCounter.getFrameNumber();

            // Só chama o loop da minha engine se o renderizador já está apto para renderizar coisas
            context.engineScene.loop( frameDelta, frameNumber, context.firstRender, context.provavelmentePronto );

            // Atualiza a visualização dos objetos
            context.updateObjectsVisually();

            // Atualiza os movimentos da camera
            context.updateCameraMovement();  

            // Atualiza as cameras
            context.processCameras();

            // Movimento livre da camera
            context.cameraVelocity.x -= context.cameraVelocity.x * 10.0 * frameDelta;
            context.cameraVelocity.z -= context.cameraVelocity.z * 10.0 * frameDelta;
            context.cameraDirection.z = Number(context.cameraMovement.forward) - Number(context.cameraMovement.backward);
            context.cameraDirection.x = Number(context.cameraMovement.right) - Number(context.cameraMovement.left);

            context.cameraDirection.normalize(); // Garante que a direção tenha comprimento 1

            if (context.cameraMovement.forward == true || context.cameraMovement.backward == true){
                context.cameraVelocity.z -= context.cameraDirection.z * 200.0 * frameDelta;
            }

            if (context.cameraMovement.left == true || context.cameraMovement.right == true ) {
                context.cameraVelocity.x -= context.cameraDirection.x * 200.0 * frameDelta;
            }

            context.cameraControls.moveRight(-context.cameraVelocity.x * frameDelta);
            context.cameraControls.moveForward(-context.cameraVelocity.z * frameDelta);

            // Renderizar a cena normal para o framebuffer
            context.renderer.render( context.scene, 
                                     context.camera );

            // Diz que a primeira renderização já terminou
            context.firstRender = false;
        }

        //Aguarda um pouco o renderizador terminar de carregar os objetos
        setTimeout(function(){
            context.provavelmentePronto = true;
        }, 500);

        animate();
    }

    public handleResize(){
        if (!this.canvasRef.current) return;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    public getRenderer(): THREE.WebGLRenderer{
        return this.renderer;
    }

    public getCanvas(): React.RefObject<HTMLDivElement>{
        return this.canvasRef;
    }
}