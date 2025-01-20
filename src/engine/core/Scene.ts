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

export default class Scene extends Base{

    public scene:THREE.Scene;
    public renderer:THREE.WebGLRenderer;
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
        this.renderer = new THREE.WebGLRenderer();

        this.camera = new GameCamera(this.scene,
                                     this.renderer,
                                     this.canvasRef,
                                     this.posicaoYchao);

        this.clockCamera = new THREE.Clock();

        this.objects = [];

        //Here, we will put only object references(the instances), to be updated too, if they not are in the objects array.
        this.additionalObjects = [];
        
    }

    public add( objeto:any ){
        const isObjectBase = this.isObjectBase(objeto);

        //If is a instance of the Engine ObjectBase, get THREE.Mesh of this ObjectBase instance, add the ObjectBase instance to the update list 
        if( isObjectBase == true ){
            this.scene.add( objeto.getMesh() );
            this.objects.push( objeto );

        }else if( isObjectBase == false ){
            this.scene.add( objeto );
        }

    }

    public isObjectBase(objeto: any): objeto is ObjectBase {
        return typeof objeto.getMesh === 'function';
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