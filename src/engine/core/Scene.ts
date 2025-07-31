/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import {globalContext}       from '../../engine/main.ts';
import AbstractObjectBase    from "./AbstractObjectBase.ts";
import ObjectEvents          from '../interfaces/main_engine/ObjectEvents.ts';
import CollisionTable        from '../interfaces/main_engine/CollisionTable.ts';
import ProximityTable        from '../interfaces/main_engine/ProximityTable.ts';
import CollisionBinaryTable  from '../interfaces/main_engine/CollisionBinaryTable.ts';
import ProximityBinaryTable  from '../interfaces/main_engine/ProximityBinaryTable.ts';
import ProximityBounds       from '../interfaces/main_engine/ProximityBounds.ts';
import isProximity           from '../utils/main_engine/isProximity.ts';
import isCollision           from '../utils/main_engine/isCollision.ts';
import Wind                  from '../interfaces/main_engine/Wind.ts';
import FrameCounter          from './FrameCounter.ts';
import MovementState         from '../interfaces/main_engine/MovementState.ts';
import InputListener         from "../input/InputListener.ts";
import SceneConfig           from "../interfaces/main_engine/SceneConfig.ts";
import Position3D            from "../interfaces/main_engine/Position3D.ts";
import VelocityStatus        from "../interfaces/main_engine/VelocityStatus.ts";
import ObjectVelocity        from "../interfaces/main_engine/ObjectVelocity.ts";
import Mapa                  from "../utils/dicionarios/Mapa.ts";
import LocalSound            from "./LocalSound.ts";
import { EngineMain }        from '../main'; // Importa a função EngineMain
import { EngineLoop }        from '../main'; // Importa a função EngineLoop
import { EngineBeforeLoop }  from '../main' //Importa a função EngineBeforeLoop
import { float, int, Ponteiro }          from "../types/types-cpp-like.ts";
import { LightInstance }     from './LightInstance.ts';
import { PipelineCallback } from 'stream';
import CameraInstance from './CameraInstance.ts';

export default class Scene
{
    public sceneConfig    : SceneConfig;
    public inputListener  : InputListener;
    public sceneCounter   : FrameCounter;

    public gravity                              : Position3D;
    public normalSpeed                          : float = 0.05;
    public slowSpeed                            : float = 0.05;
    public frameDeltaIntensification            : float = this.normalSpeed;
    public objectPhysicsUpdateRate              : float = 1; //Permite intensificar os efeitos da fisica nos objetos
    public objectPhysicsDesaceleracaoUpdateRate : float = 9.5; //Afeta a velocidade de desaceleracao de objetos
    public atrito                               : float = 1;
    public arrastoAr                            : float = 1;

    public objects               : Array<Ponteiro<AbstractObjectBase>>;
    public lights                : Array<Ponteiro<LightInstance>>;
    public sounds                : Array<Ponteiro<LocalSound>>;

    public cameras               : Array<Ponteiro<CameraInstance>>;
    public idCameraAtiva         : int;
    public refCameraAtiva        : Ponteiro<CameraInstance>;
    
    public objectTableById       : Mapa<string, Ponteiro<AbstractObjectBase>>;
    public objectTableByName     : Mapa<string, Ponteiro<AbstractObjectBase>>;

    public collisionTable        : CollisionTable;
    public collisionBinaryTable  : CollisionBinaryTable;
    public proximityTable        : ProximityTable;
    public proximityBinaryTable  : ProximityBinaryTable;

    /**
    * Configurações do vento para física
    */
    public wind     : Wind;
    public haveWind : boolean;

