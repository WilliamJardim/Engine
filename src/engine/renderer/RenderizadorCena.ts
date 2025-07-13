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
import { Renderer } from './Renderer/Renderer';
import { calcularDirecaoCamera, calcularDireitaCamera } from './utils/math';
import { VisualMesh } from './Mesh/VisualMesh';
import { carregarTxt } from './utils/funcoesBase';

export default class RenderizadorCena
{
    public engineScene          : Scene;
    public inputListener        : InputListener;
    public toRenderAssociation  : Map<string, any>;
    public scene                : any;
    public renderizador         : any;
    public canvasRef            : React.RefObject<HTMLCanvasElement>;
    public firstRender          : boolean = true;
    public provavelmentePronto  : boolean = false; //Sinaliza se os objetos iniciais foram carregados

    constructor( canvasRef:React.RefObject<HTMLCanvasElement> )
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
        
        // CRIA O RENDERIZADOR
        this.renderizador = new Renderer( this.canvasRef, "perspectiva" );
    
        // Inicia o loop de renderização
        this.renderizador.inicializar();

        this.renderizador.miraCamera[0] = 0;
        this.renderizador.miraCamera[1] = 0;
        this.renderizador.miraCamera[2] = 0;

        const sensibilidade = 0.03;
        const limiteX       = 10; 
        const limiteY       = 10; 
        let passos          = 0.5;

        const contextoPlayer = {
            mousePosition: {
                x: 0,
                y: 0
            },
            keyDetection: {
                SHIFT: false,
                A: false,
                W: false,
                S: false,
                D: false,
                ArrowLeft: false,
                ArrowRight: false,
                ArrowUp: false,
                ArrowDown: false
            }
        }

        // Atualiza a posição do mouse
        function onMouseMove(event:any) 
        {
            const viradaEsquerdaOrigem = contexto.renderizador.miraCamera[0] >= 1.4918051575931215  ? true : false;
            const viradaDireitaOrigem  = contexto.renderizador.miraCamera[0] <= -1.4918051575931215 ? true : false;
        
            // Normaliza a posição do mouse para o intervalo de -1 a 1
            contextoPlayer.mousePosition.x =  (event.clientX / window.innerWidth)  * 2 - 1;
            contextoPlayer.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
            contexto.renderizador.miraCamera[0] -= sensibilidade * contextoPlayer.mousePosition.y;
            contexto.renderizador.miraCamera[1] += sensibilidade * contextoPlayer.mousePosition.x;
        }
        
        // Adiciona o evento de movimento do mouse
        window.addEventListener('mousemove', onMouseMove, false);
        
        function onAndar()
        {
            if( contextoPlayer.keyDetection.SHIFT )
            {
                passos = 3.5;
            }else{
                passos = 0.9;
            }
        
            const frameDelta = contexto.renderizador.lastFrameDelta;
           
            // Calcula a direção da câmera com base na rotação
            const direcao = calcularDirecaoCamera(contexto.renderizador.miraCamera);
        
            // Calcula o vetor "direita" (eixo X local)
            const direita = calcularDireitaCamera(direcao);
        
            // Aplica movimentação com base em eixos locais
            const velocidadeFinal = passos * frameDelta;
        
            if (contextoPlayer.keyDetection.W) {
                contexto.renderizador.posicaoCamera[0] += direcao[0] * velocidadeFinal;
                contexto.renderizador.posicaoCamera[1] += direcao[1] * velocidadeFinal;
                contexto.renderizador.posicaoCamera[2] += direcao[2] * velocidadeFinal;
            }
            if (contextoPlayer.keyDetection.S) {
                contexto.renderizador.posicaoCamera[0] -= direcao[0] * velocidadeFinal;
                contexto.renderizador.posicaoCamera[1] -= direcao[1] * velocidadeFinal;
                contexto.renderizador.posicaoCamera[2] -= direcao[2] * velocidadeFinal;
            }
            if (contextoPlayer.keyDetection.A) {
                contexto.renderizador.posicaoCamera[0] += direita[0] * velocidadeFinal;
                contexto.renderizador.posicaoCamera[1] += direita[1] * velocidadeFinal;
                contexto.renderizador.posicaoCamera[2] += direita[2] * velocidadeFinal;
            }
            if (contextoPlayer.keyDetection.D) {
                contexto.renderizador.posicaoCamera[0] -= direita[0] * velocidadeFinal;
                contexto.renderizador.posicaoCamera[1] -= direita[1] * velocidadeFinal;
                contexto.renderizador.posicaoCamera[2] -= direita[2] * velocidadeFinal;
            }
        }
        
