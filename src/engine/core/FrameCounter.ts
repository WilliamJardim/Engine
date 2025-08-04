import { float, int } from "../types/types-cpp-like";

/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export default class FrameCounter
{
    public init          : float;
    public lastTime      : float; //Ultimo momento em milisegundos em que o calculateFrameDelta foi chamado
    public frameLimit    : float;
    public norm          : float;
    public frameNumber   : float;

    public FPSCalculando   : int;
    public FPSCalculado    : int;
    public ultimoTempoFPS  : float; // O momento em milisegundos da ultima vez que o contador de FPS foi zerado

    constructor( frameLimit:float = 60, norm:float = 16.666 )
    {
        this.init          = this.getTime();
        this.lastTime      = this.init;
        this.frameLimit    = frameLimit;
        this.norm          = norm;
        this.frameNumber   = 0;
        this.FPSCalculando = 0;
        this.FPSCalculado  = 0;
        this.ultimoTempoFPS = -1; // O momento em milisegundos da ultima vez que o contador de FPS foi zerado
    }

    /**
    * Obtem o total de frames já percorridos até o momento
    */
    public getFrameNumber(): int
    {
        return this.frameNumber;
    }

    public getTime(): float
    {
        return performance.now();
    }

    /**
    * Calcula o FPS atual da Engine
    */
    public calcularFPS( agora:float ): void
    {
        this.FPSCalculando++;

        // Se o FPS nunca foi zerado antes
        if( this.ultimoTempoFPS == -1 )
        {
            this.ultimoTempoFPS = agora;
        }

        // Se ja passou um segundo
        if( (agora - this.ultimoTempoFPS) >= 1000 )
        {
            // Zera o contador de FPS
            this.FPSCalculado    = this.FPSCalculando;
            this.FPSCalculando   = 0;
            this.ultimoTempoFPS  = agora;
        }
    }

    /**
    * Obtem o FPS atual da Engine, que foi calculado pelo método acima a cada segundo 
    */
    public getFPSAtual(): int
    {
        return this.FPSCalculado;
    }

    /**
    * Calcula a diferença em milisegundos entre dois frames
    */
    public calculateFrameDelta(): float
    {
        const agora              : float = this.getTime();
        const currentFrameDelta  : float = agora - this.lastTime;

        // Calcula o FPS atual da Engine
        this.calcularFPS( agora );

        this.lastTime = agora;

        this.frameNumber++;
    
        return Math.min(currentFrameDelta, this.frameLimit) / this.norm;
    }
}