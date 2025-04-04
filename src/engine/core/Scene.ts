import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';
import Base from "./Base";
import { GameCamera } from './GameCamera';
import { EngineMain } from '../main'; // Importa a função EngineMain
import { EngineLoop } from '../main'; // Importa a função EngineLoop
import { UpdateCrosshair } from '../utils/Crosshair'; 
import { TrackCrosshair } from '../utils/Crosshair';
import { EngineBeforeLoop } from '../main' //Importa a função EngineBeforeLoop
import ObjectBase from './ObjectBase';
import isObjectBase from '../utils/isObjectBase';
import postVertexShader from '../shaders/postVertexShader';
import postFragmentShader from '../shaders/postFragmentShader';

export default class Scene extends Base{

    public scene:THREE.Scene;
    public renderer:THREE.WebGLRenderer;
    public renderTarget:THREE.WebGLRenderTarget;
    public canvasRef:React.RefObject<HTMLDivElement>;
    public posicaoYchao:number;
    public camera:GameCamera;
    public clockCamera:THREE.Clock;
    public gravity:number;

    public objects:ObjectBase[];
    public additionalObjects:ObjectBase[];

    constructor( canvasRef:any ){
        super();

        this.posicaoYchao = 1.6;
        this.gravity = -0.09;     // Gravidade que puxa para baixo

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

        this.camera = new GameCamera(this.scene,
                                     this.renderer,
                                     this.canvasRef,
                                     this.posicaoYchao);

        this.clockCamera = new THREE.Clock();

        this.objects = [];

        //Here, we will put only object references(the instances), to be updated too, if they not are in the objects array.
        this.additionalObjects = [];

        //Shaders de pós-processamento
        const postMaterial = new THREE.ShaderMaterial({
            vertexShader: postVertexShader(),
            fragmentShader: postFragmentShader(),
            uniforms: {
                tDiffuse: { value: this.renderTarget.texture } // Passa a cena renderizada como textura
            },
            depthTest: true,
            depthWrite: true
        });

        // Criar um plano fullscreen para aplicar o shader
        const postPlane = new THREE.PlaneGeometry(2, 2);
        const postQuad = new THREE.Mesh(postPlane, postMaterial);

        // Força o quad a ser renderizado após os outros objetos
        postQuad.renderOrder = 999;

        this.scene.add(postQuad);
        
    }

    public add( objeto:any ){
        const is_ObjectBase = isObjectBase(objeto);

        //If is a instance of the Engine ObjectBase, get THREE.Mesh of this ObjectBase instance, add the ObjectBase instance to the update list 
        if( is_ObjectBase == true ){
            this.scene.add( objeto.getMesh() );
            this.objects.push( objeto );

        }else if( is_ObjectBase == false ){
            this.scene.add( objeto );
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
    
            EngineBeforeLoop( context, 
                              context.renderer,
                              context.canvasRef,
                              context.camera, 
                              context.camera.getControls() );
    
            //Outras coisas que vão acontecer
            const frameDelta = context.clockCamera.getDelta(); // Tempo entre frames
            
            //Atualiza a camera
            context.camera.Update( frameDelta );
    
            //Atualiza o pulo
            context.updateJump();
    
            //Atualiza a posição do crosshair
            UpdateCrosshair( context, 
                             context.camera,
                             context.camera.getCrosshair() );
    
            //Atualiza para onde a camera está apontando
            TrackCrosshair( context, 
                            context.camera,
                            context.camera.getCrosshair(),
                            context.camera.getRaycaster(),
                            context.camera.getMousePosition() );
    
            EngineLoop( context, 
                        context.renderer,
                        context.canvasRef,
                        context.camera, 
                        context.camera.getControls() );
    
            context.updateObjects();

            // 1. Renderizar a cena normal para o framebuffer
            context.renderer.setRenderTarget(context.renderTarget);
            context.renderer.render( context.scene, 
                                     context.camera.getCamera() );

            // 2. Aplicar pós-processamento renderizando o quad fullscreen
            context.renderer.setRenderTarget(null); // Renderizar na tela   
            context.renderer.render( context.scene, 
                                     context.camera.getCamera() );
        }

        animate();

        // Chamar a função EngineMain
        EngineMain( this, 
                    this.renderer,
                    this.canvasRef,
                    this.camera, 
                    this.camera.getControls() );

            
    }

    /**
    * Update all objects in the scene 
    */
    public updateObjects(): void{

        const updatableObjects = Array<ObjectBase>(0).concat( this.objects )
                                                     .concat( this.additionalObjects );

        for( let i = 0 ; i < updatableObjects.length ; i++ )
        {
            const currentObject = updatableObjects[ i ];
            const currentObjectIndex = i;

            try{
                /**
                * Repass some important informations into the  "currentObject"
                */
                currentObject.scene = this;

                /**
                * Update the object 
                */
                currentObject.updateObject();

            }catch(e){
                console.log(e)
            }
        }

    }

    //Função para atualizar o pulo do personagem em primeira pessoa
    public updateJump() {
        const cameraMovement = this.camera.getMovement();

        if(cameraMovement.jumpVelocityY == undefined){
           cameraMovement.jumpVelocityY = 0;
        }

        // Se estiver pulando, aplicar o movimento vertical
        if (cameraMovement.isJumping == true) {
        // Aplica a gravidade (reduz a velocidade vertical a cada frame)

        // Se está subindo, aplicamos a gravidade para diminuir a velocidade
        cameraMovement.jumpVelocityY += this.gravity;  // Acelera negativamente para reduzir a velocidade de subida
        this.camera.getPosition().y += cameraMovement.jumpVelocityY;  // Move a câmera para cima
    
    
        // Verifica se o personagem alcançou o pico do pulo e começou a cair
        if (this.camera.getPosition().y <= this.posicaoYchao) { 
            this.camera.getPosition().y = this.posicaoYchao;  // Impede de ultrapassar o chão
            cameraMovement.isJumping = false;  // O pulo terminou, agora está de volta no chão
            cameraMovement.jumpVelocityY = 0;  // Zera a velocidade vertical
        }
        }
    }

    public handleResize(){
        if (!this.canvasRef.current) return;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.setAspect( window.innerWidth / window.innerHeight );
        this.camera.updateProjectionMatrix();
    }

}