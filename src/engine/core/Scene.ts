/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import Base from "./Base";
import { EngineMain } from '../main'; // Importa a função EngineMain
import { EngineLoop } from '../main'; // Importa a função EngineLoop
import { EngineBeforeLoop } from '../main' //Importa a função EngineBeforeLoop
import ObjectBase from './ObjectBase';
import isObjectBase from '../utils/isObjectBase';
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
import FrameCounter from './FrameCounter.ts';
import MovementState from '../interfaces/MovementState.ts';
import InputListener from "../input/InputListener.ts";
import SceneConfig from "../interfaces/SceneConfig.ts";
import Camera from "./Camera.ts";
import Position3D from "../interfaces/Position3D.ts";
import VelocityStatus from "../interfaces/VelocityStatus.ts";
import ObjectVelocity from "../interfaces/ObjectVelocity.ts";

export default class Scene extends Base{

    public sceneConfig:SceneConfig;
    public inputListener:InputListener;
    
    public sceneCounter:FrameCounter;
    public normalSpeed = 1;
    public slowSpeed = 0.05;
    public frameDeltaIntensification:number = this.normalSpeed;
    public objectPhysicsUpdateRate:number = 1; //Permite intensificar os efeitos da fisica nos objetos
    public objectPhysicsDesaceleracaoUpdateRate:number = 9.5; //Afeta a velocidade de desaceleracao de objetos

    public gravity:Position3D;
    public atrito:number = 1;
    public arrastoAr:number = 1;

    public objects:ObjectBase[];
    public additionalObjects:ObjectBase[];

    public cameras:Camera[];
    
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
    public haveWind:boolean;

