/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import AudioPlayer from "../audio/audioplayer";
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

    constructor( soundProps: LocalSoundProps )
    {
        this.scene       = null; // The Scene is a Pointer
        this.player      = null; // The player is a Pointer
        this.soundProps  = {... soundProps};
        this.audioPlayer = new AudioPlayer(); 

        // Inicializa o AudioPlayer
        const audioPath : string  = soundProps.audioPath;

        this.audioPlayer.initialize();
        this.audioPlayer.setSrc( audioPath );
        this.currentVolume = 0;
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

    updateSound(): void
    {
        // Calcula de quão longe o som vai ser ouvido
        this.calculateHear();

        // Atualiza o volume
        this.audioPlayer.setVolume( this.currentVolume );

        if( this.audioPlayer.isTocando == false )
        {
            this.audioPlayer.play();
        }
    }

}