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
import ObjectProps from '../interfaces/ObjectProps';
import ImaginaryObject from './ImaginaryObject';
import ObjectEventLayer from '../interfaces/ObjectEventBlock';
import ObjectEvents from '../interfaces/ObjectEvents';
import CollisionTable from '../interfaces/CollisionTable';
import ProximityTable from '../interfaces/ProximityTable';
import CollisionBinaryTable from '../interfaces/CollisionBinaryTable';
import ProximityBinaryTable from '../interfaces/ProximityBinaryTable';
import ProximityBounds from '../utils/interfaces/ProximityBounds';
import isProximity from '../utils/logic/isProximity';
import {globalContext} from '../../engine/main.ts';
import isCollision from '../utils/logic/isCollision.ts';
import Wind from '../interfaces/Wind.ts';
import { Player } from './Player.ts';

export default class Scene extends Base{

    public loaded:boolean = false;
    public scene:THREE.Scene;
    public renderer:THREE.WebGLRenderer;
    public renderTarget:THREE.WebGLRenderTarget;
    public canvasRef:React.RefObject<HTMLDivElement>;
    public posicaoYchao:number;
    public player:Player;
    public clockCamera:THREE.Clock;
    public gravity:number;
    public atrito:number;
    public arrastoAr:number;

    public objects:ObjectBase[];
    public additionalObjects:ObjectBase[];
    
    public objectTableById:any;
    public objectTableByName:any;

    public collisionTable:CollisionTable;
    public collisionBinaryTable:CollisionBinaryTable;
    public proximityTable:ProximityTable;
    public proximityBinaryTable:ProximityBinaryTable;

    /**
    * Configurações do vento para física
    */
    public wind:Wind;

