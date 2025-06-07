/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import AudioPlayer from "../audio/AudioPlayer";
import LocalSoundProps from "../interfaces/LocalSoundProps";
import ObjectPosition from "../interfaces/ObjectPosition";
import { Ponteiro } from "../types/types-cpp-like";
import AbstractObjectBase from "./AbstractObjectBase";
import Scene from "./Scene";

/**
* Classe responsavel por criar um som 3D local
*/
export default class LocalSound
{
    public scene             : Ponteiro<Scene>;              // é um ponteiro com referencia: *
    public player            : Ponteiro<AbstractObjectBase>;
    public soundProps        : LocalSoundProps; 
    public audioPlayer       : AudioPlayer;
    public currentVolume     : number;
    public isLooping         : boolean;
    public createdTime       : number;

    constructor( soundProps: LocalSoundProps )
    {
        this.scene       = null; // The Scene is a Pointer
        this.player      = null; // The player is a Pointer
        this.soundProps  = {... soundProps};
        this.audioPlayer = new AudioPlayer(); 
        this.createdTime = new Date().getTime();

        // Inicializa o AudioPlayer
        const audioPath : string  = soundProps.audioPath;

        this.audioPlayer.initialize();
        this.audioPlayer.setSrc( audioPath );
        this.currentVolume = 0;

        // Se o audio está em loop
        this.isLooping = this.soundProps.isLooping;

        // Se tem autoplay
        const context = this;
        if( this.soundProps.autoplay == true )
        {
            // Coloquei delay apenas por que no navegador precisa dar tempo da pessoa clicar em algum elemento da pagina
            setTimeout(()=>{
                context.play();
            }, 1000)
        }
    }

    // Toca o som apenas uma vez
    play()
    {   
        this.audioPlayer.setExactCropTime( this.soundProps.begin,  this.soundProps.end );
        this.audioPlayer.play();
    }

    // Determina quando o jogador está perto ou longe do som
    calculateHear(): void
    {
        const soundProps         : LocalSoundProps = this.soundProps;
        const minVolume          : number          = soundProps.initialVolume;
        const maxVolume          : number          = soundProps.maxVolume;
        const soundPosition      : ObjectPosition  = this.soundProps.position;
        const soundX             : number          = soundPosition.x;
        const soundY             : number          = soundPosition.y;
        const soundZ             : number          = soundPosition.z;
        const player             : Ponteiro<AbstractObjectBase> = this.player;

        //Se o ponteiro nao for nulo
        if( player != null )
        {
            const playerPosition    : ObjectPosition = player.getPosition();
            const playerX           : number         = playerPosition.x;
            const playerY           : number         = playerPosition.y;
            const playerZ           : number         = playerPosition.z;
  
            const deltaPlayerAudioX : number         =  playerX - soundX;
            const deltaPlayerAudioY : number         =  playerY - soundY;
            const deltaPlayerAudioZ : number         =  playerZ - soundZ;

            /**
            * Calcula a distancia do som com base nas diferenças de posição 
            */
            const distanciaSom      : number         =  (deltaPlayerAudioX * deltaPlayerAudioX) + 
                                                        (deltaPlayerAudioY * deltaPlayerAudioY) + 
                                                        (deltaPlayerAudioZ * deltaPlayerAudioZ);  

            const distanciaMinima   = 1;

            const volumeSom = maxVolume * (distanciaMinima / (distanciaMinima + distanciaSom));

            this.currentVolume = volumeSom; 

            // Regula pra manter nos limites de volume
            if( this.currentVolume < minVolume )
            {
                this.currentVolume = minVolume;
            }
            if( this.currentVolume > maxVolume )
            {
                this.currentVolume = maxVolume;
            }
        }
    }

    // Atualiza o som na cena do jogo
    updateSound(): void
    {
        // Calcula de quão longe o som vai ser ouvido
        this.calculateHear();

        // Atualiza o volume
        this.audioPlayer.setVolume( this.currentVolume );

        // Chama o callback de atualização do audioPlayer interno
        this.audioPlayer.update();

        // Se o som for ficar em loop sem parar e sem delay
        if( this.isLooping == true )
        {
            if( this.audioPlayer.isTocando == false )
            {
                this.audioPlayer.play();
            }
        }

        // Se o som tem delau pra repetir
        /*
        if( this.audioPlayer.isTocando == false )
        {
            if( this.audioPlayer.lastEndedTime != -1 )
            {
                const tempoAtual   = new Date().getTime();
                const tempoComecar = this.audioPlayer.lastEndedTime + this.soundProps.startDelay;

                if( tempoAtual >= tempoComecar )
                {
                    this.play();
                }
            }
        }
        */

        // Se o som NUNCA foi tocado ainda, espera o delay pra tocar pela primeira vez
        /*
        if( this.soundProps.autoplay == true && this.audioPlayer.neverPlayed == true )
        {
            const tempoAtual   = new Date().getTime();
            const tempoComecar = this.createdTime + this.soundProps.startDelay;

            if( tempoAtual >= tempoComecar )
            {
                this.play();
            }
        }
        */
        
    }

}