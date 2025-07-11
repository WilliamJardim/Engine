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
    public init        : number;
    public lastTime    : number; //Ultimo momento em milisegundos em que o calculateFrameDelta foi chamado
    public frameLimit  : number;
    public norm        : number;
    public frameNumber : number;

    constructor( frameLimit:number = 60, norm:number = 16.666 ){
        this.init        = this.getTime();
        this.lastTime    = this.init;
        this.frameLimit  = frameLimit;
        this.norm        = norm;
        this.frameNumber = 0;
    }

    /**
    * Obtem o total de frames já percorridos até o momento
    */
    public getFrameNumber(): number{
        return this.frameNumber;
    }

    public getTime(): number{
        return performance.now();
    }

    /**
    * Calcula a diferença em milisegundos entre dois frames
    */
    public calculateFrameDelta(): number{
        const agora              : number = this.getTime();
        const currentFrameDelta  : number = agora - this.lastTime;

        this.lastTime = agora;

        this.frameNumber++;

        return Math.min(currentFrameDelta, this.frameLimit) / this.norm;
    }
}