    constructor( canvasRef:any ){
        super();

        this.wind = {
            orientation : { x: 0.008, 
                            y: 0.001, 
                            z: 0.005},

            deslocationTrend: { x: 0.02, 
                                y: 0.001, 
                                z: 0.001},

            intensity   : { x: 0, 
                            y: 0, 
                            z: 0 }
        };

        this.posicaoYchao = 1.6;
        this.gravity = -0.03;     // Gravidade que puxa para baixo
        this.atrito  = 0.97;      // Atrito usado na fisica de aceleração/desaceleracao de objetos
        this.arrastoAr = 0.97;    // Arrast do ar(afeta objetos com aceleração que estiverem no ar)

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

        this.player = new Player(this, {});

        this.clockCamera = new THREE.Clock();

        this.objects = [];

        //Here, we will put only object references(the instances), to be updated too, if they not are in the objects array.
        this.additionalObjects = [];

        // Tabela que vai manter os objetos indexados por ID
        this.objectTableById = {};
        // Tabela que vai manter os objetos indexados por Nome
        this.objectTableByName = {};

        // Tabela de objetos colidindo com outros objetos
        this.collisionTable = {
            byName    : {},
            byID      : {},
            byClasses : {}
        };

        // Tabela BINARIA de objetos colidindo com outros objetos
        this.collisionBinaryTable = {
            byName    : {},
            byID      : {},
            byClasses : {}
        };

        // Tabela de objetos proximos de outros objetos
        this.proximityTable = {
            byName    : {},
            byID      : {},
            byClasses : {}
        };

        // Tabela BINARIA de objetos colidindo com outros objetos
        this.proximityBinaryTable = {
            byName    : {},
            byID      : {},
            byClasses : {}
        };

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

    /**
    * Callback interno para quando a Engine iniciar a cena
    */
    public onSceneLoad( essaCena:Scene ): void
    {
        let context = this;
        setTimeout(function(){
            context.add( context.player.objectBase );    
            context.add( context.player.camera );  
        }, 2000)  
    }

    public clearCollisionTable(): void{
        // Tabela de objetos colidindo com outros objetos
        this.collisionTable = {
            byName    : {},
            byID      : {},
            byClasses : {}
        };

        /*
        this.collisionBinaryTable = {
            byName    : {},
            byID      : {},
            byClasses : {}
        };*/
    }

    public clearObjectCollisionFromTableByName( objectName: string ): void{
        this.collisionTable.byName[objectName] = [];
        //this.collisionBinaryTable.byName[objectName] = {};
    }

    public clearObjectCollisionFromTableByID( objectID: string ): void{
        this.collisionTable.byID[objectID] = [];
        //this.collisionBinaryTable.byID[objectID] = {};
    }

    public clearObjectCollisionFromTableByCLASSES( objectClasses: string|string[] ): void{
        const contexto = this;

        if( typeof objectClasses == 'string' ){
            this.collisionTable.byClasses[objectClasses] = [];
            //this.collisionBinaryTable.byClasses[objectClasses] = {};

        }else if( typeof objectClasses == 'object' ){
            objectClasses.forEach(function(nomeClasse:string){
                contexto.collisionTable.byClasses[nomeClasse] = [];
                //contexto.collisionBinaryTable.byClasses[nomeClasse] = {};
            })
        }
    }

    public clearProximityTable(): void{
        // Tabela de objetos proximos de outros objetos
        this.proximityTable = {
            byName    : {},
            byID      : {},
            byClasses : {}
        };

        /*
        this.proximityBinaryTable = {
            byName    : {},
            byID      : {},
            byClasses : {}
        };*/
    }

    public clearObjectProximityFromTableByName( objectName: string ): void{
        this.proximityTable.byName[objectName] = [];
        this.collisionBinaryTable.byName[objectName] = {};
    }

    public clearObjectProximityFromTableByID( objectID: string ): void{
        this.proximityTable.byID[objectID] = [];
        this.collisionBinaryTable.byName[objectID] = {};
    }

    public clearObjectProximityFromTableByCLASSES( objectClasses: string|string[] ): void{
        const contexto = this;

        if( typeof objectClasses == 'string' ){
            this.proximityTable.byClasses[objectClasses] = [];
            //this.collisionBinaryTable.byClasses[objectClasses] = {};

        }else if( typeof objectClasses == 'object' ){
            objectClasses.forEach(function(nomeClasse:string){
                contexto.proximityTable.byClasses[nomeClasse] = [];
                //contexto.collisionBinaryTable.byClasses[nomeClasse] = {};
            })
        }
    }

    /**
    * Verifica se dois objetos na cena estão proximos um do outro
    * Pode ser tanto pelo "name" quanto pelo "id"
    * 
    * @param objA 
    * @param objB 
    * @returns {boolean}
    */
    public queryIfObjectIsProximityOf( objA: ObjectBase|string, objB: ObjectBase|string, limites?:ProximityBounds|number|undefined ): boolean{

        // Se vai usar o calculo da propia Engine mesmo, nos limites que ela ja calculou
        if( limites == undefined ){
            //Se eu passar dois objetos do tipo ObjectBase, ou um ObjectBase e uma string
            if( (typeof objA == 'object' && typeof objB == 'object') || 
                (typeof objA == 'object' && typeof objB == 'string') 
            
            ){
                if( objA.name != undefined && 
                    ( ( typeof objB == 'object' && objB.name != undefined ) || typeof objB == 'string' ) && 
                    this.proximityBinaryTable.byName[ objA.name ] != undefined &&
                    this.proximityBinaryTable.byName[ objA.name ][ typeof objB == 'object' ? objB.name! : objB ] != undefined 
                ){
                    return this.proximityBinaryTable.byName[ objA.name ][ typeof objB == 'object' ? objB.name! : objB ] == true;
                    
                }else if( objA.id != undefined && 
                          ( ( typeof objB == 'object' && objB.id != undefined) || typeof objB == 'string' ) && 
                          this.proximityBinaryTable.byID[ objA.id ] != undefined &&
                          this.proximityBinaryTable.byID[ objA.id ][ typeof objB == 'object' ? objB.id : objB ] != undefined 
                ){
                    return this.proximityBinaryTable.byID[ objA.id ][ typeof objB == 'object' ? objB.id : objB ] == true;
                }

            //Senao, se for só o name ou o id dos objetos em string, Nesse caso, ele ja vai entender tanto se for o name quanto o id
            }else if( typeof objA == 'string' && typeof objB == 'string' ){
                return this.proximityBinaryTable.byName[ objA ][ objB ] == true || this.proximityBinaryTable.byID[ objA ][ objB ] == true; 
            }

        //Se tem limites personalizados vai fazer um novo calculo
        }else{
            if( typeof objB == 'object' ){
                return isProximity( objA, objB, limites ) == true;

            //Se for uma string, ele pega o objeto que tem esse nome
            }else if( typeof objB == 'string' ){
                return isProximity( objA, this.getObjectByName(objB), limites )

            }else if( typeof objA == 'string' ){
                return isProximity( this.getObjectByName(objA), objB, limites )

            }else if( typeof objA == 'string' && typeof objB == 'string' ){
                return isProximity( this.getObjectByName(objA), this.getObjectByName(objB), limites )
            }
        }

        return false;
    }

    /**
    * Verifica se dois objetos na cena estão colidindo um com o outro
    * Pode ser tanto pelo "name" quanto pelo "id"
    * 
    * @param objA 
    * @param objB 
    * @returns {boolean}
    */
    public queryIfObjectIsCollisionOf( objA: ObjectBase|string, objB: ObjectBase|string, limites?:ProximityBounds|number|undefined ): boolean{

        // Se vai usar o calculo da propia Engine mesmo, nos limites que ela ja calculou
        if( limites == undefined ){
            //Se eu passar dois objetos do tipo ObjectBase
            if( typeof objA == 'object' && typeof objB == 'object' ){
                if( objA.name != undefined && 
                    objB.name != undefined  && 
                    this.collisionBinaryTable.byName[ objA.name ] != undefined &&
                    this.collisionBinaryTable.byName[ objA.name ][ objB.name ] != undefined
                ){
                    return this.collisionBinaryTable.byName[ objA.name ][ objB.name ] == true;


                }else if( objA.id != undefined && 
                        objB.id != undefined && 
                        this.collisionBinaryTable.byID[ objA.id ] != undefined &&
                        this.collisionBinaryTable.byID[ objA.id ][ objB.id ] != undefined
                ){
                    return this.collisionBinaryTable.byID[ objA.id ][ objB.id ] == true;
                }

            //Senao, se for só o name ou o id dos objetos em string, Nesse caso, ele ja vai entender tanto se for o name quanto o id
            }else if( typeof objA == 'string' && typeof objB == 'string' ){
                return this.collisionBinaryTable.byName[ objA ][ objB ] == true || this.collisionBinaryTable.byID[ objA ][ objB ] == true;
            }

        //Se tem limites personalizados vai fazer um novo calculo
        }else{
            return isCollision( objA, objB, limites ) == true;
        }

        return false;
    }

    /**
    * Traz um objeto pelo ID
    */
    public getObjectByID( objectId:string ): ObjectBase|ImaginaryObject|null{
        return this.objectTableById[ objectId ] || null;
    }

    /**
    * Traz um objeto pelo Nome
    */
    public getObjectByName( objectId:string ): ObjectBase|ImaginaryObject|null{
        return this.objectTableByName[ objectId ] || null;
    }

    /**
    * Traz um objeto pelo Nome ou ID
    */
    public getObjectBySomething( objectIdOrName:string ): ObjectBase|ImaginaryObject|null{
        return this.getObjectByID(objectIdOrName) || this.getObjectByName(objectIdOrName);
    }

    public getRenderer(): THREE.WebGLRenderer{
        return this.renderer;
    }

    public getCanvas(): React.RefObject<HTMLDivElement>{
        return this.canvasRef;
    }

    /**
    * Adiciona um objeto na cena
    */
    public add( objeto:any ): void{
        if( this.objects == undefined ){return};
        
        const is_ObjectBase = isObjectBase(objeto);

        //If is a instance of the Engine ObjectBase, get THREE.Mesh of this ObjectBase instance, add the ObjectBase instance to the update list 
        if( is_ObjectBase == true ){
            this.scene.add( objeto.getMesh() );
            this.objects.push( objeto );

        }else if( is_ObjectBase == false ){
            this.scene.add( objeto );
        }
    }

    /**
    * Adiciona um objeto na lista de atualizações da cena 
    */
    public addToLogic( objeto:ObjectBase ): void{
        if( this.objects ){
            this.objects.push( objeto );
        }
    }

    /**
    * Remove um objeto da cena
    */
    public remove( objetoRemover:ObjectBase|ImaginaryObject ): void{
        //Se tem o evento whenDestroy, executa ele
        if( objetoRemover.objEvents )
        {   
            objetoRemover.objEvents
            .getEventos()
            .forEach(function( eventos:ObjectEvents ){
                if( eventos.whenDestroy ){
                    eventos.whenDestroy.bind(objetoRemover)(objetoRemover);
                }
            });
        }

        //Remove o objeto da cena
        this.objects = this.objects.filter(function( obj:ObjectBase|ImaginaryObject ){
            if( obj.id != objetoRemover.id ){ return obj };
        });
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
    
            // Identifica quando o carregamento acabou
            if( context.loaded === false &&
                context.objects != undefined && 
                context.objects.length > 0
            ){
                context.loaded = true;
                context.onSceneLoad( context );
            }

            EngineBeforeLoop( context, 
                              context.renderer,
                              context.canvasRef,
                              context.player );
    
            //Outras coisas que vão acontecer
            const frameDelta = context.clockCamera.getDelta(); // Tempo entre frames
            
            //Atualiza o jogador
            context.player.Update( frameDelta );

            EngineLoop( context, 
                        context.renderer,
                        context.canvasRef,
                        context.player );

            context.updateObjects();

            // 1. Renderizar a cena normal para o framebuffer
            context.renderer.setRenderTarget(context.renderTarget);
            context.renderer.render( context.scene, 
                                     context.player.camera.getCamera() );

            // 2. Aplicar pós-processamento renderizando o quad fullscreen
            context.renderer.setRenderTarget(null); // Renderizar na tela   
            context.renderer.render( context.scene, 
                context.player.camera.getCamera() );
        }

        animate();

        // Chamar a função EngineMain
        EngineMain( this, 
                    this.renderer,
                    this.canvasRef,
                    this.player );

            
    }

