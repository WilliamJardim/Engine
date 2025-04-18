export default class FrameCounter{
    public init:number;
    public lastTime:number; //Ultimo momento em milisegundos em que o calculateFrameDelta foi chamado
    public frameLimit:number;
    public norm:number;

    constructor( frameLimit:number = 60, norm:number = 16.666 ){
        this.init = this.getTime();
        this.lastTime = this.init;
        this.frameLimit = frameLimit;
        this.norm = norm;
    }

    public getTime(): number{
        return performance.now();
    }

    /**
    * Calcula a diferença em milisegundos entre dois frames
    */
    public calculateFrameDelta(): number{
        const agora:number = this.getTime();
        const currentFrameDelta:number = agora - this.lastTime;

        this.lastTime = agora;

        return Math.min(currentFrameDelta, this.frameLimit) / this.norm;
    }
}