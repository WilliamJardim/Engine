import { float } from "../../types/types-cpp-like";

/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export default class AudioPlayer
{ 
    public audioRef       : HTMLAudioElement;
    public lastTime       : float;
    public isTocando      : boolean;
    public begin          : float;
    public end            : float;
    public firstPlayed    : boolean; //Se foi tocado pela primeira vez
    public neverPlayed    : boolean;
    public lastPlayedTime : float;
    public lastEndedTime  : float;

    constructor()
    {
        this.audioRef       = new Audio();   
        this.lastTime       = 0;
        this.isTocando      = false;
        this.begin          = 0;
        this.end            = -1;
        this.firstPlayed    = false;
        this.neverPlayed    = true;
        this.lastPlayedTime = -1;
        this.lastEndedTime  = -1;
    }

    initialize()
    {
        this.lastTime    = 0;
        this.isTocando   = false;
        this.neverPlayed = true;

        // Mais coisas se eu quiser
    }

    setVolume( volume: float )
    {
        this.audioRef.volume = volume;
    }

    // Define o segundo de inicio e fim do audio, caso ele seja muito grande
    setExactCropTime( begin: float, end: float )
    {
        if( begin != -1 )
        {
            this.begin = begin;
        }

        if( end != -1 )
        {
            this.end = end;
        }
    }

    setSrc( src: string )
    {
        this.audioRef.src = src;
        this.lastTime     = 0;
        this.isTocando    = false;
        this.neverPlayed  = true;
    }

    play()
    {
        // Se tem inicio
        if( this.begin != -1 )
        {
            this.audioRef.currentTime = this.begin;
        }

        this.audioRef.play();
        this.isTocando      = true;
        this.firstPlayed    = true;
        this.neverPlayed    = false;
        this.lastPlayedTime = new Date().getTime();
    }

    stop()
    {
        this.audioRef.pause();
        this.audioRef.currentTime = 0;
        this.isTocando     = false;
        this.lastEndedTime = new Date().getTime();
    }

    pause()
    {
        this.lastTime = this.audioRef.currentTime;
        this.audioRef.pause();
        this.isTocando = false;
    }

    resume()
    {
        this.audioRef.currentTime = this.lastTime;
        this.audioRef.play();
        this.isTocando = true;
    }

    forwardSecounds( secounds: float )
    {
        this.firstPlayed = true;
        this.lastTime = this.audioRef.currentTime;
        this.audioRef.currentTime = this.lastTime + secounds;
        this.audioRef.play();

        this.isTocando      = true;
        this.neverPlayed    = false;
        this.lastPlayedTime = new Date().getTime();

        // Se ultrapassou o limite do propio audio
        if( this.audioRef.currentTime > this.audioRef.duration && this.audioRef.duration > 0 )
        {
            this.audioRef.currentTime = this.audioRef.duration;
        }

        // Se tem final definido
        if( this.end != -1 )
        {
            if( this.audioRef.currentTime >= this.end )
            {
                this.audioRef.currentTime = this.end;
            }
        }
    }

    backSecounds( secounds: float )
    {
        this.firstPlayed = true;
        this.neverPlayed = false;
        
        this.lastTime             = this.audioRef.currentTime;
        this.audioRef.currentTime = this.lastTime - secounds;
        this.lastPlayedTime       = new Date().getTime();

        // If is minor that zero
        if( this.audioRef.currentTime < 0 )
        {
            this.audioRef.currentTime = 0;
        }

        this.audioRef.play();
        this.isTocando = true;
    }

    // Atualiza o audioPlayer, por exemplo, para detectar um corte
    update()
    {
        // Se ultrapassou o limite do propio audio
        if( this.audioRef.currentTime > this.audioRef.duration && this.audioRef.duration > 0 )
        {
            this.audioRef.currentTime = this.audioRef.duration;
            this.isTocando = false;
        }

        // Se o audio comecou antes do esperado
        if( this.audioRef.currentTime < this.begin )
        {
            this.audioRef.currentTime = this.begin;
        }

        // Se ultrapassou o limite
        if( this.end != -1 )
        {
            if( this.audioRef.currentTime >= this.end )
            {
                this.stop();
            }
        }
    }
}