        const onKeyDown = (event:any) => {
                    
            switch (event.code) {
                case 'ArrowUp':
                    contextoPlayer.keyDetection.ArrowUp = true;
                    break;
                case 'KeyW':
                    contextoPlayer.keyDetection.W = true;
                    break;
                case 'ArrowDown':
                    contextoPlayer.keyDetection.ArrowDown = true;
                    break;
                case 'KeyS':
                    contextoPlayer.keyDetection.S = true;
                    break;
                case 'ArrowLeft':
                    contextoPlayer.keyDetection.ArrowLeft = true;
                    break;
                case 'KeyA':
                    contextoPlayer.keyDetection.A = true;
                    break;
                case 'ArrowRight':
                    contextoPlayer.keyDetection.ArrowRight = true;
                    break;
                case 'KeyD':
                    contextoPlayer.keyDetection.D = true;
                    break;
            }
        
            if( event.shiftKey ){
                contextoPlayer.keyDetection.SHIFT = true;
            }
        
            onAndar();
        };
        
        const onKeyUp = (event:any) => {
        
            switch (event.code) {
                case 'ArrowUp':
                    contextoPlayer.keyDetection.ArrowUp = false;
                    break;
                case 'KeyW':
                    contextoPlayer.keyDetection.W = false;
                    break;
                case 'ArrowDown':
                    contextoPlayer.keyDetection.ArrowDown = false;
                    break;
                case 'KeyS':
                    contextoPlayer.keyDetection.S = false;
                    break;
                case 'ArrowLeft':
                    contextoPlayer.keyDetection.ArrowLeft = false;
                    break;
                case 'KeyA':
                    contextoPlayer.keyDetection.A = false;
                    break;
                case 'ArrowRight':
                    contextoPlayer.keyDetection.ArrowRight = false;
                    break;
                case 'KeyD':
                    contextoPlayer.keyDetection.D = false;
                    break;
            }
        
            if( event.shiftKey ){
                contextoPlayer.keyDetection.SHIFT = false;
            }
        
            onAndar();
        };
        
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup',   onKeyUp);
        
        function loopTeste(){
            requestAnimationFrame(loopTeste)
        
            // Mantem a rotação Y da camera estavel
            if( contexto.renderizador.miraCamera[0] > 1.6183333333333352 ){
                contexto.renderizador.miraCamera[0] = 1.6183333333333352;
            }
            if( contexto.renderizador.miraCamera[0] < -1.6183333333333352 ){
                contexto.renderizador.miraCamera[0] = -1.6183333333333352;
            }
        
        }
        loopTeste();
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
                    const context = this;

                    const atributosObjetos = {
                        tipo: objProps.type,
                        obj : "",
                        mtl : "",
                        position: objProps.position,
                        scale: objProps.scale,
                        rotation: objProps.rotation,
                        invisivel: false,
                        transparencia: 1, // 100 opaco

                        // Iluminação
                        alwaysUpdateLights: true,
                        brilho: 32,
                        ambient: 0.6,
                        diffuse: 0.8,
                        specular: 0.8,

                        childrenIndividualLights: true,
                        useAccumulatedLights: true,
                        staticAccumulatedLights: false,
                    };

                    // Avisa se tiver erros bobos
                    if( objProps.type != "OBJ" && (objProps.obj != "" || objProps.mtl != "") )
                    {
                        console.warn(`Parece que voce está tentando importar um objeto .OBJ, pra isso altere o 'type' do objeto '${objProps.name}' para 'OBJ'.`);
                    }

                    if( objProps.type == "OBJ" && (objProps.obj == "" || objProps.mtl == "") )
                    {
                        console.warn(`O mtl ou obj do objeto '${objProps.name}' não foi preenchido. Isso impossibilita a Engine de carregar esses modelos.`);
                    }

                    // Se for um objeto pode carregar o modelo
                    /*
                    IDEIA DE COMO CARREGAR O OBJETO 
                    MAIS EU PRECISO TOMAR CUIDADO PRA ELE NÂO CARREGAR TODA HORA
                    PRA ELE CARREGAR SÒ UMA VEZ, E PRA DEPOIS ATUALIZAR A POSICAO, ROTACAO E ESCALA NO LOOP
                    if( objProps.type == "OBJ" )
                    {
                        async function carregarModelo() 
                        {
                            atributosObjetos.obj = await carregarTxt(objProps.obj);
                            atributosObjetos.mtl = await carregarTxt(objProps.mtl);
                            
                            // Cria com o modelo carregado
                            const novoObjetoVisual = context.renderizador.criarObjeto(atributosObjetos);
                            context.toRenderAssociation.set(objetoAtual!.id, novoObjetoVisual);
                        }
                        carregarModelo();

                    // Cria assim
                    }else{
                        const novoObjetoVisual = this.renderizador.criarObjeto(atributosObjetos);
                        this.toRenderAssociation.set(objetoAtual.id, novoObjetoVisual);
                    }
                    */

                    const novoObjetoVisual = this.renderizador.criarObjeto(atributosObjetos);
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

                    objetoVisual.isInvisible = false;
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

    public getCanvas(): React.RefObject<HTMLCanvasElement>
    {
        return this.canvasRef;
    }
}