    constructor( sceneConfig:SceneConfig )
    {
        this.idCameraAtiva  = -1;
        this.refCameraAtiva = null;


        this.wind = {
            orientation : { x: 0.5, 
                            y: -0.1, 
                            z: 0.3},

            deslocationTrend: { x: 0.06, 
                                y: 0.01, 
                                z: 0.03},

            intensity   : { x: 0.5, 
                            y: 0.5, 
                            z: 0.5 }
        };

        this.haveWind  = sceneConfig.haveWind;

        this.gravity   = {x: 0, y: 0.8, z: 0};     // Gravidade que puxa para baixo
        this.atrito    = 1;      // Atrito usado na fisica de aceleração/desaceleracao de objetos
        this.arrastoAr = 1;    // Arrast do ar(afeta objetos com aceleração que estiverem no ar)

        this.sceneConfig   = sceneConfig;
        this.inputListener = sceneConfig.inputListener;
 
        this.sceneCounter  = new FrameCounter( 1000, 1000 );

        // Objetos
        this.objects = new Array<Ponteiro<AbstractObjectBase>>();

        // Luzes
        this.lights  = new Array<Ponteiro<LightInstance>>();

        // Sons locais
        this.sounds  = new Array<Ponteiro<LocalSound>>();

        // Cameras
        this.cameras = new Array<Ponteiro<CameraInstance>>();
            
        /**
        * ESSA INICIALIZAÇÂO ABAIXO NÂO PRECISA SER FEITA EM C++
        * Em C++ basta declarar as variaveis, e não precisa inicializar
        */

        // Tabela que vai manter os objetos indexados por ID
        this.objectTableById   = new Mapa<string, Ponteiro<AbstractObjectBase>>();
        // Tabela que vai manter os objetos indexados por Nome
        this.objectTableByName = new Mapa<string, Ponteiro<AbstractObjectBase>>();

        // Tabela de objetos colidindo com outros objetos
        this.collisionTable = {
            byName    : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>(),
            byID      : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>(),
            byClasses : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>()
        };

        // Tabela BINARIA de objetos colidindo com outros objetos
        this.collisionBinaryTable = {
            byName    : new Mapa<string, Mapa<string, boolean>>(),
            byID      : new Mapa<string, Mapa<string, boolean>>(),
            byClasses : new Mapa<string, Mapa<string, boolean>>()
        };

        // Tabela de objetos proximos de outros objetos
        this.proximityTable = {
            byName    : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>(),
            byID      : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>(),
            byClasses : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>()
        };

        // Tabela BINARIA de objetos colidindo com outros objetos
        this.proximityBinaryTable = {
            byName    : new Mapa<string, Mapa<string, boolean>>(),
            byID      : new Mapa<string, Mapa<string, boolean>>(),
            byClasses : new Mapa<string, Mapa<string, boolean>>()
        };
        /**
        * FIM DAS INICIALIZAÇÔES QUE NÂO PRECISAM EM C++ 
        */
    }

     /**
    * Obtem todas as cameras criadas no meu renderizador
    */
    getCameras(): Array<Ponteiro<CameraInstance>>
    {
        return this.cameras;
    }

    /**
    * Define a camera de numero TAL como sendo a visão do jogador 
    */
    setCameraAtiva( idCameraUsar:int ): void
    {   
        this.idCameraAtiva  = idCameraUsar;
        
        // Se for -1 significa que não é nenhuma, então, não posso fazer nada disso:
        // E não deixa acessar uma camera que não existe
        if( idCameraUsar > -1 && idCameraUsar <= this.cameras.length )
        {
            this.refCameraAtiva = this.cameras[ idCameraUsar ]; 

        }else{
            console.warn(`ID INVALIDO: A camera de ID: ${idCameraUsar}, não existe!`);
        }
    }

    /**
    * Obtem a camera ativa do momento
    */
    getCameraAtiva(): Ponteiro<CameraInstance>
    {
        return this.cameras[ this.idCameraAtiva ]; // Retorna a instancia da camera cujo id numerico é idCameraAtiva
        //OBS: não confuda o getCameraAtiva aqui da minha engine principal com o getCameraAtiva do meu renderizador. São distintos.
    }
    /**
    * Obtem o ID da camera ativa do momento
    */
    getIDCameraAtiva(): int
    {
        return this.idCameraAtiva;
    }


    public getObjects(): Array<Ponteiro<AbstractObjectBase>>
    {
        return this.objects;
    }

    public getGravity() : Position3D
    {
        return this.gravity;
    }