    constructor( sceneConfig:SceneConfig ){
        super();
    
        this.wind = {
            orientation : { x: 0.5, 
                            y: -0.1, 
                            z: 0.3},

            deslocationTrend: { x: 0.08, 
                                y: 0.01, 
                                z: 0.05},

            intensity   : { x: 1, 
                            y: 1, 
                            z: 1 }
        };

        this.haveWind = sceneConfig.haveWind;

        this.gravity = {x: 0, y: 0.8, z: 0};     // Gravidade que puxa para baixo
        this.atrito  = 1;      // Atrito usado na fisica de aceleração/desaceleracao de objetos
        this.arrastoAr = 1;    // Arrast do ar(afeta objetos com aceleração que estiverem no ar)

        this.sceneConfig   = sceneConfig;
        this.inputListener = sceneConfig.inputListener;
 
        this.sceneCounter  = new FrameCounter( 1000, 1000 );

        this.objects = [];

        //Here, we will put only object references(the instances), to be updated too, if they not are in the objects array.
        this.additionalObjects = [];

        // Cameras
        this.cameras = [];
            

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
    public getObjectByID( objectId:string ): ObjectBase|ImaginaryObject{
        return this.objectTableById[ objectId ];
    }

    /**
    * Traz um objeto pelo Nome
    */
    public getObjectByName( objectId:string ): ObjectBase|ImaginaryObject{
        return this.objectTableByName[ objectId ];
    }

    /**
    * Traz um objeto pelo Nome ou ID
    */
    public getObjectBySomething( objectIdOrName:string ): ObjectBase|ImaginaryObject{
        return this.getObjectByID(objectIdOrName) || this.getObjectByName(objectIdOrName);
    }

    /**
    * Adiciona um objeto na cena
    */
    public add( objeto:ObjectBase ): void{
        this.objects.push( objeto );
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
    public loop( frameDelta: number, 
                 frameNumber: number,
                 firstRender: boolean = true, 
                 renderizadorPronto: boolean = false 
    ){
        const context = this;

        EngineBeforeLoop( context, frameDelta, frameNumber, firstRender, renderizadorPronto );
    
        EngineLoop( context, 
                    firstRender,
                    renderizadorPronto,
                    frameDelta,
                    frameNumber );

        context.updateGeneral( firstRender, renderizadorPronto, frameDelta, frameNumber );

        context.updateObjects( firstRender, renderizadorPronto, frameDelta, frameNumber );

        context.updateCameras( firstRender, renderizadorPronto, frameDelta, frameNumber );

        if( firstRender == true )
        {
            // Chamar a função EngineMain
            EngineMain( this, firstRender, renderizadorPronto, frameDelta, frameNumber );
        }

            
    }

    /**
    * Update in general  
    */
    public updateGeneral( firstRender:boolean, renderizadorPronto:boolean, frameDelta:number, frameNumber: number )
    {
        this.updateCollisionReactions(firstRender, renderizadorPronto, frameDelta, frameNumber);
    }

    /**
    * Update object collision reaction 
    */
    public updateCollisionReactions(firstRender:boolean, renderizadorPronto:boolean, frameDelta:number, frameNumber: number)
    {
        const objetosCena: ObjectBase[] = this.objects;

        for (let i = 0; i < objetosCena.length; i++) 
        {
            for (let j = 0; j < objetosCena.length; j++) 
            {
                /**
                * Parametros do objeto A 
                */
                const objetoA   : ObjectBase    = objetosCena[i];
                const movementA : MovementState = objetoA.movimentSinalyzer;

                const velocidadeX_objetoA = objetoA.getVelocity().x;
                const velocidadeY_objetoA = objetoA.getVelocity().y;
                const velocidadeZ_objetoA = objetoA.getVelocity().z;

                /**
                * Parametros do objeto B 
                */
                const objetoB   : ObjectBase    = objetosCena[j];
                const movementB : MovementState = objetoB.movimentSinalyzer;

                const velocidadeX_objetoB = objetoB.getVelocity().x;
                const velocidadeY_objetoB = objetoB.getVelocity().y;
                const velocidadeZ_objetoB = objetoB.getVelocity().z;

                /**
                * Parametros da perca e tranferencia de velocidade 
                */
                const porcentagemPerca : number  = 90; // Porcentagem de perca de velocidade ao colidir

                if( objetoA.name != "Player" && objetoB.name != "Player" )
                {
                   // Para cada objeto da cena, verifica se ele colidiu com o objeto atual, para aplicar a tranferencia e perca de velocidade 
                   //Se houve colisão com ele
                   if( objetoA.isCollisionOf(objetoB, 0.001) == true && 
                       //Se nao for o objeto abaixo dele
                       (objetoA.objectBelow == null || objetoB.id != objetoA.objectBelow.id) &&
                       //Se nao for ele mesmo
                       (objetoA.id != objetoB.id) &&
                       (objetoB.objProps.collide == true) &&
                       (objetoA.objProps.collide == true) &&
                       (objetoB.name != 'Chao')
                    ){
                    
                        //Se o objeto A é quem está se movendo
                        //No eixo X
                        if( velocidadeX_objetoA != 0 )
                        {
                            const percaX_objetoA : number  = (porcentagemPerca/100) * velocidadeX_objetoA;
                            const objetoA_isMovingForward  : boolean = movementA.forward  ? true : false;
                            const objetoA_isMovingBackward : boolean = movementA.backward ? true : false;

                            // Se for um outro objeto que tambem tem fisica
                            if( objetoB.objProps.havePhysics == true && objetoB.objProps.collide == true )
                            {
                                if( objetoA_isMovingForward ){
                                    objetoA.getVelocity().x -= percaX_objetoA;

                                    // Transfere essa velocidade que ele perdeu para o colisor( se ele tiver fisica )
                                    if( objetoB.objProps.havePhysics == true && objetoB.objProps.collide == true )
                                    {
                                        objetoB.getVelocity().x += percaX_objetoA;
                                    }

                                }else if( objetoA_isMovingBackward ){
                                    objetoA.getVelocity().x += percaX_objetoA;

                                    // Transfere essa velocidade que ele perdeu para o colisor( se ele tiver fisica )
                                    if( objetoB.objProps.havePhysics == true && objetoB.objProps.collide == true )
                                    {
                                        objetoB.getVelocity().x -= percaX_objetoA;
                                    }
                                }
                            }

                            // Se for uma parede ou um objeto que não pode se mover
                            if( objetoB.objProps.havePhysics == false && objetoB.objProps.collide == true )
                            {
                                /**
                                * Nesse caso, ao bater no objeto sem fisica ou parede, 
                                * o jogo devolve pra ele a energia que ele perdeu só que reduzida, para que ele recocheteie de forma realista
                                *
                                * Pra um objeto colisor que não tem fisica, quem bateu vai perder velocidade de um jeito diferente:
                                */
                                const porcentoPerdaBatida    = 30;
                                const percaEnergiaBatida     = ((porcentoPerdaBatida/100 * objetoA.getVelocity().x) );
                                const velocidadeAposBatida   = (objetoA.getVelocity().x - percaEnergiaBatida);
                                const velocidadeXInvertida   = velocidadeAposBatida * -1;

                                // inverte a velocidade para fazer o objeto ir para traz
                                objetoA.setVelocityX( velocidadeXInvertida );
                            }
                        }
                        //No eixo Z
                        if( velocidadeZ_objetoA != 0 )
                        {
                            const percaZ_objetoA : number  = (porcentagemPerca/100) * velocidadeZ_objetoA;
                            const objetoA_isMovingRight  : boolean = movementA.right  ? true : false;
                            const objetoA_isMovingLeft   : boolean = movementA.left   ? true : false;

                            // Se for um outro objeto que tambem tem fisica
                            if( objetoB.objProps.havePhysics == true && objetoB.objProps.collide == true )
                            {
                                if( objetoA_isMovingRight ){
                                    objetoA.getVelocity().z -= percaZ_objetoA;

                                    // Transfere essa velocidade que ele perdeu para o colisor( se ele tiver fisica )
                                    if( objetoB.objProps.havePhysics == true && objetoB.objProps.collide == true )
                                    {
                                        objetoB.getVelocity().z += percaZ_objetoA;
                                    }

                                }else if( objetoA_isMovingLeft ){
                                    objetoA.getVelocity().z += percaZ_objetoA;

                                    // Transfere essa velocidade que ele perdeu para o colisor( se ele tiver fisica )
                                    if( objetoB.objProps.havePhysics == true && objetoB.objProps.collide == true )
                                    {
                                        objetoB.getVelocity().z -= percaZ_objetoA;
                                    }
                                }
                            }

                            // Se for uma parede ou um objeto que não pode se mover
                            if( objetoB.objProps.havePhysics == false && objetoB.objProps.collide == true )
                            {
                                /**
                                * Nesse caso, ao bater no objeto sem fisica ou parede, 
                                * o jogo devolve pra ele a energia que ele perdeu só que reduzida, para que ele recocheteie de forma realista
                                *
                                * Pra um objeto colisor que não tem fisica, quem bateu vai perder velocidade de um jeito diferente:
                                */
                                const porcentoPerdaBatida    = 30;
                                const percaEnergiaBatida     = ((porcentoPerdaBatida/100 * objetoA.getVelocity().z) );
                                const velocidadeAposBatida   = (objetoA.getVelocity().x - percaEnergiaBatida);
                                const velocidadeZInvertida   = velocidadeAposBatida * -1;

                                // inverte a velocidade para fazer o objeto ir para traz
                                objetoA.setVelocityZ( velocidadeZInvertida );
                            }
                        }

                        //Se o objeto B é quem está se movendo
                        //No eixo X
                        if( velocidadeX_objetoB != 0  )
                        {
                            const percaX_objetoB : number  = (porcentagemPerca/100) * velocidadeX_objetoB;
                            const objetoB_isMovingForward  : boolean = movementB.forward  ? true : false;
                            const objetoB_isMovingBackward : boolean = movementB.backward ? true : false;

                            // Se for um outro objeto que tambem tem fisica
                            if( objetoA.objProps.havePhysics == true && objetoA.objProps.collide == true )
                            {
                                if( objetoB_isMovingForward ){
                                    objetoB.getVelocity().x -= percaX_objetoB;

                                    // Transfere essa velocidade que ele perdeu para o colisor( se ele tiver fisica )
                                    if( objetoA.objProps.havePhysics == true && objetoA.objProps.collide == true )
                                    {
                                        objetoA.getVelocity().x += percaX_objetoB;
                                    }

                                }else if( objetoB_isMovingBackward ){
                                    objetoB.getVelocity().x -= percaX_objetoB;

                                    // Transfere essa velocidade que ele perdeu para o colisor( se ele tiver fisica )
                                    if( objetoA.objProps.havePhysics == true && objetoA.objProps.collide == true )
                                    {
                                        objetoA.getVelocity().x += percaX_objetoB;
                                    }
                                }
                            }

                            // Se for uma parede ou um objeto que não pode se mover
                            if( objetoA.objProps.havePhysics == false && objetoA.objProps.collide == true )
                            {
                                /**
                                * Nesse caso, ao bater no objeto sem fisica ou parede, 
                                * o jogo devolve pra ele a energia que ele perdeu só que reduzida, para que ele recocheteie de forma realista
                                *
                                * Pra um objeto colisor que não tem fisica, quem bateu vai perder velocidade de um jeito diferente:
                                */
                                const porcentoPerdaBatida    = 30;
                                const percaEnergiaBatida     = ((porcentoPerdaBatida/100 * objetoB.getVelocity().x) );
                                const velocidadeAposBatida   = (objetoB.getVelocity().x - percaEnergiaBatida);
                                const velocidadeXInvertida   = velocidadeAposBatida * -1;

                                // inverte a velocidade para fazer o objeto ir para traz
                                objetoB.setVelocityX( velocidadeXInvertida );
                            }
                        }
                        //No eixo Z
                        if( velocidadeZ_objetoB != 0  )
                        {
                            const percaZ_objetoB : number  = (porcentagemPerca/100) * velocidadeZ_objetoB;
                            const objetoB_isMovingRight  : boolean = movementB.right  ? true : false;
                            const objetoB_isMovingLeft   : boolean = movementB.left   ? true : false;

                            // Se for um outro objeto que tambem tem fisica
                            if( objetoA.objProps.havePhysics == true && objetoA.objProps.collide == true )
                            {
                                if( objetoB_isMovingRight ){
                                    objetoB.getVelocity().z -= percaZ_objetoB;

                                    // Transfere essa velocidade que ele perdeu para o colisor( se ele tiver fisica )
                                    if( objetoA.objProps.havePhysics == true && objetoA.objProps.collide == true )
                                    {
                                        objetoA.getVelocity().z += percaZ_objetoB;
                                    }

                                }else if( objetoB_isMovingLeft ){
                                    objetoB.getVelocity().z -= percaZ_objetoB;

                                    // Transfere essa velocidade que ele perdeu para o colisor( se ele tiver fisica )
                                    if( objetoA.objProps.havePhysics == true && objetoA.objProps.collide == true )
                                    {
                                        objetoA.getVelocity().z += percaZ_objetoB;
                                    }
                                }
                            }

                            // Se for uma parede ou um objeto que não pode se mover
                            if( objetoA.objProps.havePhysics == false && objetoA.objProps.collide == true )
                            {
                                /**
                                * Nesse caso, ao bater no objeto sem fisica ou parede, 
                                * o jogo devolve pra ele a energia que ele perdeu só que reduzida, para que ele recocheteie de forma realista
                                *
                                * Pra um objeto colisor que não tem fisica, quem bateu vai perder velocidade de um jeito diferente:
                                */
                                const porcentoPerdaBatida    = 30;
                                const percaEnergiaBatida     = ((porcentoPerdaBatida/100 * objetoB.getVelocity().z) );
                                const velocidadeAposBatida   = (objetoB.getVelocity().x - percaEnergiaBatida);
                                const velocidadeZInvertida   = velocidadeAposBatida * -1;

                                // inverte a velocidade para fazer o objeto ir para traz
                                objetoB.setVelocityZ( velocidadeZInvertida );
                            }
                        }
                    }
                }

            }
        }
    }

    /**
    * Update all objects in the scene 
    */
    public updateObjects( firstRender: boolean, renderizadorPronto: boolean, frameDelta:number, frameNumber: number ): void
    {

        const context = this;

        const updatableObjects = Array<ObjectBase>(0).concat( this.objects )
                                                     .concat( this.additionalObjects );

        for( let i = 0 ; i < updatableObjects.length ; i++ )
        {
            const currentObject     : ObjectBase                = updatableObjects[ i ];
            const velocityBeforeUpdate : ObjectVelocity         = {... currentObject.getVelocity()}; // Faz uma copia sem referencia
            const velocitySinalyzerBeforeUpdate: VelocityStatus = {... currentObject.velocitySinalyzer}; // Faz uma copia sem referencia
            const currentObjectIndex : number = i;

            /**
            * Atualiza uma tabela com os nomes dos objetos
            */
            if( currentObject && currentObject.objProps )
            {
                if( currentObject.objProps.name != "" ){
                    context.objectTableByName[ currentObject.objProps.name ] = currentObject;
                }
                if( currentObject.id != "" ){
                    context.objectTableById[ currentObject.id ] = currentObject;
                }
            }

            try{
                /**
                * Repass some important informations into the  "currentObject"
                */
                currentObject.scene = this;

                if( this.sceneConfig.enable_advanced_frame_tracking )
                {
                    /**
                    * Salva o status atual deste objeto ANTES DA ATUALIZACAO frame no historico do objeto 
                    */
                    currentObject.frameHistory.logObject( "beforeUpdate", firstRender, renderizadorPronto, frameDelta, frameNumber );
                }

                /**
                * Update the object 
                */
                currentObject.updateObject( firstRender, renderizadorPronto, frameDelta, frameNumber );

                if( this.sceneConfig.enable_advanced_frame_tracking )
                {
                    /**
                    * Salva o status atual deste objeto APOS A ATUALIZACAO este frame no historico do objeto 
                    */
                    currentObject.frameHistory.logObject( "afterUpdate", firstRender, renderizadorPronto, frameDelta, frameNumber );
                }

                /**
                * Atualiza o status instantaneo da velocidade(em cada eixo, se está aumentando, diminuindo, etc...) referente ao frame anterior
                */
                currentObject.updateVelocitySinalyzer( velocityBeforeUpdate, velocitySinalyzerBeforeUpdate, firstRender, renderizadorPronto, frameDelta, frameNumber );

            }catch(e){
                console.log(e)
            }
        }

    }

    /**
    * Update all cameras in the scene
    */
    updateCameras( firstRender: boolean, renderizadorPronto: boolean, frameDelta:number, frameNumber: number  ): void
    {
        const context = this;
        const cameras = this.cameras;

        for( let i = 0 ; i < cameras.length ; i++ )
        {
            const currentCamera = cameras[ i ];
            const currentCameraIndex = i;

            /**
            * Atualiza uma tabela com os nomes dos objetos
            */
            if( currentCamera && currentCamera.objProps && currentCamera.getStatus() == true )
            {
                if( currentCamera.objProps.name != "" ){
                    context.objectTableByName[ currentCamera.objProps.name ] = currentCamera;
                }
                if( currentCamera.id != "" ){
                    context.objectTableById[ currentCamera.id ] = currentCamera;
                }
            }

            try{
                /**
                * Repass some important informations into the  "currentObject"
                */
                currentCamera.scene = this;

                /**
                * Update the object 
                */
                currentCamera.updateCamera( firstRender, renderizadorPronto, frameDelta, frameNumber );

            }catch(e){
                console.log('CAMERA ERRO', e);
            }
        }
    }

    getCameraByIndex( cameraIndex: number ){
        this.cameras[ cameraIndex ];
    }

}