    /**
    * Update all objects in the scene 
    */
    public updateObjects(): void{

        const context = this;

        const updatableObjects = Array<ObjectBase>(0).concat( this.objects )
                                                     .concat( this.additionalObjects );

        for( let i = 0 ; i < updatableObjects.length ; i++ )
        {
            const currentObject = updatableObjects[ i ];
            const currentObjectIndex = i;

            /**
            * Atualiza uma tabela com os nomes dos objetos
            */
            if( currentObject && currentObject.objProps )
            {
                if( currentObject.objProps.name != undefined ){
                    context.objectTableByName[ currentObject.objProps.name ] = currentObject;
                }
                if( currentObject.objProps.id != undefined ){
                    context.objectTableById[ currentObject.objProps.id ] = currentObject;
                }
            }

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
    //TODO: CONTINUAR ESSA LOGICA QUE TÁ BUGADA
    //BUG: ESSA FUNÇÂO FAZ A CAMERA FICAR UM POUCO ACIMA DO CHÂO QUANDO PULA PERTO DA CAIXA
    public updateJump() {
        /*
        const cameraMovement = this.camera.getMovement();

        if(cameraMovement.jumpVelocityY == undefined){
           cameraMovement.jumpVelocityY = 0;
        }

        // Se estiver pulando, aplicar o movimento vertical
        if (cameraMovement.isJumping == true && cameraMovement.stopJumpStartFallAgain == false ) {
            // Aplica a gravidade (reduz a velocidade vertical a cada frame)

            // Se está subindo, aplicamos a gravidade para diminuir a velocidade
            cameraMovement.jumpVelocityY -= this.gravity;  // Acelera negativamente para reduzir a velocidade de subida
            this.camera.getPosition().y += cameraMovement.jumpVelocityY;  // Move a câmera para cima
            this.camera.objectBase.isFalling = true
        }
            */
    }

    /*
    public updateJump(deltaTime: number) {
        const movement = this.camera.getMovement();
        const position = this.camera.getPosition();
    
        const GRAVITY = -9800; // unidades por segundo ao quadrado (ajuste conforme necessário)
        const JUMP_FORCE = 3500; // impulso inicial do pulo (ajuste conforme necessário)
        const TERMINAL_VELOCITY = -20000; // velocidade máxima de queda
    
        // Inicializa se ainda não tiver
        if (movement.jumpVelocityY === undefined) movement.jumpVelocityY = 0;
        if (movement.isJumping === undefined) movement.isJumping = false;
    
        // Se apertou o botão de pulo e está no chão
        if (movement.isJumping == true && this.camera.objectBase.isFalling == false ) {
            movement.jumpVelocityY = JUMP_FORCE;
            movement.isJumping = false; // Zera o sinal de pulo
        }
    
        // Aplica física do pulo
        if (movement.isJumping || this.camera.objectBase.isFalling) {
            // Aplica gravidade
            movement.jumpVelocityY += GRAVITY * deltaTime;
            movement.jumpVelocityY = Math.max(movement.jumpVelocityY, TERMINAL_VELOCITY);
    
            // Move a câmera com base na velocidade atual
            position.y += movement.jumpVelocityY * deltaTime;
    
            // Verifica se chegou ao chão
            if (position.y <= this.camera.objectBase.groundY) {
                //position.y = this.camera.objectBase.groundY;
                //movement.jumpVelocityY = 0;
                //movement.isJumping = false;
                //this.camera.objectBase.isFalling = false;
            } else {
                //this.camera.objectBase.isFalling = true;
            }
        }
    }*/

    public handleResize(){
        if (!this.canvasRef.current) return;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.player.camera.setAspect( window.innerWidth / window.innerHeight );
        this.player.camera.updateProjectionMatrix();
    }

}