/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ItemInformacoes from "../interfaces/main_engine/player/inventario/ItemInformacoes";
import PlayerProps from "../interfaces/main_engine/player/PlayerProps";
import { float, int, Ponteiro } from "../types/types-cpp-like";
import Mapa from "../utils/dicionarios/Mapa";
import CameraInstance from "./CameraInstance";
import AbstractObjectBase from "./AbstractObjectBase";

/**
* Classe que representa um jogador 
*/
export default class Player extends AbstractObjectBase
{
    public playerProps      : PlayerProps;
    public nome             : string;
    public vidaMaxima       : float;
    public vida             : float;
    public estaminaMaxima   : float; 
    public estamina         : float;
    public inventario       : Mapa<string, ItemInformacoes>;
    public nomeItemEquipado : string;
    public refItemEquipado  : Ponteiro<ItemInformacoes>;
    public modoCamera       : string;
    public idCameraAtual    : int;  // O id da camera que está ativa no momento, que o jogador vê e controla
    public refCameraAtual   : Ponteiro<CameraInstance>;

    constructor( playerProps:PlayerProps )
    {
        // Inicializa propriedades genericas de meu AbstractObjectBase, apenas pra existir
        super({
            mass: 0,
            type: playerProps.objectType, // Por padrão o jogador vai ser um cubo, mais pode ser um modelo OBJ tambem
            obj: "",
            mtl: "",
            name: playerProps.nome,
            classes: [],
            havePhysics: true,
            position: playerProps.position,
            rotation: playerProps.rotation,
            scale: playerProps.scale,
            scaleReduce: playerProps.scaleReduce,
            collide: true,
            collisionEvents: true,
            podeAtravessar: false,
            ignoreCollisions: [],
            proximityConfig: {
                x: 8,
                y: 8,
                z: 8
            },
            isInvisible: playerProps.isInvisible,
            childrenIndividualLights: false,
            useAccumulatedLights: false,
            staticAccumulatedLights: false,
            opacity: playerProps.opacity,
            events: [],
            kick_rate: 0,
            enable_advanced_frame_tracking: playerProps.enable_advanced_frame_tracking,
            onCreate: null,
            attachments: []
        });

        this.playerProps     = playerProps;
        this.nome            = this.playerProps.nome;
        this.vidaMaxima      = this.playerProps.vidaMaxima;
        this.vida            = this.playerProps.vida;
        this.estaminaMaxima  = this.playerProps.estaminaMaxima;
        this.estamina        = this.playerProps.estamina;
        this.inventario      = this.playerProps.inventario;
        this.modoCamera      = "primeira_pessoa";
        this.idCameraAtual   = -1; // Se for -1, vou programar o jogo pra atribuir a primeria que estiver disponivel
        this.refCameraAtual  = null;
        this.nomeItemEquipado = "NENHUM";
        this.refItemEquipado  = null;
    }

    /**
    * Atualiza a movimentação do jogador 
    */
    public updateMovimento(): void
    {
        
    }
    
    /**
    * Atualiza a camera do jogador 
    */
    public updateCamera(): void
    {

    }

    /**
    * Atualiza as situações do jogador, como vida, estamina 
    */
    public updateSituacoes(): void
    {
        
    }

    /**
    * Atualiza coisas relacionadas ao inventario do jogador 
    */
    public updateInventario(): void
    {
        
    }

    /**
    * Atualiza o jogador em geral
    */
    public updatePlayer( firstRender: boolean, 
                         renderizadorPronto: boolean, 
                         frameDelta: float, 
                         frameNumber: int
    ): void{
        /**
        * Como meu ObjectBase tem o método updateObject, e o jogador herda dele, então eu executo ele para atualizar a fisica, e outras logicas
        * Pois o Scene.ts vai chamar o updatePlayer, que vai chamar o updateObject, e em seguida todo o resto das lógicas do jogador.
        */
        this.updateObject(firstRender, 
                          renderizadorPronto, 
                          frameDelta, 
                          frameNumber);

        /**
        * Ai depois em seguida, executo os métodos especificos do jogador 
        */
        this.updateMovimento();
        this.updateCamera();
        this.updateSituacoes();
        this.updateInventario();
    }
}