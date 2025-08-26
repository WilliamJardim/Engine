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
import ArmazenadorEntradaTecladoMouse from './input/ArmazenadorEntradaTecladoMouse.ts';
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
import Player from './Player.ts';
import Position2D from '../interfaces/main_engine/Position2D.ts';
import KeyDetection from '../interfaces/both_engines/KeyDetection.ts';
import ObjectAcceleration from '../interfaces/main_engine/ObjectAcceleration.ts';
import ObjectForce from '../interfaces/main_engine/ObjectForce.ts';
import ObjectEventLayer from '../interfaces/main_engine/ObjectEventBlock.ts';
import includeString from '../utils/array/includeString.ts';
import objectANOTHaveSomeClassesIgnoredByObjectB from '../utils/main_engine/array/objectANOTHaveSomeClassesIgnoredByObjectB.ts';
import getDistance from '../utils/main_engine/getDistance.ts';
import ObjectAttachment from '../interfaces/main_engine/ObjectAttachment.ts';

export default class Scene
{
    public sceneConfig           : SceneConfig;
    public armazenamentoEntrada  : Ponteiro<ArmazenadorEntradaTecladoMouse>;
    public sceneCounter          : FrameCounter;
    public LimiteFPS             : int; // Vai receber do RenderizadorCena.ts, apenas pra consulta

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

    // Informações sobre o teclado e mouse
    public infoPosicaoMouse      : Position2D;
    public infoTeclasTeclado     : KeyDetection;

    public cameras               : Array<Ponteiro<CameraInstance>>;
    public idCameraAtiva         : int;   // O ID da camera atual é um numero
    public refCameraAtiva        : Ponteiro<CameraInstance>;

    public jogadores             : Array<Ponteiro<Player>>;
    public idJogadorAtivo        : string; // o ID do jogador atual é uma string.
    
    public usarTrocaCameraLivre  : boolean; // Se for true, permite que eu mude a camera a qualquer momento. Pensei nisso para poder criar cenas externas a visão do jogador

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

        this.idJogadorAtivo = "NENHUM";

        this.LimiteFPS = sceneConfig.LimiteFPS; // Vai receber do RenderizadorCena.ts, apenas pra consulta

        // Informações sobre o teclado e mouse(vão ser atualizadas via função atualizarDadosTecladoMouse)
        this.infoPosicaoMouse = {
            x: 0,
            y: 0,
        }
        this.infoTeclasTeclado = { 
                               SHIFT      : false,
                               W          : false,
                               A          : false,
                               S          : false,
                               D          : false,
                               ArrowUp    : false,
                               ArrowDown  : false,
                               ArrowLeft  : false,
                               ArrowRight : false 
                            };

        this.usarTrocaCameraLivre = false; // Se for true, permite que eu mude a camera a qualquer momento. Pensei nisso para poder criar cenas externas a visão do jogador

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

        this.sceneConfig          = sceneConfig;
        this.armazenamentoEntrada = sceneConfig.armazenamentoEntrada;
 
        this.sceneCounter  = new FrameCounter( 1000, 1000 );

        // Objetos
        this.objects = new Array<Ponteiro<AbstractObjectBase>>();

        // Luzes
        this.lights  = new Array<Ponteiro<LightInstance>>();

        // Sons locais
        this.sounds  = new Array<Ponteiro<LocalSound>>();

        // Cameras
        this.cameras = new Array<Ponteiro<CameraInstance>>();

        // Jogadores
        this.jogadores = new Array<Ponteiro<Player>>();
            
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
    * Chamado no arquivo principal, para atualizar as informações de teclado e mouse, que serão usadas por exemplo nos calculos de movimentação e rotação da camera do jogador
    */
    receberInformacoesTecladoMouse( infoPosicaoMouse: Position2D, infoTeclasTeclado: KeyDetection ): void
    {
        // Atualiza a posição do mouse, do meu renderizador
        this.infoPosicaoMouse.x = infoPosicaoMouse.x;
        this.infoPosicaoMouse.y = infoPosicaoMouse.y;

        // Atualiza as teclas do teclado
        this.infoTeclasTeclado.W = infoTeclasTeclado.W;
        this.infoTeclasTeclado.A = infoTeclasTeclado.A;
        this.infoTeclasTeclado.S = infoTeclasTeclado.S;
        this.infoTeclasTeclado.D = infoTeclasTeclado.D;
        this.infoTeclasTeclado.ArrowUp    = infoTeclasTeclado.ArrowUp;
        this.infoTeclasTeclado.ArrowDown  = infoTeclasTeclado.ArrowDown;
        this.infoTeclasTeclado.ArrowLeft  = infoTeclasTeclado.ArrowLeft;
        this.infoTeclasTeclado.ArrowRight = infoTeclasTeclado.ArrowRight;
        this.infoTeclasTeclado.SHIFT      = infoTeclasTeclado.SHIFT;
    }

    /**
    * Obtem todas as cameras criadas no meu renderizador
    */
    public getCameras(): Array<Ponteiro<CameraInstance>>
    {
        return this.cameras;
    }

    /**
    * Define a camera de numero TAL como sendo a visão do jogador 
    */
    public setCameraAtiva( idCameraUsar:int ): void
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
    public getCameraAtiva(): Ponteiro<CameraInstance>
    {
        return this.cameras[ this.idCameraAtiva ]; // Retorna a instancia da camera cujo id numerico é idCameraAtiva
        //OBS: não confuda o getCameraAtiva aqui da minha engine principal com o getCameraAtiva do meu renderizador. São distintos.
    }
    /**
    * Obtem o ID da camera ativa do momento
    */
    public getIDCameraAtiva(): int
    {
        return this.idCameraAtiva;
    }

    /**
    * Ativa o modo de troca de camera livre
    * Permite que eu mude a camera atual do renderizador a qualquer momento
    * Desativa a atribuição automatica da camera do jogador atual como sendo a camera ativa.
    */
    public ativarTrocaCameraLivre() : void
    {
        this.usarTrocaCameraLivre = true;
    }

