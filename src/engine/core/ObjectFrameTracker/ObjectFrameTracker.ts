/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectPosition      from "../../interfaces/main_engine/ObjectPosition";
import ObjectScale         from "../../interfaces/main_engine/ObjectScale";
import ObjectVelocity      from "../../interfaces/main_engine/ObjectVelocity";
import AbstractObjectBase  from "../AbstractObjectBase";
import ObjectFrameData, { FrameDataOrder } from "./ObjectFrameData";
import { float, int, Ponteiro }        from "../../types/types-cpp-like";

/**
* Vai guardar todas as informações relevantes do objeto dentro do array frameData, após cada frame 
* Pra poderem ser consultadas posteriormente
*/
export default class ObjectFrameTracker{
    public frameData       : Array<ObjectFrameData>;
    public objetoVinculado : Ponteiro<AbstractObjectBase>;
    public enabled         : boolean;

    /**
    * Constroi o rastreador de dados do objeto
    */
    constructor( objeto:Ponteiro<AbstractObjectBase> ){
        this.enabled         = true;
        this.objetoVinculado = objeto;
        this.frameData       = new Array<ObjectFrameData>();
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
                      frameDelta  : float, 
                      frameNumber : int 
    ): void{   
        const objeto : Ponteiro<AbstractObjectBase> = this.objetoVinculado;

        // Se o ponteiro não for nulo
        if( objeto != null )
        {
            const velocidade : ObjectVelocity = {... objeto.getVelocity()}; // faz uma copia sem referencia
            const position   : ObjectPosition = {... objeto.getPosition()};
            const scale      : ObjectScale    = {... objeto.getScale()};

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
    }

    /**
    * Obtem um registro 
    */
    public getFrameByIndex( frameIndex: float ): ObjectFrameData
    {   
        return this.frameData[ frameIndex ];
    }

    /**
    * Retorna os frames passados do objeto 
    */
    public getFrames(): Array<ObjectFrameData>
    {
        return this.frameData;
    }

    /**
    * Retorna os frames passados do objeto, POR ORDEM DE afterUpdate 
    */
    public getFramesAfterEachUpdate(): Array<ObjectFrameData>
    {
        const framesEncontrados: Array<ObjectFrameData> = new Array();

        // Para cada registro de frame deste objeto
        for( let i:int = 0 ; i < this.frameData.length ; i++ )
        {
            const dadosFrame: ObjectFrameData = this.getFrameByIndex( i );

            if( dadosFrame.order == "afterUpdate" )
            {
                framesEncontrados.push( dadosFrame );
            }
        }

        return framesEncontrados;
    }

    /**
    * Retorna os frames passados do objeto, POR ORDEM DE beforeUpdate 
    */
    public getFramesBeforeEachUpdate(): ObjectFrameData[]
    {
        const framesEncontrados: Array<ObjectFrameData> = new Array();

        // Para cada registro de frame deste objeto
        for( let i:int = 0 ; i < this.frameData.length ; i++ )
        {
            const dadosFrame: ObjectFrameData = this.getFrameByIndex( i );

            if( dadosFrame.order == "beforeUpdate" )
            {
                framesEncontrados.push( dadosFrame );
            }
        }

        return framesEncontrados;
    }

    /**
    * Consulta os frames passados do objeto 
    */
    public queryFrames(
        parametrosBuscaFrames: {
            order      : string,
            startFrame : int,
            endFrame   : int
        }

    ): Array<ObjectFrameData> {

        const temOrdem:boolean = (parametrosBuscaFrames.order != "nenhuma") ? true : false;
        const framesEncontrados: Array<ObjectFrameData> = new Array();

        // Para cada registro de frame deste objeto
        for( let i:int = 0 ; i < this.frameData.length ; i++ )
        {
            const dadosFrame: ObjectFrameData = this.getFrameByIndex( i );

            // Se tem ordem
            if( parametrosBuscaFrames.order != "nenhuma" && parametrosBuscaFrames.endFrame == -1 && parametrosBuscaFrames.startFrame == -1 ){
                if( dadosFrame.order == parametrosBuscaFrames.order || parametrosBuscaFrames.order == "all" ){
                    framesEncontrados.push( dadosFrame );
                }

            // SE NAO ACHOU POR ORDEM OU NAO USA ORDEM
            }else {
                // Se está no range de frames
                if( parametrosBuscaFrames.startFrame != -1 && parametrosBuscaFrames.endFrame != -1 )
                {
                    if( dadosFrame.frameNumber >= parametrosBuscaFrames.startFrame && dadosFrame.frameNumber < parametrosBuscaFrames.endFrame 
                        //Se tem ordem inclui, se nao ignora
                        && ( temOrdem == true && parametrosBuscaFrames.order != "all" ? ( dadosFrame.order == parametrosBuscaFrames.order ) : true )
                    ){
                        framesEncontrados.push( dadosFrame );
                    }

                // se for um range amplo do inicio ao infinito
                }else if( parametrosBuscaFrames.startFrame != -1 && parametrosBuscaFrames.endFrame == -1 ){
                    if( dadosFrame.frameNumber >= parametrosBuscaFrames.startFrame 
                        //Se tem ordem inclui, se nao ignora
                        && ( temOrdem == true && parametrosBuscaFrames.order != "all" ? ( dadosFrame.order == parametrosBuscaFrames.order ) : true )
                    ){
                        framesEncontrados.push( dadosFrame );
                    }

                // se for um range amplo TUDO até o frame de fim
                }else if( parametrosBuscaFrames.startFrame == -1 && parametrosBuscaFrames.endFrame != -1 ){
                    if( dadosFrame.frameNumber < parametrosBuscaFrames.endFrame 
                        //Se tem ordem inclui, se nao ignora
                        && ( temOrdem == true && parametrosBuscaFrames.order != "all" ? ( dadosFrame.order == parametrosBuscaFrames.order ) : true )
                    ){
                        framesEncontrados.push( dadosFrame );
                    }
                }
            }
        }

        return framesEncontrados;

    }
}