    public clearCollisionTable(): void
    {
        // Tabela de objetos colidindo com outros objetos
        this.collisionTable = {
            byName    : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>(),
            byID      : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>(),
            byClasses : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>()
        };

        /*
        this.collisionBinaryTable = {
            byName    : {},
            byID      : {},
            byClasses : {}
        };*/

        //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
        // ou se for um std:array pode usar .fill(nullptr) direto
    }

    public clearObjectCollisionFromTableByName( objectName: string ): void
    {
        this.collisionTable.byName[objectName] = [];
        //this.collisionBinaryTable.byName[objectName] = {};

        //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
        // ou se for um std:array pode usar .fill(nullptr) direto
    }

    public clearObjectCollisionFromTableByID( objectID: string ): void
    {
        this.collisionTable.byID[objectID] = [];
        //this.collisionBinaryTable.byID[objectID] = {};

        //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
        // ou se for um std:array pode usar .fill(nullptr) direto
    }

    public clearObjectCollisionFromTableByCLASSES( objectClasses: Array<string> ): void
    {
        const contexto = this;

        for( let i:int = 0; i < objectClasses.length; i++ )
        {
            const nomeClasse:string = objectClasses[i];

            contexto.collisionTable.byClasses[nomeClasse] = [];
            //contexto.collisionBinaryTable.byClasses[nomeClasse] = {};
        }

        //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
        // ou se for um std:array pode usar .fill(nullptr) direto
    }

    public clearProximityTable(): void
    {
        // Tabela de objetos proximos de outros objetos
        this.proximityTable = {
            byName    : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>(),
            byID      : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>(),
            byClasses : new Mapa<string, Array<Ponteiro<AbstractObjectBase>>>()
        };

        /*
        this.proximityBinaryTable = {
            byName    : {},
            byID      : {},
            byClasses : {}
        };*/

        //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
        // ou se for um std:array pode usar .fill(nullptr) direto
    }

    public clearObjectProximityFromTableByName( objectName: string ): void
    {
        this.proximityTable.byName[objectName] = [];
        this.collisionBinaryTable.byName[objectName] = {};

        //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
        // ou se for um std:array pode usar .fill(nullptr) direto
    }

    public clearObjectProximityFromTableByID( objectID: string ): void
    {
        this.proximityTable.byID[objectID] = [];
        this.collisionBinaryTable.byName[objectID] = {};

        //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
        // ou se for um std:array pode usar .fill(nullptr) direto
    }

    public clearObjectProximityFromTableByCLASSES( objectClasses: Array<string> ): void
    {
        const contexto = this;

        for( let i:int = 0; i < objectClasses.length; i++ )
        {
            const nomeClasse:string = objectClasses[i];
            
            contexto.proximityTable.byClasses[nomeClasse] = [];
            //contexto.collisionBinaryTable.byClasses[nomeClasse] = {};
        }

        //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
        // ou se for um std:array pode usar .fill(nullptr) direto
    }

