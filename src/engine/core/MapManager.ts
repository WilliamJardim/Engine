/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

import MapDefinition from "../interfaces/main_engine/MapDefinition";
import { int, Ponteiro } from "../types/types-cpp-like";
import Mapa from "../utils/dicionarios/Mapa";
import AbstractObjectBase from "./AbstractObjectBase";
import ObjectBase from "./ObjectBase";
import Scene from "./Scene";

/**
* Carrega e gerencia cenários de jogo, que podem ser usados pela cena do jogo, trocando de cenário, e acessando informações dos cenários em memoria.
* Para carregar os cenários, ele usa o própio sistema de carregamento de objetos que criei.
* 
* Ele é um objeto a parte do Scene, que faz uso de funções do Scene.
*/
export default class MapManager
{
    public scene           : Scene;
    public mapas           : Mapa<string, MapDefinition>;
    public nomeMapaAtual   : string;
    
    constructor(scene:Scene)
    {
        this.scene = scene; // A cena que vai estar atrelada aos mapas
        this.mapas          = new Mapa<string, MapDefinition>();
        this.nomeMapaAtual  = "nenhum";
    }

    /**
    * Habilita a renderização de um cenário especifico.
    * Isso só ativa a renderização dele, mais não altera nada na renderização dos outros.
    */
    public habilitarRenderizacaoMapa(nomeMapa:string): void
    {
        const mapaAtual     : MapDefinition                 = this.mapas[nomeMapa];
        const idMapaAtual   : string                        = mapaAtual.id;
        const mapaAtualCena : Ponteiro<AbstractObjectBase>  = this.scene.getObjectByID(idMapaAtual);

        // Se o ponteiro não for null
        if(mapaAtualCena != null)
        {
            // Faz o mapa atual "i" parar de ser renderizado
            this.mapas[nomeMapa].renderizado = true;
            mapaAtualCena.objProps.renderizavel = true;
        }
    }

    /**
    * Desativa a renderização de um cenário especifico
    * Isso só ativa a renderização dele, mais não altera nada na renderização dos outros.
    */
    public desabilitarRenderizacaoMapa(nomeMapa:string): void
    {
        const mapaAtual     : MapDefinition                 = this.mapas[nomeMapa];
        const idMapaAtual   : string                        = mapaAtual.id;
        const mapaAtualCena : Ponteiro<AbstractObjectBase>  = this.scene.getObjectByID(idMapaAtual);

        // Se o ponteiro não for null
        if(mapaAtualCena != null)
        {
            // Faz o mapa atual "i" parar de ser renderizado
            this.mapas[nomeMapa].renderizado = false;
            mapaAtualCena.objProps.renderizavel = false;
        }
    }

    /**
    * Pede pra Engine começar a renderizar um mapa especifico, e parar de renderizar todos os outros.
    */
    public trocarMapa(nomeMapa:string): void
    {
        //Se o mapa ja foi carregado
        if( this.mapas[nomeMapa] != null )
        {
            const idMapa   : string                        = this.mapas[nomeMapa].id;
            const mapaCena : Ponteiro<AbstractObjectBase>  = this.scene.getObjectByID(idMapa);

            // Se o ponteiro não for nulo
            if(mapaCena != null)
            {
                // Faz o mapa ser renderizado
                this.mapas[nomeMapa].renderizado = true;
                mapaCena.objProps.renderizavel = true;

                // Para cada um dos outros mapas
                const outrosMapas:Array<string>  = Object.keys( this.mapas );
                for( let i:int = 0 ; i < outrosMapas.length ; i++ )
                {
                    const nomeMapaAtual : string                        = outrosMapas[i];
                    const mapaAtual     : MapDefinition                 = this.mapas[nomeMapaAtual];
                    const idMapaAtual   : string                        = mapaAtual.id;
                    const mapaAtualCena : Ponteiro<AbstractObjectBase>  = this.scene.getObjectByID(idMapaAtual);

                    // Se o ponteiro não for null
                    if(mapaAtualCena != null)
                    {
                        // Faz o mapa atual "i" parar de ser renderizado
                        this.mapas[nomeMapaAtual].renderizado = false;
                        mapaAtualCena.objProps.renderizavel = false;
                    }
                }
            }

        }else{
            console.error("ERRO: O mapa " + String(nomeMapa) + " não foi carregado!" );
        }
    }

    /**
    * Pede pra Scene carregar um mapa, usando o carregamento de objetos.
    * Se o a variavel `carregarNoJogo` for true, ele já manda renderizar o mapa e configura o jogador.
    */
    public carregarMapa(nomeMapa:string, carregarNoJogo:boolean=true)
    {
        this.nomeMapaAtual = nomeMapa;

        // Manda a Engine carregar o modelo do mapa
        const idObjeto = this.scene.criarObjeto( new ObjectBase({
            type : "OBJ",
            name : nomeMapa,
            obj  : "/MAPS" + "/" + nomeMapa + "/" + nomeMapa + ".obj",
            mtl  : "/MAPS" + "/" + nomeMapa + "/" + nomeMapa + ".mtl",
            
            // Se for mandar renderizar o mapa e configura o jogador.
            renderizavel: carregarNoJogo,

            isInvisible: false,
            opacity: 1, 
    
            childrenIndividualLights: true,
            useAccumulatedLights: true,
            staticAccumulatedLights: false,
    
            position: {
                x: 0,
                y: 8,
                z: 0
            },
    
            scale: {
                x: 1,
                y: 1,
                z: 1
            },
    
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
    
            mass: 1,
            classes: [],
            havePhysics: false,
            scaleReduce: {
                x: 0,
                y: 0,
                z: 0
            },
            collide: false,
            collisionEvents: false,
            podeAtravessar: false,
            ignoreCollisions: [],
            proximityConfig: {
                x: 8,
                y: 8,
                z: 8
            },
            events: [],
            kick_rate: 4,
            enable_advanced_frame_tracking: false,
            attachments: [],
            onCreate: function(){
                
            },
        }));

        // Cadastra o mapa carregado no mapa de mapas
        this.mapas[nomeMapa] = {
            id: idObjeto,
            nome: nomeMapa,
            renderizado: carregarNoJogo,
            // Por enquanto não calculo isso:
            largura: 0,
            altura: 0
        }

        // Se ja for carregar no mapa, então, manda a Engine começar a renderizar o mapa
        if( carregarNoJogo == true )
        {
            this.trocarMapa( nomeMapa );
        }
    }
}   