    /**
    * Desativa o modo de troca de camera livre
    * Permite que a Engine bloqueie a camera atual, para que ela sempre seja a camera do jogador ativo
    */
    public desativarTrocaCameraLivre(): void
    {
        this.usarTrocaCameraLivre = false;
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
                return isCollision( objA, objB, limites ) == true;
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

        context.atualizarCameraAtual( firstRender, renderizadorPronto, frameDelta, frameNumber );

        context.updateGeneral( firstRender, renderizadorPronto, frameDelta, frameNumber );

        context.updateObjects( firstRender, renderizadorPronto, frameDelta, frameNumber );

        context.updateSounds( firstRender, renderizadorPronto, frameDelta, frameNumber );

        context.updateJogadores( firstRender, renderizadorPronto, frameDelta, frameNumber );

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
    * Atualiza a fisica de queda com gravidade, sopro de vento, kicks, etc - de um objeto em questão.
    * Este objeto atualiza essas coisas dele mesmo.
    */
    public updatePhysicsOfObject( esteObjeto:Ponteiro<AbstractObjectBase>, frameDelta:float ): void
    {
        const scene                     : Ponteiro<Scene>                      = this;
        const objetosCena               : Array<Ponteiro<AbstractObjectBase>>  = scene.getObjects();
        const gravity                   : Position3D                           = scene.getGravity();
        const frameDeltaIntensification : float                                = scene.frameDeltaIntensification;
        const objectPhysicsUpdateRate   : float                                = scene.objectPhysicsUpdateRate;

        // Se o ponteiro do objeto em questão não for null
        if( esteObjeto != null )
        {
            esteObjeto.isFalling = true;

            //If scene object have physics
            if( (esteObjeto.objProps.podeAtravessar != true)                                       &&
                (esteObjeto.objProps.collide == true || esteObjeto.objProps.collide == undefined ) && 
                 esteObjeto.physicsState.havePhysics == true 
            ){
                /**
                * FISICA DE QUEDA DO OBJETO
                * Para cada objeto da cena
                * (Esse laço só executa uma vez por que tem códigos que criei que precisam do BREAK)
                */
                for( let i:int = 0; i < objetosCena.length; i++ )
                {
                    const objetoAtualCena :  Ponteiro<AbstractObjectBase>  = objetosCena[i];

                    /**
                    * Se o ESTE OBJETO tiver colisão habilitada e colidir com o TAL outro OBJETO, ele corrige a posição Y DESTE OBJETO, para impedir ultrapassar o TAL outro OBJETO
                    */
                    if(  objetoAtualCena != null                          &&
                        (objetoAtualCena.objProps.podeAtravessar != true) &&
                        (objetoAtualCena.objProps.collide == true )       && 
                         objetoAtualCena.id != esteObjeto.id              && 
                        
                        //no ar, o objeto tem um alcançe de colisão maior, pra evitar o bug dele não conseguir detectar o objeto para ele parar em cima ao cair
                        isCollision( esteObjeto, 
                                     objetoAtualCena, 
                                     (
                                        esteObjeto.isFalling == true ? {x: 0.8, y: 0.8, z: 0.8} 
                                                                     : {x: 0.5, y: 0.5, z: 0.5}
                                     ) 
                        ) == true 
                    ){
                        //Corrige a posição Y do objeto pra não ultrapassar o Y do objeto
                        //BUG: Se o cubo ficar em baixo da caixa e subir um pouquinho Y dele, a caixa corrige sua posição e FICA EM CIMA DO CUBO
                        
                        if( esteObjeto.getPosition().y > objetoAtualCena.getPosition().y )
                        {
                            //Diz que o objeto parou de cair
                            esteObjeto.isFalling        = false;
                            esteObjeto.groundY          = esteObjeto.getPosition().y; // A posição da ultima colisão
                            esteObjeto.objectBelow      = objetoAtualCena;
                            esteObjeto.lastObjectBelow  = objetoAtualCena;

                            if( esteObjeto.getVelocity().y == 0 )
                            {
                                // Diz que o objeto parou de receber uma velocidade em Y
                                esteObjeto.isReceiving_Y_Velocity = false;
                            }
                        }
                        
                        //Impede que o objeto suba em cima de outro objeto
                        if( esteObjeto.isMovimentoTravadoPorColisao == false && esteObjeto.getPosition().y < objetoAtualCena.getPosition().y ){
                            esteObjeto.setPosition({
                                y: objetoAtualCena.getPosition().y - objetoAtualCena.getScale().y - esteObjeto.getScale().y,

                                // O resto da posição mantém
                                x: objetoAtualCena.getPosition().x,
                                z: objetoAtualCena.getPosition().z
                            })
                        }

                        //Corrige a posição Y do objeto pra não ultrapassar o Y do objeto
                        //BUG: Se o cubo ficar em baixo da caixa e subir um pouquinho Y dele, a caixa corrige sua posição e FICA EM CIMA DO CUBO
                        /*
                        if( scene.getPosition().y > objetoAtualCena.getPosition().y )
                        {
                            scene.setPosition({
                                y: objetoAtualCena.getPosition().y + (objetoAtualCena.getScale().y/1.4) + (scene.getScale().y/1.4)
                            });

                            //Diz que o objeto parou de cair
                            scene.isFalling = false;
                            scene.groundY = scene.getPosition().y; // A posição da ultima colisão
                            scene.objectBelow = objetoAtualCena;
                            scene.lastObjectBelow = objetoAtualCena;
                        }
                        */

                        /**
                        * A linha que estava comentada: objetoAtualCena.objProps.havePhysics === false , é desnecessaria, pois, o objeto não precisa ser estatico para nao poder ultrapassar
                        * Porem é mais dificil de testar se objetos tiverem fisica, por que ficam caindo. Mais eu fiz um teste movendo o chao para baixo, e a caixa e o cubo cairam certinho como esperado, e o cubo não conseguiu ultrapassar a caixa por baixo
                        *
                        * DETALHE: Mais se não mover o chao pra baixo não deu pra testar pois quando eu tentei mover o cubo pra ficar em baixo da caixa ele ficou no meio da caixa,
                        * mais isso não é por causa da logica de correação da posição do cubo, mais sim, por que, o cubo a onde ele tava não pode ultrassar a caixa, ai a logica de correção dele jogou ele pra baixo da caixa, porém, isso fez ele ultrapassar o chão, então, ele corrigiu a posição e ficou em cima do chão, o que fez ele ficar no meio da caixa
                        * Eu sei disso por que testei varias vezes, e ao fazer ess teste de mover o chao pra baixo, os dois objetos cairam corretamente como eu queria, e quando cairam no chao, o cubo ficou em baixo da caixa, e quando eu tentei forçar o cubo a ultrapassar a caixa por baixo, ele permaneceu lá em baixo da caixa, então a posição foi corrigida certa, e mesmo assim continuou em cima do chão, o que também é otimo, msotra que ta certo.
                        */

                        // Zera a velocidade do objeto pois ele já caiu
                        if( esteObjeto.isReceiving_Y_Velocity == false )
                        {
                            //Se é um objeto que pode quicar como uma bola
                            if( esteObjeto.objProps.kick_rate != undefined ){
                                
                                //Se tem uma velocidade aceitavel para quicar
                                if( Math.abs(esteObjeto.getVelocity().y) >= 6 )
                                {
                                    esteObjeto.getVelocity().y = ((esteObjeto.getVelocity().y/1.7) * -1) + esteObjeto.objProps.kick_rate + (Math.random() * 5) + (Math.random() * esteObjeto.objProps.kick_rate/2);
                                
                                }else{
                                    //Se nao atendeu minha limitação, ele zera normalmente
                                    esteObjeto.getVelocity().y = 0;
                                }

                            //Se é um objeto normal, o Y zera
                            }else{
                                esteObjeto.getVelocity().y = 0;
                            }
                        }

                        break;
                    }
                }

                /**
                * Se o objeto está caindo 
                */
                if( esteObjeto.isFalling === true )
                {
                    /**
                    * Sinaliza que um movimento para baixo está ocorrendo neste objeto 
                    */
                    esteObjeto.movimentSinalyzer.down = true;

                    /**
                    * Enquanto o objeto estiver caindo, ele não tem objeto abaixo dele 
                    */
                    esteObjeto.objectBelow = null;
                
                    if( esteObjeto.getVelocity().y != undefined && esteObjeto.getPosition().y != undefined )
                    {
                        /**
                        * Faz o object decrementar a posição Y com a gravidade
                        */
                        esteObjeto.getVelocity().y -= scene.gravity.y;

                        /**
                        * Executa os eventos de queda 
                        */
                        const eventosDoObjeto : Array<ObjectEvents> = esteObjeto.objEvents.getEventos();

                        for( let j:int = 0; j < eventosDoObjeto.length; j++ )
                        {
                            const eventosObjeto : ObjectEvents = eventosDoObjeto[ j ];

                            //Chama o evento whenFall
                            if( eventosObjeto.whenFall != null )
                            {
                                eventosObjeto.whenFall.bind(esteObjeto)({
                                    self     : esteObjeto,
                                    instante : new Date().getTime()
                                });
                            }
                        }
                    }

                    /**
                    * Aplica fisica de rotação na queda de acordo com o vento
                    */
                    if( scene.sceneConfig.haveWind == true )
                    {
                        if( esteObjeto.objProps.name != "Player" )
                        {
                            const wind    : Wind    = scene.wind;
                            const randomX : float   = Math.random() * 0.001;
                            const randomY : float   = Math.random() * 0.001;
                            const randomZ : float   = Math.random() * 0.001;

                            esteObjeto.somarRotation({
                                x: (randomX + wind.orientation.x) * wind.intensity.x * Math.abs(gravity.y) * 4.8 * frameDelta * frameDeltaIntensification,
                                y: (randomY + wind.orientation.y) * wind.intensity.y * Math.abs(gravity.y) * 4.8 * frameDelta * frameDeltaIntensification,
                                z: (randomZ + wind.orientation.z) * wind.intensity.z * Math.abs(gravity.y) * 4.8 * frameDelta * frameDeltaIntensification
                            });

                            //O vento tambem empurra um pouco na queda 
                            esteObjeto.somarForce({
                                x: (randomX + wind.deslocationTrend.x + wind.orientation.x) * wind.intensity.x,
                                y: (randomY + wind.deslocationTrend.y + wind.orientation.y) * wind.intensity.y,
                                z: (randomZ + wind.deslocationTrend.z + wind.orientation.z) * wind.intensity.z
                            
                            //(como velocidade interna da engine)
                            }, false);
                        }
                    }

                // Se o objeto não está caindo
                }else{
                    //Se ele já está no chão
                    if( esteObjeto.objectBelow != null && esteObjeto.objProps.name != "Player" ){
                        esteObjeto.setRotation({x:0, y: 0, z: 0});
                    }

                }

                // Se existe gravidade em outras direções
                if( scene.gravity.x != 0 )
                {
                    esteObjeto.getVelocity().x -= scene.gravity.x;
                }

                // Se existe gravidade em outras direções
                if( scene.gravity.z != 0 )
                {
                    esteObjeto.getVelocity().z -= scene.gravity.z;
                }

            }
        }

    }

    /**
    * Update object collision reaction.
    * Atualiza a reação das colisões de cada objeto para com cada objeto.
    */
    public updateCollisionReactions(firstRender:boolean, renderizadorPronto:boolean, frameDelta:float, frameNumber: int)
    {
        const scene       : Ponteiro<Scene>                     = this;
        const objetosCena : Array<Ponteiro<AbstractObjectBase>> = scene.objects;

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
                        (objetoB.name != "Chao")
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
    * Atualiza status de colisão e proximidade de um objeto em questão com outros objetos. 
    */
    public updateCollisionStateOfObject( esteObjeto:Ponteiro<AbstractObjectBase>, frameDelta:float ): void
    {
        const scene       : Ponteiro<Scene>                      = this;
        const objetosCena : Array<Ponteiro<AbstractObjectBase>>  = scene.objects;

        // Se o ponteiro do objeto em questão não estiver nulo
        if( esteObjeto != null )
        {
            // Zera as informações de colisão com outros objetos
            esteObjeto.infoCollisions = {
                objectNames    : [],
                objectIDs      : [],
                objectClasses  : [],
                objects        : []
            };
            // Zera as informações de proximidade com outros objetos
            esteObjeto.infoProximity = {
                objectNames    : [],
                objectIDs      : [],
                objectClasses  : [],
                objects        : []
            };

            //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
            // ou se for um std:array pode usar .fill(nullptr) direto

            //Se este objeto pode colidir
            if( (esteObjeto.objProps.podeAtravessar != true)  &&
                (esteObjeto.objProps.collide == true)         && 
                 esteObjeto.physicsState.havePhysics == true 
            ){
    
                // Limpa a tabela global de colisões do objeto 
                scene.clearObjectCollisionFromTableByName( esteObjeto.name );
                scene.clearObjectCollisionFromTableByID( esteObjeto.id );
                scene.clearObjectCollisionFromTableByCLASSES( esteObjeto.objProps.classes );

                // Limpa a tabela global de proximidade do objeto
                scene.clearObjectProximityFromTableByName( esteObjeto.name );
                scene.clearObjectProximityFromTableByID( esteObjeto.id );
                scene.clearObjectProximityFromTableByCLASSES( esteObjeto.objProps.classes );

                for( let i:int = 0 ; i < objetosCena.length ; i++ )
                {
                    const objetoAtualCena : Ponteiro<AbstractObjectBase> = objetosCena[i];

                    /**
                    * Se o ESTE OBJETO tiver colisão habilitada e colidir com o TAL outro OBJETO
                    */
                    if( (objetoAtualCena != null) &&
                        (objetoAtualCena.objProps.podeAtravessar != true) &&
                        (objetoAtualCena.objProps.collide == true) && 
                        objetoAtualCena.id != esteObjeto.id 
                    ){

                        /**
                        * Cadastra pela primeira vez as chaves de nomes e ids nos meus mapas collisionTable e collisionBinaryTable
                        * Para ser usados em detecção de colisões entre os objetos:
                        * 
                        * Assim como eu já fizia antes do commit desse dia 30/07/2025: Se a chave não existir, cria um Array ou Mapa para ela(dependendo de qual critério: se é por nome ou por ID)
                        * Esses objetos criados para a chave vão ser acessados para definir estados de colisão
                        */

                        // Por nome
                        if( scene.collisionTable.byName.search( esteObjeto.name ) == scene.collisionTable.byName.NotFounded() ){
                            scene.collisionTable.byName[ esteObjeto.name ] = new Array<Ponteiro<AbstractObjectBase>>();
                        }
                        if( scene.collisionBinaryTable.byName.search( esteObjeto.name ) == scene.collisionBinaryTable.byName.NotFounded() ){
                            scene.collisionBinaryTable.byName[ esteObjeto.name ] = new Mapa<string, boolean>();
                        }

                        // Por ID
                        if( scene.collisionTable.byID.search( esteObjeto.id ) == scene.collisionTable.byID.NotFounded() ){
                            scene.collisionTable.byID[ esteObjeto.id ] = new Array<Ponteiro<AbstractObjectBase>>();
                        }
                        if( scene.collisionBinaryTable.byID.search( esteObjeto.id ) == scene.collisionBinaryTable.byID.NotFounded() ){
                            scene.collisionBinaryTable.byID[ esteObjeto.id ] = new Mapa<string, boolean>();
                        }

                        /**
                        * Cadastra pela primeira vez as chaves de nomes e ids nos meus mapas proximityTable e proximityBinaryTable
                        * Para ser usados em detecção de proximidade entre os objetos:
                        * 
                        * Assim como eu já fizia antes do commit desse dia 30/07/2025: Se a chave não existir, cria um Array ou Mapa para ela(dependendo de qual critério: se é por nome ou por ID)
                        * Esses objetos criados para a chave vão ser acessados para definir estados de colisão
                        */
                        
                        // Por nome
                        if( scene.proximityTable.byName.search( esteObjeto.name ) == scene.proximityTable.byName.NotFounded() ){
                            scene.proximityTable.byName[ esteObjeto.name ] = new Array<Ponteiro<AbstractObjectBase>>();
                        }
                        if( scene.proximityBinaryTable.byName.search( esteObjeto.name ) == scene.proximityBinaryTable.byName.NotFounded() ){
                            scene.proximityBinaryTable.byName[ esteObjeto.name ] = new Mapa<string, boolean>();
                        }

                        if( scene.proximityTable.byID.search( esteObjeto.id ) == scene.proximityTable.byID.NotFounded() ){
                            scene.proximityTable.byID[ esteObjeto.id ] = new Array<Ponteiro<AbstractObjectBase>>();
                        }
                        if( scene.proximityBinaryTable.byID.search( esteObjeto.id ) == scene.proximityBinaryTable.byID.NotFounded() ){
                            scene.proximityBinaryTable.byID[ esteObjeto.id ] = new Mapa<string, boolean>();
                        }
                
                        /**
                        * Cadastra pela primeira vez as chaves de classes nos meus mapas proximityTable e proximityBinaryTable
                        * E tambem as chaves de classes nos meus mapas collisionTable e collisionBinaryTable
                        * 
                        * Exatamente como eu já fazia antes do commit desse dia 30/07/2025
                        */
                        for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                        {
                            const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];

                            //Registra tambem na tabela mestre da cena
                            if( scene.proximityTable.byClasses.search( nomeClasse ) == scene.proximityTable.byClasses.NotFounded() ){
                                scene.proximityTable.byClasses[ nomeClasse ] = new Array<Ponteiro<AbstractObjectBase>>();
                            }
                            if( scene.proximityBinaryTable.byClasses.search( nomeClasse ) == scene.proximityBinaryTable.byClasses.NotFounded() ){
                                scene.proximityBinaryTable.byClasses[ nomeClasse ] = new Mapa<string, boolean>();
                            }

                            //Registra tambem na tabela mestre da cena
                            if( scene.collisionTable.byClasses.search( nomeClasse ) == scene.collisionTable.byClasses.NotFounded() ){
                                scene.collisionTable.byClasses[ nomeClasse ] = new Array<Ponteiro<AbstractObjectBase>>();
                            }
                            if( scene.collisionBinaryTable.byClasses.search( nomeClasse ) == scene.collisionBinaryTable.byClasses.NotFounded() ){
                                scene.collisionBinaryTable.byClasses[ nomeClasse ] = new Mapa<string, boolean>();
                            }
                        }

                        /**
                        * Começa a verificar as colisões
                        * Nesse ponto, eu ja tenho os mapas collisionTable, collisionBinaryTable, proximityTable, proximityBinaryTable devidamente inicializados
                        * Pois os Arrays e Mapas dessas chaves que não existiam já estão todos criados nesse ponto. (Foram criados nos trechos de códigos das linhas anteriores) 
                        */

                        //Se houve uma colisão(usando Bounding Box)
                        if( isCollision( esteObjeto, objetoAtualCena, {x: 0.5, y: 0.5, z: 0.5} ) === true )
                        {
                            // POR NOME
                            // Registra as colisões detectadas
                            esteObjeto.infoCollisions.objectNames.push( objetoAtualCena.name );

                            // Por Nome
                            scene.collisionTable.byName[ esteObjeto.name ].push( objetoAtualCena );
                            scene.collisionBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = true;
                            scene.collisionBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ] = true;

                            // Por ID
                            esteObjeto.infoCollisions.objectIDs.push( objetoAtualCena.id );
                            scene.collisionTable.byID[ esteObjeto.id ].push( objetoAtualCena );

                            // Marca na tabela binaria
                            scene.collisionBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = true;
                            scene.collisionBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id ] = true;

                            //As classes tambem são inclusas se houver, para permitir facil acesso
                            for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                            {
                                const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];
                                scene.collisionBinaryTable.byName[ esteObjeto.id ][ nomeClasse ] = true;
                                scene.collisionBinaryTable.byID[ esteObjeto.id ][ nomeClasse ] = true;

                                esteObjeto.infoCollisions.objectClasses.push( nomeClasse );

                                // por Nome da classe
                                scene.collisionTable.byClasses[ nomeClasse ].push( objetoAtualCena );                          
                                scene.collisionBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = true;
                                scene.collisionBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ] = true;
                            }

                            esteObjeto.infoCollisions.objects.push( objetoAtualCena );

                        // Se não está mais colidindo, desmarca na tabela binaria, tanto por nome, id e classes
                        }else{
                            // Por Nome
                            scene.collisionBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = false;
                            scene.collisionBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ]   = false;

                            // Por ID
                            scene.collisionBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = false;
                            scene.collisionBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id   ] = false;

                            //As classes tambem são inclusas se houver, para permitir facil acesso
                            for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                            {
                                const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];
                                scene.collisionBinaryTable.byName[ esteObjeto.id ][ nomeClasse ] = false;
                                scene.collisionBinaryTable.byID[ esteObjeto.id ][ nomeClasse ]   = false;

                                esteObjeto.infoCollisions.objectClasses.push( nomeClasse );

                                // por Nome da classe
                                scene.collisionTable.byClasses[ nomeClasse ].push( objetoAtualCena );                          
                                scene.collisionBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = false;
                                scene.collisionBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ]   = false;
                            }

                        }

                        //Se houve uma proximidade
                        if( isProximity( esteObjeto, objetoAtualCena, esteObjeto.objProps.proximityConfig ) === true )
                        {

                            // Registra as colisões detectadas
                            esteObjeto.infoProximity.objectNames.push( objetoAtualCena.name );

                            // Por nome
                            scene.proximityTable.byName[ esteObjeto.name ].push( objetoAtualCena );
                            scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = true;
                            scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ]   = true;

                            // infoProximity
                            esteObjeto.infoProximity.objectIDs.push( objetoAtualCena.id );

                            // Por ID
                            scene.proximityTable.byID[ esteObjeto.id ].push( objetoAtualCena );
                            scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = true;
                            scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id ]   = true; 
                            
                            // Por classes
                            for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                            {
                                const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];
                                
                                esteObjeto.infoProximity.objectClasses.push( nomeClasse );

                                // Por nome da classe
                                scene.proximityTable.byClasses[ nomeClasse ].push( objetoAtualCena );
                                scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = true;
                                scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ] = true;
                            }
                            
                            esteObjeto.infoProximity.objects.push( objetoAtualCena );


                        // Se não está mais proximo, desmarca na tabela binaria, tanto por nome, id e classes
                        }else{
                            // Por nome
                            scene.proximityTable.byName[ esteObjeto.name ].push( objetoAtualCena );
                            scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = false;
                            scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ]   = false;

                            // Por ID
                            scene.proximityTable.byID[ esteObjeto.id ].push( objetoAtualCena );
                            scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = false;
                            scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id ]   = false; 

                            // Por classes
                            for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                            {
                                const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];
                                
                                esteObjeto.infoProximity.objectClasses.push( nomeClasse );

                                // Por nome da classe
                                scene.proximityTable.byClasses[ nomeClasse ].push( objetoAtualCena );
                                scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = false;
                                scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ]   = false;
                            }

                        }
                    }
                }
            }   
        }

    }

    /**
    * Atualiza a movimentação de um objeto em questão, e do objeto em questão em relação aos outros objetos na cena, como por exemplo objetos que podem carregar ele
    */
    public updateMovementOfObject( esteObjeto:Ponteiro<AbstractObjectBase>, frameDelta:float ): void
    {
        const scene            : Ponteiro<Scene>              = this;

        // Verifica se o objeto em questão é um ponteiro nulo
        if( esteObjeto != null )
        {
            const objeto           : Ponteiro<AbstractObjectBase>        = esteObjeto; // O objeto em questão
            const velocidadeObjeto : ObjectVelocity                      = objeto.getVelocity();
            const aceleracaoObjeto : ObjectAcceleration                  = objeto.getAcceleration();
            const forcaObjeto      : ObjectForce                         = objeto.getForce();
            const massaObjeto      : float                               = objeto.getMass();
            const gravity          : Position3D                          = scene.gravity;
            const atrito           : float                               = scene.atrito;
            const arrastoAr        : float                               = scene.arrastoAr;
            const frameDeltaIntensification            : float           = scene.frameDeltaIntensification;
            const objectPhysicsUpdateRate              : float           = scene.objectPhysicsUpdateRate;
            const objectPhysicsDesaceleracaoUpdateRate : float           = scene.objectPhysicsDesaceleracaoUpdateRate;
            const movimentState    : MovementState                       = objeto.movimentState;
            const objetosCena      : Array<Ponteiro<AbstractObjectBase>> = scene.objects;

            /**
            * Salva posição atual do objeto ANTES DE QUALQUER MOVIMENTO OCORRER, como sendo a posição anterior dele,
            * Pois se um movimento ocorrer, a posição anterior vai estar registrada para fins de calculos. 
            */
            objeto.lastPosition = { 
                                    x: Number( objeto.getPosition().x ),
                                    y: Number( objeto.getPosition().y ),
                                    z: Number( objeto.getPosition().z ),
                                };

            /**
            * Movimento simples de objeto, SEM USAR FISICA 
            * Realiza uma movimentação simples, para cada uma das direções possiveis, sem usar fisica.
            */
            if( movimentState.forward == true ){
                objeto.somarPosicaoX( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
                objeto.movimentSinalyzer.forward = true;
            }
            if( movimentState.backward == true ){
                objeto.subtrairPosicaoX( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
                objeto.movimentSinalyzer.backward = true;
            }
            if( movimentState.left == true ){
                objeto.subtrairPosicaoZ( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
                objeto.movimentSinalyzer.left = true;
            }
            if( movimentState.right == true ){
                objeto.somarPosicaoZ( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
                objeto.movimentSinalyzer.right = true;
            }

            /**
            * Fisica da aceleração do objeto que afeta a velocidade do objeto 
            */

            // Se a massa for zero vai dar problema de divisão por zero, então preciso verificar primeiro
            if( massaObjeto != 0 )
            {
                /**
                * Calcula a aceleração do objeto 
                */
                aceleracaoObjeto.x = forcaObjeto.x / massaObjeto;
                aceleracaoObjeto.y = forcaObjeto.y / massaObjeto;
                aceleracaoObjeto.z = forcaObjeto.z / massaObjeto;
            }

            /**
            * Calcula o peso do objeto 
            */
            objeto.weight = massaObjeto * gravity.y;

            /**
            * Aplica aceleração nos seus eixos
            */
            objeto.somarVelocityX( aceleracaoObjeto.x );
            objeto.somarVelocityY( aceleracaoObjeto.y, false );
            objeto.somarVelocityZ( aceleracaoObjeto.z );

            /**
            * Fisica de movimento de acordo com a velocidade com desaceleração gradual da velocidade.
            * OBS: Aqui não tem mecanica de acionar movimentos de acordo com o movimentState, apenas lida com a atualização do movimento e faz a desaceleração natural QUANDO O OBJETO TEM UMA VELOCIDADE ATIVA EM SEUS EIXOS
            */
            const velocidadeX = velocidadeObjeto.x;
            const sinalX      = Math.sign(velocidadeX);

            const velocidadeY = velocidadeObjeto.y;
            const sinalY      = Math.sign(velocidadeY);

            const velocidadeZ = velocidadeObjeto.z;
            const sinalZ      = Math.sign(velocidadeZ);
            
            if( velocidadeX != 0 )
            {   
                objeto.somarPosicaoX( velocidadeX * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

                // Vai desacelerando
                let novaVelocidadeX = (velocidadeObjeto.x - objectPhysicsDesaceleracaoUpdateRate * sinalX * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

                // Se o sinal da velocidade é diferente do sinal anterior (pra impedir de começar a andar para traz depois de a força acabar)
                if(Math.sign(novaVelocidadeX) !== sinalX){
                    novaVelocidadeX = 0;
                }

                //No ar, ele vai ter arrasto do ar
                if( objeto.isFalling == true ){
                    objeto.setVelocityX( novaVelocidadeX * arrastoAr );

                //No chao, ele vai ter atrito
                }else{
                    objeto.setVelocityX( novaVelocidadeX * atrito );
                }

                // Indica qual direção o objeto está se movendo
                if( sinalX == 1 ){
                    objeto.movimentSinalyzer.forward = true;
                }else{
                    objeto.movimentSinalyzer.backward = true;
                }
            }   

            //Se o objeto não estiver caindo e SE NÂO ESTIVER NO CHÂO OU EM CIMA DE ALGO
            //BUG: O EIXO Y NÂO CONSEGUE RECEBER UMA VELOCIDADE IGUAL NOS OUTROS POR CAUSA DA FISICA DE QUEDA QUE MANIPULA O EIXO Y
            if( velocidadeY != 0 )
            {   
                objeto.somarPosicaoY( velocidadeY * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

                /** 
                * Se o objeto está recebendo uma aceleração externa em Y
                * (se não tivesse essa verificação iria dar conflito com a lógica da queda, eu testei)
                */
                if( objeto.isReceiving_Y_Velocity == true )
                {
                    let novaVelocidadeY = ( velocidadeObjeto.y - objectPhysicsDesaceleracaoUpdateRate * sinalY );

                    // Se o sinal da velocidade é diferente do sinal anterior (pra impedir de começar a andar para traz depois de a força acabar)
                    if(Math.sign(novaVelocidadeY) !== sinalY){
                        novaVelocidadeY = 0;
                    }

                    objeto.setVelocityY( novaVelocidadeY * arrastoAr, false );
                }

                // Indica qual direção o objeto está se movendo
                if( sinalY == 1 ){
                    objeto.movimentSinalyzer.up = true;
                }else{
                    objeto.movimentSinalyzer.down = true;
                }

            }
            
            if( velocidadeZ != 0 )
            {   
                objeto.somarPosicaoZ( velocidadeZ * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

                let novaVelocidadeZ = (velocidadeObjeto.z - objectPhysicsDesaceleracaoUpdateRate * sinalZ * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

                // Se o sinal da velocidade é diferente do sinal anterior (pra impedir de começar a andar para traz depois de a força acabar)
                if(Math.sign(novaVelocidadeZ) !== sinalZ){
                    novaVelocidadeZ = 0;
                }

                //No ar, ele vai ter arrasto do ar
                if( objeto.isFalling == true ){
                    objeto.setVelocityZ( novaVelocidadeZ * arrastoAr );

                //No chao, ele vai ter atrito
                }else{
                    objeto.setVelocityZ( novaVelocidadeZ * atrito );
                }

                // Indica qual direção o objeto está se movendo
                if( sinalZ == 1 ){
                    objeto.movimentSinalyzer.right = true;
                }else{
                    objeto.movimentSinalyzer.left = true;
                }
            }  

            /**
            * Se o objeto atual estiver em cima de outro objeto, este objeto o carrega junto ao ser mover
            * OBS: Isso tava anulando a fisica de desaceleração e só funcionava ao realizar movimentos com força de aceleração E NAO TA FUNCIONANDO EM MOVIMENTOS SIMPLES
            * Pra nao anular a fisica de desaceleração eu adicionei limitações.
            * 
            * Explicação: Se um objeto recebe uma força, e tem outro objeto em cima dele, esse objeto é carregado em cima dele junto, como se fosse uma plataforma que pode carregar outros objetos em cima dele. 
            * Essa fisica não é aplicada se o objeto estiver em cima do chão e nem em cima de objetos sem fisica pra evitar anular a fisica de desaceleração
            *
            * O delta da velocidade aqui nesse contexto é um pequeno valor numérico que vai dizer o quanto o objeto vai ter que andar para poder acompanhar o objeto abaixo dele
            *
            * Em outras palavras: 
            * Esse código faz com que, se um determinado objeto estiver em cima de outro objeto que está se movendo, Então, esse objeto que está em cima dele se move junto
            */
            if( objeto.objectBelow != undefined && 
                objeto.objectBelow != null &&
                //O objeto abaixo precisa ter fisica e poder colidir
                objeto.objectBelow.objProps.havePhysics == true &&
                objeto.objectBelow.objProps.collide == true &&
                //O objeto atual tambem precisa ter fisica e poder colidir
                objeto.objProps.havePhysics == true &&
                objeto.objProps.collide == true &&
                //Essa regra não vale para chãos
                objeto.objectBelow.haveClass("ground") == false
            ){
                const esteObjeto       = objeto;
                const objetoAbaixoDele = objeto.objectBelow;
                
                const coeficiente     = 0.5; // pode ser dinâmico
                const massa           = esteObjeto.getMass();
                const normal          = massa * Math.abs(gravity.y);
                const atritoCalculado = coeficiente * normal;

                const deltaVelocidadeX = objetoAbaixoDele.getVelocity().x - esteObjeto.getVelocity().x;
                const deltaVelocidadeZ = objetoAbaixoDele.getVelocity().z - esteObjeto.getVelocity().z;

                const forcaX = Math.min(Math.abs(deltaVelocidadeX), atritoCalculado) * Math.sign(deltaVelocidadeX);
                const forcaZ = Math.min(Math.abs(deltaVelocidadeZ), atritoCalculado) * Math.sign(deltaVelocidadeZ);

                // Acompanha o movimento do objeto que ele está em baixo 
                esteObjeto.getVelocity().x += forcaX;
                esteObjeto.getVelocity().z += forcaZ;   
            } 
            
            /**
            * Quase identifico ao anterior:
            * Outra lógica para criar mecanica do objeto ao se mover carregar outro objeto que está em cima dele 
            * PORÈM especifico para objetos que não tem fisica e usam movimentos não orientados a força, para contornar a limitação do anterior
            * 
            * Em outras palavras: 
            * Esse código faz com que, se um determinado objeto estiver em cima de outro objeto que está se movendo, Então, esse objeto que está em cima dele se move junto
            */
            if( objeto.objectBelow != undefined && 
                objeto.objectBelow != null &&
                //O objeto abaixo NÂO PODE TER fisica
                objeto.objectBelow.objProps.havePhysics == false &&
                // Porém o objeto ainda assim deve colidir
                objeto.objectBelow.objProps.collide == true &&
                //Essa regra não vale para chãos
                objeto.objectBelow.haveClass("ground") == false
            ){
                const esteObjeto          = objeto;
                const objetoAbaixoDele    = objeto.objectBelow;
                const posicaoAtualDele    = objetoAbaixoDele.getPosition();
                const posicaoAnteriorDele = objetoAbaixoDele.getLastPosition();

                const deltaPosicaoX       = posicaoAtualDele.x! - (posicaoAnteriorDele.x || 0);
                const deltaPosicaoZ       = posicaoAtualDele.z! - (posicaoAnteriorDele.z || 0);

                // Acompanha o movimento do objeto que ele está em baixo 
                esteObjeto.getPosition().x += deltaPosicaoX;
                esteObjeto.getPosition().z += deltaPosicaoZ;
            }
        }
        
    }

    /**
    * Atualiza a rotação do objeto em questão, e do objeto em questão em relação aos outros objetos na cena
    */
    public updateRotationOfObject( esteObjeto:Ponteiro<AbstractObjectBase>, frameDelta:float ): void
    {
        const scene  : Ponteiro<Scene>               = this;

        // Ignora se o objeto em questão nao existir, verificando se o ponteiro é nulo
        if( esteObjeto != null )
        {
            const objeto                               : Ponteiro<AbstractObjectBase>  = esteObjeto;

            const massaObjeto                          : float          = objeto.getMass();
            const gravity                              : Position3D     = scene.gravity;
            const atrito                               : float          = scene.atrito;
            const arrastoAr                            : float          = scene.arrastoAr;
            const frameDeltaIntensification            : float          = scene.frameDeltaIntensification;
            const objectPhysicsUpdateRate              : float          = scene.objectPhysicsUpdateRate;
            const objectPhysicsDesaceleracaoUpdateRate : float          = scene.objectPhysicsDesaceleracaoUpdateRate;
            const movimentState                        : MovementState  = objeto.movimentState;

            const objetosCena             : Array<Ponteiro<AbstractObjectBase>> = scene.objects;

            const forcaVelocidadeObjeto   : ObjectForce          = objeto.getRotationForce();
            const aceleracaoRotacaoObjeto : ObjectAcceleration   = objeto.getRotationAcceleration();
            
            // Se a massaObjeto for zero, não faz nada pra não dar divisão por zero
            if( massaObjeto != 0 )
            {
                /**
                * Calcula a aceleração da velocidade do objeto 
                */
                aceleracaoRotacaoObjeto.x = forcaVelocidadeObjeto.x / massaObjeto;
                aceleracaoRotacaoObjeto.y = forcaVelocidadeObjeto.y / massaObjeto;
                aceleracaoRotacaoObjeto.z = forcaVelocidadeObjeto.z / massaObjeto;

                /**
                * Aplica aceleração da velocidade nos seus eixos
                */
                objeto.somarRotationVelocityX( aceleracaoRotacaoObjeto.x );
                objeto.somarRotationVelocityY( aceleracaoRotacaoObjeto.y );
                objeto.somarRotationVelocityZ( aceleracaoRotacaoObjeto.z );
            }

            /**
            * Atualiza a rotação do objeto
            */
            objeto.somarRotationX( objeto.getRotationVelocity().x * frameDelta );
            objeto.somarRotationY( objeto.getRotationVelocity().y * frameDelta );
            objeto.somarRotationZ( objeto.getRotationVelocity().z * frameDelta );

            /**
            * Aplica uma desaceleração na velocidade de rotação atual 
            */
            const velocidadeRotacao   = objeto.getRotationVelocity();
            const sinalX              = Math.sign(velocidadeRotacao.x);
            const sinalY              = Math.sign(velocidadeRotacao.y);
            const sinalZ              = Math.sign(velocidadeRotacao.z);

            /**
            * Para a rotação gradualmente 
            */
            if( velocidadeRotacao.x != 0 )
            {
                if( sinalX == 1 ){
                    objeto.subtrairRotationVelocityX( gravity.y );
                }else{
                    objeto.somarRotationVelocityX( gravity.y );
                }
                
            }

            if( velocidadeRotacao.y != 0 )
            {
                if( sinalY == 1 ){
                    objeto.subtrairRotationVelocityY( gravity.y );
                }else{
                    objeto.somarRotationVelocityY( gravity.y  );
                }
            }

            if( velocidadeRotacao.z != 0 )
            {
                if( sinalZ == 1 ){
                    objeto.subtrairRotationVelocityZ( gravity.y );
                }else{
                    objeto.somarRotationVelocityZ( gravity.y );
                }
            }
        }
    }

    /**
    * Update all objects in the scene.
    * Atualiza todos os objetos na cena, atualizando a lógica de jogo deles, fisica, eventos, etc...
    */
    public updateObjects( firstRender: boolean, renderizadorPronto: boolean, frameDelta:float, frameNumber: int ): void
    {

        const context          : Scene                                = this;
        const currentScene     : Scene                                = context;
        const updatableObjects : Array<Ponteiro<AbstractObjectBase>>  = this.objects;

        for( let i:int = 0 ; i < updatableObjects.length ; i++ )
        {
            const currentObject : Ponteiro<AbstractObjectBase>   = updatableObjects[ i ];
        
            // Se o ponteiro não está nulo
            if( currentObject != null )
            {
                const velocityBeforeUpdate          : ObjectVelocity     = {... currentObject.getVelocity()}; // Faz uma copia sem referencia
                const velocitySinalyzerBeforeUpdate : VelocityStatus     = {... currentObject.velocitySinalyzer}; // Faz uma copia sem referencia
                const currentObjectIndex            : int                = i;

                /**
                * Atualiza uma tabela com os nomes dos objetos,
                * Se o ponteiro não for nulo
                */
                if( currentObject != null )
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
                    * Envia algumas informações importantes para dentro do "currentObject"
                    * Para caso eu precise acessar o scene ou outros objetos de dentro do contexto do "currentObject", em alguma regra interna de atualização de lógica que eu possa querer criar
                    */
                    currentObject.setScene( currentScene );

                    if( this.sceneConfig.enable_advanced_frame_tracking == true )
                    {
                        /**
                        * Salva o status atual deste objeto ANTES DA ATUALIZACAO frame no historico do objeto 
                        */
                        currentObject.frameHistory.logObject( "beforeUpdate", firstRender, renderizadorPronto, frameDelta, frameNumber );
                    }

                    /**
                    * Reseta algumas coisas antes do loop.
                    * Isso reseta algumas coisas basicas do objeto, antes de qualquer loop de lógica e fisica
                    */
                    currentObject.pre_loop_reset();

                    /**
                    * Atualiza a fisica de queda com gravidade, sopro de vento, kicks, etc - deste objeto.
                    * Este objeto atualiza essas coisas dele mesmo.
                    */
                    this.updatePhysicsOfObject( currentObject, frameDelta );

                    /**
                    * Atualiza status de colisão e proximidade de um objeto em questão com outros objetos. 
                    * Isso atualiza quais objetos estão colidindo/e os que estão proximos com quais objetos
                    */
                    this.updateCollisionStateOfObject( currentObject, frameDelta );

                    /**
                    * Atualiza os movimentos do objeto 
                    */
                    this.updateMovementOfObject( currentObject, frameDelta );

                    /**
                    * Atualiza a rotação do objeto 
                    */
                    this.updateRotationOfObject( currentObject, frameDelta );

                    /**
                    * Atualiza os eventos do objeto 
                    */
                    this.updateEventsOfObject( currentObject, frameDelta );

                    /**
                    * Atualiza os "attachments" ou "objeto anexados/grudados" ao objeto atual
                    */
                    this.updateAttachmentsOfObject( currentObject, frameDelta );

                    /**
                    * Atualiza a lógica de jogo do objeto. 
                    * Esse método vai fazer a atualização de lógica e regras de jogo do objeto.
                    * OBS: Esse método não vai fazer atualizações de fisica, ou movimentação padrão da engine. Apenas lógicas especificas para o objeto.
                    */
                    currentObject.updateObject( firstRender, renderizadorPronto, frameDelta, frameNumber );

                    if( this.sceneConfig.enable_advanced_frame_tracking == true )
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

                    /**
                    * Reseta algumas coisas depois do frame atual terminar.
                    * Muito importante para o calculo de força.
                    */
                    currentObject.reset_loop_afterframe();

                }catch(e){
                    console.error(e)
                }
            }
        }

    }

    /**
    * Atualiza os eventos internos de um objeto em questão
    */
    public updateEventsOfObject( esteObjeto:Ponteiro<AbstractObjectBase>, frameDelta:float ): void
    {
        const scene   : Ponteiro<Scene>               = this;

        // Se o ponteiro do objeto em questão não for null
        if( esteObjeto != null )
        {
            const objeto  : Ponteiro<AbstractObjectBase>  = esteObjeto;
            const eventos : ObjectEventLayer              = objeto.objEvents;

            //Se tem eventos
            if( eventos != null )
            {   
                const eventosDoObjeto : Array<ObjectEvents>  = eventos.getEventos();

                // Para cada bloco de evento
                for( let i:int = 0; i < eventosDoObjeto.length; i++ )
                {
                    const eventosObjeto : ObjectEvents                         = eventosDoObjeto[i];
                    const objetosCena   : Array<Ponteiro<AbstractObjectBase>>  = scene.objects;

                    // Se o objeto pode colidir e Se existe o evento whenCollide
                    if( (objeto.objProps.collide != false || objeto.objProps.collisionEvents == true) && 
                        eventosObjeto.whenCollide 
                    ){
                        
                        // Para cada objeto na cena, verifica se colidiu com este objeto
                        for( let j:int = 0; j < objetosCena.length; j++ )
                        {
                            const objetoAtualCena : Ponteiro<AbstractObjectBase>  = objetosCena[j];

                            //Se ESTE objeto COLIDIR com o objeto atual da cena 
                            if( 
                                objetoAtualCena != null          &&
                                // Se não for ele mesmo
                                objetoAtualCena.id != objeto.id  &&
                                
                                //Se o objetoAtualCena tem colisão habilitada
                                (objetoAtualCena.objProps.collide == true || objetoAtualCena.objProps.collisionEvents == true) &&
                                
                                //Se o objeto atual NÂO tiver uma exceção para o objetoAtualCena
                                (
                                    //Se ele inclui o ID ou se não tem ignoreColisions nem entra
                                    includeString(objeto.objProps.ignoreCollisions, objetoAtualCena.id) == false &&
                                    //Se ele tem nome o nome é uma excessao ou se ele não tem name, nem entra
                                    includeString(objeto.objProps.ignoreCollisions, objetoAtualCena.name) == false &&
                                    // Se o ignoreCollisions do outro objeto(o objeto B) NÂO inclui alguma classe que o objeto A tenha
                                    objectANOTHaveSomeClassesIgnoredByObjectB( objeto, objetoAtualCena )
                                ) &&
                                //Se o objetoAtualCena NÂO tiver uma exceção para o objeto
                                (   
                                    includeString(objetoAtualCena.objProps.ignoreCollisions, objeto.id) == false && 
                                    includeString(objetoAtualCena.objProps.ignoreCollisions, objeto.name) == false &&
                                    objectANOTHaveSomeClassesIgnoredByObjectB( objetoAtualCena, objeto )
                                ) &&
                                /** Se houve uma colisão de fato **/
                                (
                                    isCollision( objeto, objetoAtualCena, {x: 0.5, y: 0.5, z: 0.5} ) == true 
                                )
                            ) {
                                eventosObjeto.whenCollide.bind(objeto)({
                                    self     : objeto,
                                    target   : objetoAtualCena,
                                    instante : new Date().getTime(),
                                    subjects : [ objeto.id, objetoAtualCena.id ],
                                    distance : getDistance(objeto, objetoAtualCena) 
                                });
                            }
                            
                        }
                    }

                    //Se tem o evento whenProximity
                    if( eventosObjeto.whenProximity != null )
                    {
                        // Para cada objeto na cena, verifica se colidiu com este objeto
                        for( let j:int = 0; j < objetosCena.length; j++ )
                        {
                            const objetoAtualCena : Ponteiro<AbstractObjectBase>  = objetosCena[j];

                            if( 
                                objetoAtualCena != null &&
                                // Se não for ele mesmo
                                objetoAtualCena.id != objeto.id &&
                                isProximity( objeto, objetoAtualCena, objeto.objProps.proximityConfig ) == true
                            ){
                                eventosObjeto.whenProximity.bind(objeto)({
                                    self     : objeto,
                                    target   : objetoAtualCena,
                                    instante : new Date().getTime(),
                                    subjects : [ objeto.id, objetoAtualCena.id ],
                                    proximityConfig: objeto.objProps.proximityConfig,
                                    distance : getDistance(objeto, objetoAtualCena) 
                                });
                            }
                        }
                    }

                    //Se tem o evento loop(um evento sem condições que sempre será executado se existir, pra permitir criar loops especificos para cada objeto)
                    if( eventosObjeto.loop != null )
                    {
                        eventosObjeto.loop.bind(objeto)(objeto);
                    }
                }

            }
        }
    }

    /**
    * Atualiza objetos anexados/grudados em um objeto em questão 
    */
    public updateAttachmentsOfObject( esteObjeto:Ponteiro<AbstractObjectBase>, frameDelta:float ): void
    {
        const objeto  : Ponteiro<AbstractObjectBase>  = esteObjeto;

        // Se o ponteiro do objeto em questão não for null
        if( objeto != null )
        {
            const scene   : Ponteiro<Scene>   = this;

            if( objeto.objProps.attachments.length > 0 )
            {                                                
                /**
                * Para cada objeto da cena
                */
                for( let i:int = 0; i < objeto.objProps.attachments.length; i++ )
                {   
                    const anexo            : ObjectAttachment             = objeto.objProps.attachments[i];
                    const nomeObjetoAnexar : string                       = anexo.name;
                    const objetoAnexar     : Ponteiro<AbstractObjectBase> = scene.getObjectByName( nomeObjetoAnexar );
                    
                    //Se o ponteiro não é nulo
                    if( objetoAnexar != null )
                    {
                        // Se ele NÂO DEVE COLIDIR COM O OBOJETO DONO DO ANEXO
                        if( anexo.attacherCollision == false )
                        {
                            if( includeString(objeto.objProps.ignoreCollisions, objetoAnexar.id) == false ){ 
                                objeto.objProps.ignoreCollisions.push( objetoAnexar.id );
                            }
                        }

                        // Se tem um ajuste de posição EM RELAÇÂO AO OBJETO, aplica
                        // Acompanha a posição do objeto
                        objetoAnexar.setPosition( objeto.getPosition() );

                        // Alem disso, permite fazer um ajuste de posição
                        objetoAnexar.somarX( anexo.position.x );
                        objetoAnexar.somarY( anexo.position.y );
                        objetoAnexar.somarZ( anexo.position.z );

                        //Se vai copiar a memsa escala do objeto
                        if( anexo.sameScale == true ){
                            objetoAnexar.setScale( objeto.getScale() );
                        }

                        // Se tem uma escala especifica para ele
                        objetoAnexar.setScale( anexo.scale );

                        // Se tem redução de escala
                        objetoAnexar.somarEscalaX( anexo.scaleReduce.x );
                        objetoAnexar.somarEscalaY( anexo.scaleReduce.y );
                        objetoAnexar.somarEscalaZ( anexo.scaleReduce.z );

                        //Se tem rotação
                        objetoAnexar.setRotation( anexo.rotation );

                        //Se tem incremento de rotação nos eixos
                        objetoAnexar.somarRotation( anexo.rotationIncrement );

                        //Se tem outras coisas
                        objetoAnexar.objProps.podeAtravessar = anexo.podeAtravessar;
                        objetoAnexar.objProps.collide        = anexo.collide;
                        
                        objetoAnexar.objProps.havePhysics     = anexo.havePhysics;
                        objetoAnexar.physicsState.havePhysics = anexo.havePhysics;

                        objetoAnexar.objProps.collisionEvents = anexo.collisionEvents;
                        objetoAnexar.objProps.isInvisible     = anexo.isInvisible;
                    }
                }        
            }                                               
        }
    }

    // Update all sounds in the scene
    public updateSounds( firstRender: boolean, renderizadorPronto: boolean, frameDelta:float, frameNumber: int ): void
    {
        const context : Scene                        = this;
        const sounds  : Array<Ponteiro<LocalSound>>  = this.sounds;

        for( let i:int = 0 ; i < sounds.length ; i++ )
        {
            const currentSound      : Ponteiro<LocalSound>  = sounds[ i ];
            const currentSoundIndex : int                   = i;

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

    // Atualiza todos os jogadores na cena
    public updateJogadores( firstRender: boolean, renderizadorPronto: boolean, frameDelta:float, frameNumber: int ): void
    {
        const context   : Scene                    = this;
        const jogadores : Array<Ponteiro<Player>>  = this.jogadores;

        for( let i:int = 0 ; i < jogadores.length ; i++ )
        {
            const jogadorAtual       : Ponteiro<Player>  = jogadores[ i ];
            const indiceJogadorAtual : int               = i;

            // Se o ponteiro não é nulo
            if( jogadorAtual != null )
            {
                 /**
                 * Repass some important informations into the  "currentObject"
                 */
                 jogadorAtual.scene  = this;

                 // Se o jogador usa a primeira camera da cena, e ela não é um ponteiro nulo
                 if( jogadorAtual.idCameraAtual == -1 && this.cameras[0] != null )
                 {
                    // Ele vai acessar a camera pelo ID numérico dela no Array de cameras 
                    jogadorAtual.idCameraAtual  = 0;
                    jogadorAtual.refCameraAtual = this.cameras[0];
                 }

                 // Se a cena não está usando troca livre de camera
                 if( this.usarTrocaCameraLivre == false )
                 { 
                    // Se o jogador é o jogador ativo no momento, e o idJogadorAtivo não for NENHUM
                    if( jogadorAtual.id == this.idJogadorAtivo && this.idJogadorAtivo != "NENHUM" )
                    {
                        this.setCameraAtiva( jogadorAtual.idCameraAtual );
                    }
                 }

                 // Atualiza o som
                 jogadorAtual.updatePlayer(firstRender, renderizadorPronto, frameDelta, frameNumber);
            }
        }
    }

    /**
    * Atualiza a camera atual repassando os dados pra ela, e chamando a função de atualização, passando o frame dela
    */
    public atualizarCameraAtual( firstRender:boolean, renderizadorPronto:boolean, frameDelta:float, frameNumber:int ): void
    {
        const cameraAtual    : Ponteiro<CameraInstance>  = this.getCameraAtiva();
        
        if( this.idCameraAtiva > this.cameras.length )
        {
            console.warn("O this.idCameraAtiva tem um valor invalido!");
        }

        // Se o ponteiro não for null, e se o ID da camera não for valor invalido(no caso, eu defini -1 como sendo um valor invalido)
        if( cameraAtual != null && this.idCameraAtiva != -1 )
        {
            // Repassa o limite de FPs que eu defini no RenderizadorCena.ts
            cameraAtual.LimiteFPS = this.LimiteFPS;

            // Repassa as informações de teclado e mouse que o meu renderizador recebeu da minha camada de entrada
            cameraAtual.receberInformacoesTecladoMouse( this.infoPosicaoMouse, this.infoTeclasTeclado );

            // Atualiza a camera atual(uma atualização que não envolve regras de jogo nem regras de movimentação de personagem)
            cameraAtual.atualizarCamera( frameDelta );

            // O RENDERIZADOR VAI PASSAR AS INFORMAÇÔES PARA A CAMERA INTERNA DELE, QUE VAI ESPELHAR ESSA CAMERA
        }
    }
}