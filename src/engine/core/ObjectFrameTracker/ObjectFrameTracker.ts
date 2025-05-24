/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectPosition from "../../interfaces/ObjectPosition";
import ObjectScale from "../../interfaces/ObjectScale";
import ObjectVelocity from "../../interfaces/ObjectVelocity";
import ObjectBase from "../ObjectBase";
import Scene from "../Scene";
import ObjectFrameData, { FrameDataOrder } from "./ObjectFrameData";

/**
* Vai guardar todas as informações relevantes do objeto dentro do array frameData, após cada frame 
* Pra poderem ser consultadas posteriormente
*/
export default class ObjectFrameTracker{
    public frameData       : ObjectFrameData[];
    public objetoVinculado : ObjectBase;
    public enabled         : boolean;

    /**
    * Constroi o rastreador de dados do objeto
    */
    constructor( objeto:ObjectBase ){
        this.enabled = true;
        this.objetoVinculado = objeto;
        this.frameData = [];
    }

    public disable(): void
    {
        this.enabled = false;
    }

    public enable(): void
    {
        this.enabled = true;
    }

    /**
    * Registra o estado do objeto no frame atual
    */
    public logObject( order       : FrameDataOrder, //"After" ou "Before" Object Update
                      firstRender : boolean, 
                      renderizadorPronto: boolean, 
                      frameDelta  : number, 
                      frameNumber : number 
    ): void{   
        const velocidade : ObjectVelocity = {... this.objetoVinculado.getVelocity()}; // faz uma copia sem referencia
        const position   : ObjectPosition = {... this.objetoVinculado.getPosition()};
        const scale      : ObjectScale    = {... this.objetoVinculado.getScale()};

        // Se o monitor de frames está ativado
        if( this.enabled )
        {
            this.frameData.push({
                order               : order,
                frameDelta          : frameDelta,
                frameNumber         : frameNumber,
                firstRender         : firstRender,
                renderizadorPronto  : renderizadorPronto,
                velocity            : velocidade,
                position            : position,
                scale               : scale    
            });
        }
    }

    /**
    * Obtem um registro 
    */
    public getFrameByIndex( frameIndex: number ): ObjectFrameData
    {   
        return this.frameData[ frameIndex ];
    }

    /**
    * Consulta os frames passados do objeto 
    */
    public queryFrames(
        parametrosBuscaFrames: {
            order?      : string,
            startFrame? : number,
            endFrame?   : number
        }

    ): ObjectFrameData[] {

        const temOrdem:boolean = (parametrosBuscaFrames.order != undefined) ? true : false;
        const framesEncontrados: ObjectFrameData[] = [];

        // Para cada registro de frame deste objeto
        for( let i = 0 ; i < this.frameData.length ; i++ )
        {
            const dadosFrame: ObjectFrameData = this.getFrameByIndex( i );

            // Se tem ordem
            if( parametrosBuscaFrames.order != undefined && parametrosBuscaFrames.endFrame == undefined && parametrosBuscaFrames.startFrame == undefined ){
                if( dadosFrame.order == parametrosBuscaFrames.order || parametrosBuscaFrames.order == 'all' ){
                    framesEncontrados.push( dadosFrame );
                }

            // SE NAO ACHOU POR ORDEM OU NAO USA ORDEM
            }else {
                // Se está no range de frames
                if( parametrosBuscaFrames.startFrame != undefined && parametrosBuscaFrames.endFrame != undefined )
                {
                    if( dadosFrame.frameNumber >= parametrosBuscaFrames.startFrame && dadosFrame.frameNumber < parametrosBuscaFrames.endFrame 
                        //Se tem ordem inclui, se nao ignora
                        && ( temOrdem == true && parametrosBuscaFrames.order != 'all' ? ( dadosFrame.order == parametrosBuscaFrames.order ) : true )
                    ){
                        framesEncontrados.push( dadosFrame );
                    }

                // se for um range amplo do inicio ao infinito
                }else if( parametrosBuscaFrames.startFrame != undefined && parametrosBuscaFrames.endFrame == undefined ){
                    if( dadosFrame.frameNumber >= parametrosBuscaFrames.startFrame 
                        //Se tem ordem inclui, se nao ignora
                        && ( temOrdem == true && parametrosBuscaFrames.order != 'all' ? ( dadosFrame.order == parametrosBuscaFrames.order ) : true )
                    ){
                        framesEncontrados.push( dadosFrame );
                    }

                // se for um range amplo TUDO até o frame de fim
                }else if( parametrosBuscaFrames.startFrame == undefined && parametrosBuscaFrames.endFrame != undefined ){
                    if( dadosFrame.frameNumber < parametrosBuscaFrames.endFrame 
                        //Se tem ordem inclui, se nao ignora
                        && ( temOrdem == true && parametrosBuscaFrames.order != 'all' ? ( dadosFrame.order == parametrosBuscaFrames.order ) : true )
                    ){
                        framesEncontrados.push( dadosFrame );
                    }
                }
            }
        }

        return framesEncontrados;

    }
}