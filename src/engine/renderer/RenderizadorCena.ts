/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

/**
* Wrapper para facilitar a comunicação com meu mini renderizador webgl 
*/

import React          from 'react';
import ObjectBase     from '../core/ObjectBase';
import Scene          from '../core/Scene';
import ObjectProps    from '../interfaces/ObjectProps';
import InputListener  from '../input/InputListener';
import SceneConfig    from '../interfaces/SceneConfig';
import { Ponteiro }   from '../types/types-cpp-like';

export default class RenderizadorCena
{
    public engineScene          : Scene;
    public inputListener        : InputListener;
    public toRenderAssociation  : Map<string, any>;
    public scene                : any;
    public renderizador         : any;
    public canvasRef            : React.RefObject<HTMLDivElement>;
    public firstRender          : boolean = true;
    public provavelmentePronto  : boolean = false; //Sinaliza se os objetos iniciais foram carregados

    constructor( canvasRef:any )
    {
        const contexto = this;

        this.provavelmentePronto = false;

        this.inputListener = new InputListener();

        // Cria a cena da Engine
        this.engineScene = new Scene({
            inputListener                  : this.inputListener,
            haveWind                       : true, // A cena vai ter vento
            enable_advanced_frame_tracking : true
        });

        // Cria um mapa que associa o id dos objetos da minha engine com o que o meu mini renderizador webgl vai desenhar
        this.toRenderAssociation = new Map<string, any>();

        //Obtem o canvas
        this.canvasRef = canvasRef;
        
        // Configurar cena, câmera e renderizador
        
        // CRIA A CENA
        this.scene = ;

        // Define luz ambiente para iluminar a cena de forma geral

        // CRIA O RENDERIZADOR
        this.renderizador = ;
    }

    /**
    * Adiciona um objeto na cena que o meu mini renderizador webgl está renderizando para que este objeto seja renderizado visualmente
    */
    public addToRender( objeto:any ): void
    {
        if( objeto != null && objeto != undefined )
        {
            this.scene.criarObjeto( objeto );
        }
    }

    /** 
    * Atualiza os objetos visualmente
    */
    public updateObjectsVisually(): void
    {

        const engineScene         = this.engineScene;
        const engineSceneObjects  = engineScene.objects;

        /**
        * Para cada objeto da cena da minha engine 
        */
        for( let i = 0 ; i < engineSceneObjects.length ; i++ )
        {
            const objetoAtual : Ponteiro<ObjectBase> = engineSceneObjects[i];

            if( objetoAtual != null )
            {
                const objProps   : ObjectProps     = objetoAtual.objProps;
                const tipoObjeto : string          = objProps.type;

                //Se o objeto já não foi criado na renderização do meu mini renderizador webgl, cria ele pela primeira vez
                if ( !this.toRenderAssociation.has(objetoAtual.id) ) 
                {
                    // TODO: Cria o novo objeto visual
                    const novoObjetoVisual = null;

                    this.addToRender( novoObjetoVisual );
                    this.toRenderAssociation.set(objetoAtual.id, novoObjetoVisual);
                }   

                /**
                * Atualiza visualmente a posição, rotação e escala dos objetos
                */
                let objetoVisual = this.toRenderAssociation.get( objetoAtual.id );

                // ENQUANTO ESSA LINHA DE CÒDIGO NUNCA FOR EXECUTADA, OS OBJETOS TODOS APARECEM NORMALMENTE
                // MAIS A PARTIR DO MOMENTO EM QUE ESSA LINHA DE CÒDIGO È EXECUTADA, TUDO SOME
                // E AI O RESTO DO BUG OCORRE, ALGUNS VOLTAM DEPOIS DE CAIR NO CHAO (os objetos com fisica), mais outros não voltam(como os objetos sem fisica)
                if( objetoVisual != null && objetoVisual != undefined )
                {
                    /**
                    * Espelha atributos que a minha engine informou
                    */
                    const position : any = objetoAtual.getRepresentacaoMesh().position;
                    const rotation : any = objetoAtual.getRepresentacaoMesh().rotation;
                    const scale    : any = objetoAtual.getRepresentacaoMesh().scale;

                    if(position != undefined && position != null)
                    {
                        objetoVisual.position.x = position.x;
                        objetoVisual.position.y = position.y;
                        objetoVisual.position.z = position.z;
                    }

                    if(rotation != undefined && rotation != null)
                    {
                        objetoVisual.rotation.x = rotation.x;
                        objetoVisual.rotation.y = rotation.y;
                        objetoVisual.rotation.z = rotation.z;
                    }
                    
                    if(scale != undefined && scale != null)
                    {
                        objetoVisual.scale.x = scale.x;
                        objetoVisual.scale.y = scale.y;
                        objetoVisual.scale.z = scale.z;
                    }

                    objetoVisual.isInvisible = true;
                }
            }
        }

    }

    //Função que chama o loop "animate"
    public iniciar(): void
    {
        const context = this;

        //Se não tem, ignora
        if ( this.canvasRef.current == null )
        { 
            return;
        }

        function animate()
        {
            requestAnimationFrame(animate);
    
            //Outras coisas que vão acontecer
            const frameDelta  = context.engineScene.sceneCounter.calculateFrameDelta(); // Tempo entre frames
            const frameNumber = context.engineScene.sceneCounter.getFrameNumber();

            // Só chama o loop da minha engine se o renderizador já está apto para renderizar coisas
            context.engineScene.loop( frameDelta, 
                                      frameNumber, 
                                      context.firstRender, 
                                      context.provavelmentePronto );

            // Atualiza a visualização dos objetos
            context.updateObjectsVisually();

            // TODO: Atualiza os movimentos da camera
            
            // TODO: Renderizar a cena

            // Diz que a primeira renderização já terminou
            context.firstRender = false;
        }

        //Aguarda um pouco o meu mini renderizador webgl terminar de carregar os objetos
        setTimeout(function(){
            context.provavelmentePronto = true;
        }, 500);

        animate();
    }

    // Função que vai destruir o Renderizador
    public encerrar(): void
    {
        
    }

    public getRenderizador(): any
    {
        return this.renderizador;
    }

    public getCanvas(): React.RefObject<HTMLDivElement>
    {
        return this.canvasRef;
    }
}