    /**
    * Verifica se dois objetos na cena estão proximos um do outro
    * Pode ser tanto pelo "name" quanto pelo "id"
    * 
    * @param objA 
    * @param objB 
    * @returns {boolean}
    */
    public queryIfObjectIsProximityOf( objA: Ponteiro<AbstractObjectBase>, objB: Ponteiro<AbstractObjectBase>, limites:ProximityBounds ): boolean
    {
        // Se os ponteiros não forem nulos
        if( objA != null && objB != null )
        {
            // Se vai usar o calculo da propia Engine mesmo, nos limites que ela ja calculou
            if( limites == null )
            {
                // Se a chave objA.name e objB.name existem no mapa proximityBinaryTable, acessa
                if( this.proximityBinaryTable.byName[ objA.name ] != null && this.proximityBinaryTable.byName[ objA.name ][ objB.name ] != null  )
                {
                    return this.proximityBinaryTable.byName[ objA.name ][ objB.name ] == true;
                }

            //Se tem limites personalizados vai fazer um novo calculo
            }else{
                return isProximity( objA, objB, limites ) == true;
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
    public queryIfObjectIsCollisionOf( objA: Ponteiro<AbstractObjectBase>, objB: Ponteiro<AbstractObjectBase>, limites:ProximityBounds ): boolean
    {
        // Se os ponteiros não forem nulos
        if( objA != null && objB != null )
        {
            // Se vai usar o calculo da propia Engine mesmo, nos limites que ela ja calculou
            if( limites == null )
            {
                // Se a chave objA.name e objB.name existem no mapa collisionBinaryTable, acessa
                if( this.collisionBinaryTable.byName[ objA.name ] != null && this.collisionBinaryTable.byName[ objA.name ][ objB.name ] != null  )
                {
                    return this.collisionBinaryTable.byName[ objA.name ][ objB.name ] == true;
                }

            //Se tem limites personalizados vai fazer um novo calculo
            }else{
                return isCollision( objA, objB, limites ) == true;
            }
        }

        return false;
    }

    /**
    * Traz um objeto pelo ID
    */
    public getObjectByID( objectId:string ): Ponteiro<AbstractObjectBase>{
        return this.objectTableById[ objectId ];
    }

    /**
    * Traz um objeto pelo Nome
    */
    public getObjectByName( objectId:string ): Ponteiro<AbstractObjectBase>{
        return this.objectTableByName[ objectId ];
    }

    /**
    * Traz um objeto pelo Nome ou ID
    */
    public getObjectBySomething( objectIdOrName:string ): Ponteiro<AbstractObjectBase>{
        return this.getObjectByID(objectIdOrName) || this.getObjectByName(objectIdOrName);
    }

    /**
    * Adiciona um som na cena
    */
    public addSound( som:Ponteiro<LocalSound> ): void
    {
        this.sounds.push( som );
    }

    /**
    * Adiciona um objeto na cena
    */
    public criarObjeto( objeto:Ponteiro<AbstractObjectBase> ): void{
        this.objects.push( objeto );
    }

    /**
    * Adiciona uma luz na cena 
    */
    public criarLuz( luz:Ponteiro<LightInstance> ): void
    {
        this.lights.push( luz );
    }

    /**
    * Adiciona uma camera na cena 
    */
    public criarCamera( camera: Ponteiro<CameraInstance> ) : void
    {
        this.cameras.push( camera );
    }

    /**
    * Remove um objeto da cena
    */
    public remove( objetoRemover:Ponteiro<AbstractObjectBase> ): void
    {
        const scene            : Ponteiro<Scene>                     = this;
        const novosObjetosCena : Array<Ponteiro<AbstractObjectBase>> = new Array();

        //Se tem o evento whenDestroy, executa ele
        if( objetoRemover != null && objetoRemover.objEvents )
        {   
            const eventosDoObjeto : Array<ObjectEvents>  = objetoRemover.objEvents.getEventos();

            for( let i:int = 0; i < eventosDoObjeto.length; i++ )
            {
                const eventos:ObjectEvents = eventosDoObjeto[i];

                if( eventos.whenDestroy ){
                    eventos.whenDestroy.bind(objetoRemover)(objetoRemover);
                }
            }
        }

        //Remove o objeto da cena
        for( let i:int = 0 ; i < scene.objects.length ; i++ )
        {
            const objetoAtual : Ponteiro<AbstractObjectBase> = scene.objects[i];

            // Se nao for o objeto que queremos remover, mantem
            if( objetoRemover != null && objetoAtual != null && 
                objetoAtual.id != objetoRemover.id 
            ){ 
                novosObjetosCena.push( objetoAtual );
            }
        }

        this.objects = novosObjetosCena;
    }

    //Função que chama o loop "animate"
    public loop( frameDelta: float, 
                 frameNumber: int,
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

        context.updateSounds( firstRender, renderizadorPronto, frameDelta, frameNumber );

        if( firstRender == true )
        {
            // Chamar a função EngineMain
            EngineMain( this, firstRender, renderizadorPronto, frameDelta, frameNumber );
        }

            
    }

    /**
    * Update in general  
    */
    public updateGeneral( firstRender:boolean, renderizadorPronto:boolean, frameDelta:float, frameNumber: int )
    {
        this.updateCollisionReactions(firstRender, renderizadorPronto, frameDelta, frameNumber);
    }

    /**
    * Update object collision reaction 
    */
    public updateCollisionReactions(firstRender:boolean, renderizadorPronto:boolean, frameDelta:float, frameNumber: int)
    {
        const objetosCena: Array<Ponteiro<AbstractObjectBase>> = this.objects;

        for (let i:int = 0; i < objetosCena.length; i++) 
        {
            for (let j:int = 0; j < objetosCena.length; j++) 
            {
                /**
                * Ambos os objetos envolvidos: A e B, respectivamente
                */
                const objetoA   : Ponteiro<AbstractObjectBase>  = objetosCena[i];
                const objetoB   : Ponteiro<AbstractObjectBase>  = objetosCena[j];

                if( objetoA != null && objetoB != null )
                {
                    /**
                    * Parametros do objeto A 
                    */
                    const movementA : MovementState                 = objetoA.movimentSinalyzer;
                    const velocidadeX_objetoA = objetoA.getVelocity().x;
                    const velocidadeY_objetoA = objetoA.getVelocity().y;
                    const velocidadeZ_objetoA = objetoA.getVelocity().z;

                    /**
                    * Parametros do objeto B 
                    */
                    const movementB : MovementState                 = objetoB.movimentSinalyzer;
                    const velocidadeX_objetoB = objetoB.getVelocity().x;
                    const velocidadeY_objetoB = objetoB.getVelocity().y;
                    const velocidadeZ_objetoB = objetoB.getVelocity().z;

                    /**
                    * Parametros da perca e tranferencia de velocidade 
                    */
                    const porcentagemPerca : float  = 90; // Porcentagem de perca de velocidade ao colidir

                    if( objetoA.name != "Player" && objetoB.name != "Player" )
                    {
                    // Para cada objeto da cena, verifica se ele colidiu com o objeto atual, para aplicar a tranferencia e perca de velocidade 
                    //Se houve colisão com ele
                    if( objetoA.isCollisionOf(objetoB, {x: 0.001, y: 0.001, z: 0.001} ) == true && 
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
                                const percaX_objetoA           : float   = (porcentagemPerca/100) * velocidadeX_objetoA;
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
                                const percaZ_objetoA         : float   = (porcentagemPerca/100) * velocidadeZ_objetoA;
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
                                const percaX_objetoB           : float   = (porcentagemPerca/100) * velocidadeX_objetoB;
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
                                const percaZ_objetoB         : float   = (porcentagemPerca/100) * velocidadeZ_objetoB;
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
    }

    /**
    * Update all objects in the scene 
    */
    public updateObjects( firstRender: boolean, renderizadorPronto: boolean, frameDelta:float, frameNumber: int ): void
    {

        const context      = this;
        const currentScene = context;

        const updatableObjects = this.objects;

        for( let i:int = 0 ; i < updatableObjects.length ; i++ )
        {
            const currentObject : Ponteiro<AbstractObjectBase>   = updatableObjects[ i ];
        
            // Se o ponteiro não está nulo
            if( currentObject != null )
            {
                const velocityBeforeUpdate : ObjectVelocity                 = {... currentObject.getVelocity()}; // Faz uma copia sem referencia
                const velocitySinalyzerBeforeUpdate: VelocityStatus         = {... currentObject.velocitySinalyzer}; // Faz uma copia sem referencia
                const currentObjectIndex : int = i;

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
                    currentObject.setScene( currentScene );

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

    }

    // Update all sounds in the scene
    updateSounds( firstRender: boolean, renderizadorPronto: boolean, frameDelta:float, frameNumber: int ): void
    {
        const context = this;
        const sounds  = this.sounds;

        for( let i:int = 0 ; i < sounds.length ; i++ )
        {
            const currentSound = sounds[ i ];
            const currentSoundIndex = i;

            // Se o ponteiro não é nulo
            if( currentSound != null )
            {
                 /**
                 * Repass some important informations into the  "currentObject"
                 */
                 currentSound.scene  = this;
                 currentSound.player = null; // Define o player dentro do som

                 // Atualiza o som
                 currentSound.updateSound();
            }
        }
    }
}