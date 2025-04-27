import React from 'react';
import * as THREE from 'three';
import { TrackCrosshair, UpdateCrosshair } from '../utils/Crosshair';
import ObjectBase from '../core/ObjectBase';
import { GameCamera } from "./GameCamera";
import Scene from '../core/Scene';

export default class SceneRenderer{
    public engineScene:Scene;
    public toRenderAssociation:Map<string, THREE.Mesh>;
    public scene:THREE.Scene;
    public renderer:THREE.WebGLRenderer;
    public renderTarget:THREE.WebGLRenderTarget;
    public canvasRef:React.RefObject<HTMLDivElement>;
    public camera:GameCamera;
    public firstRender:boolean = true;

    constructor( canvasRef:any ){
        // Cria a cena da Engine
        this.engineScene = new Scene();

        // Cria um mapa que associa o id dos objetos da minha engine com o que o Three vai desenhar
        this.toRenderAssociation = new Map<string, THREE.Mesh>();

        //Obtem o canvas
        this.canvasRef = canvasRef;
        
        // Configurar cena, câmera e renderizador
        this.scene = new THREE.Scene();

        // Adicionar uma luz ambiente para iluminar a cena de forma geral
        const ambientLight = new THREE.AmbientLight(0x555555);
        this.scene.add(ambientLight);

        this.renderer = new THREE.WebGLRenderer();

        // Criar Render Target (framebuffer)
        this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });

        this.camera = new GameCamera(this);
    }

    /**
    * Adiciona um objeto na cena que o Three está renderizando para que este objeto seja renderizado visualmente
    */
    public addToRender( objeto:any ): void{
        this.scene.add( objeto );
    }

    //Função para atualizar o pulo do personagem em primeira pessoa
    public updateJump( frameDelta:number ) {
        const cameraMovement = this.camera.getMovement();

        if(cameraMovement.jumpVelocityY == undefined){
           cameraMovement.jumpVelocityY = 0;
        }

        // Se estiver pulando, aplicar o movimento vertical
        if (cameraMovement.isJumping == true && cameraMovement.stopJumpStartFallAgain == false ) {
            // Aplica a gravidade (reduz a velocidade vertical a cada frame)

            // Se está subindo, aplicamos a gravidade para diminuir a velocidade
            cameraMovement.jumpVelocityY -= -45 * frameDelta * 1;  // Acelera negativamente para reduzir a velocidade de subida
            this.camera.getPosition().y += cameraMovement.jumpVelocityY * frameDelta * 1;  // Move a câmera para cima
            this.camera.objectBase.isFalling = true
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

            //Se o objeto já não foi criado na renderização do Three, cria ele pela primeira vez
            if ( !this.toRenderAssociation.has(objetoAtual.id) ) 
            {
                const threeMesh:THREE.Mesh = new THREE.Mesh();
                
                this.addToRender(threeMesh);
                this.toRenderAssociation.set(objetoAtual.id, threeMesh);
            }   

            /**
            * Atualiza visualmente a posição, rotação e escala dos objetos
            */
            const threeMesh:THREE.Mesh = this.toRenderAssociation.get(objetoAtual.id) as THREE.Mesh;

            if(threeMesh)
            {
                threeMesh.position.copy( objetoAtual.getMesh().position );
                threeMesh.rotation.copy( objetoAtual.getMesh().rotation );
                threeMesh.scale.copy( objetoAtual.getMesh().scale );
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
            const frameDelta = context.engineScene.sceneCounter.calculateFrameDelta(); // Tempo entre frames

            context.engineScene.loop( frameDelta, context.firstRender );

            // Atualiza a visualização dos objetos
            context.updateObjectsVisually();

            //Atualiza a camera
            context.camera.Update( frameDelta );
    
            //Atualiza o pulo
            context.updateJump( frameDelta );
    
            //Atualiza a posição do crosshair
            UpdateCrosshair( context, 
                             context.camera,
                             context.camera.getCrosshair(),
                             frameDelta );
    
            //Atualiza para onde a camera está apontando
            //TrackCrosshair( context, 
            //                frameDelta );

            // Renderizar a cena normal para o framebuffer
            context.renderer.setRenderTarget(context.renderTarget);
            context.renderer.render( context.scene, 
                                     context.camera.getCamera() );

            debugger

            // Diz que a primeira renderização já terminou
            context.firstRender = false;
        }

        animate();
    }

    public handleResize(){
        if (!this.canvasRef.current) return;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.setAspect( window.innerWidth / window.innerHeight );
        this.camera.updateProjectionMatrix();
    }

    public getRenderer(): THREE.WebGLRenderer{
        return this.renderer;
    }

    public getCanvas(): React.RefObject<HTMLDivElement>{
        return this.canvasRef;
    }
}