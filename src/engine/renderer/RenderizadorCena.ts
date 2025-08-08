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
import ObjectProps    from '../interfaces/main_engine/ObjectProps';
import SceneConfig    from '../interfaces/main_engine/SceneConfig';
import ArmazenadorEntradaTecladoMouse from '../input/ArmazenadorEntradaTecladoMouse';
import { atomic, float, int, Ponteiro, Thread }   from '../types/types-cpp-like';
import { Renderer } from './Renderer/Renderer';
import { calcularDirecaoCamera, calcularDireitaCamera } from '../utils/render_engine/math';
import { VisualMesh } from './Mesh/VisualMesh';
import { carregarTxt } from '../utils/render_engine/funcoesBase';
import ObjString from '../interfaces/render_engine/ObjString';
import Mapa from '../utils/dicionarios/Mapa';
import { LightRenderizador } from './Mesh/LightRenderizador';
import ObjectPosition from '../interfaces/main_engine/ObjectPosition';
import ObjectScale from '../interfaces/main_engine/ObjectScale';
import LightConfig from '../interfaces/main_engine/LightConfig';
import { LightInstance } from '../core/LightInstance';
import RenderConfig from '../interfaces/render_engine/RenderConfig';
import PropriedadesLuz from '../interfaces/render_engine/PropridadesLuz';
import ConfigCamera from '../interfaces/both_engines/CameraConfig';
import CameraInstance from '../core/CameraInstance';
import CameraRenderizador from './CameraRenderizador';
import AbstractObjectBase from '../core/AbstractObjectBase';
import sleep_thread from '../utils/thread/sleep_thread';
import ThreadInstance from '../utils/thread/ThreadInstance';
import lerTeclaPrecionada from '../utils/teclado/isPrecionandoTecla';

export default class RenderizadorCena
{
    public canvasRef                  : React.RefObject<HTMLCanvasElement>; // Coloquei aqui em cima para deixar claro quais recursos do navegador eu uso, para uma possivel migração pra C++
    public engineScene                : Scene;
    public armazenamentoEntrada       : ArmazenadorEntradaTecladoMouse;
    public toRenderAssociation        : Mapa<string, Ponteiro<VisualMesh>>;
    public toRenderLightsAssociation  : Mapa<string, Ponteiro<LightRenderizador>>;
    public toRenderCameraAssociation  : Mapa<string, Ponteiro<CameraRenderizador>>;
    public renderizador               : Renderer;
    public renderConfig               : RenderConfig;
    public firstRender                : boolean = true;
    public provavelmentePronto        : boolean = false; // Sinaliza se os objetos iniciais foram carregados
    public executandoRenderizacao     : atomic<boolean> = false; // Sinaliza se a Engine já está funcionando ou não
    public LimiteFPS                  : int     = 60;   // Limita o FPS para 60 frames por segundo

    // Armazena todos os OBJ lidos por essa Engine gráfica
    public objLidos                   : Mapa<string, ObjString>;

    constructor( canvasRef:React.RefObject<HTMLCanvasElement> )
    {
        const contexto = this;

        this.provavelmentePronto    = false;
        this.executandoRenderizacao = false;

        this.armazenamentoEntrada = new ArmazenadorEntradaTecladoMouse();

        // Cria a cena da Engine
        this.engineScene = new Scene({
            armazenamentoEntrada           : this.armazenamentoEntrada,
            haveWind                       : true, // A cena vai ter vento
            enable_advanced_frame_tracking : true,
            LimiteFPS                      : this.LimiteFPS // Repassa o LimiteFPS apenas pra consulta
        });

        // Configuração da renderização da Engine
        this.renderConfig = {
            ambient        : 0.4, // Força da luz ambiente
            diffuse        : 0.6,
            specular       : 0.6,
            brilho         : 16,  // Brilho geral
            corAmbient     : [1, 1, 1],
            intensidadeLuz : 1
        };

        // Cria um mapa que associa o id dos objetos da minha engine de logica com o que o meu mini renderizador webgl vai desenhar
        this.toRenderAssociation       = new Mapa<string, Ponteiro<VisualMesh>>();

        // Cria um mapa que associa o id das luzes da minha engine de logica com o que o meu mini renderizador webgl vai desenhar
        this.toRenderLightsAssociation = new Mapa<string, Ponteiro<LightRenderizador>>();

        // Cria um mapa que associa o id das cameras da minha engine de logica com o que o meu mini renderizador webgl vai desenhar
        this.toRenderCameraAssociation = new Mapa<string, Ponteiro<CameraRenderizador>>();


        // Armazena todos os OBJ lidos por essa Engine gráfica
        this.objLidos                  = new Mapa<string, ObjString>();

        //Obtem o canvas
        this.canvasRef = canvasRef;
        
        // CRIA O RENDERIZADOR
        this.renderizador = new Renderer( this.canvasRef, "perspectiva", this.renderConfig );
    
        // Inicia o loop de renderização
        this.renderizador.inicializar();

        // Lista de objetos lidos pelo meu mini renderizador webgl
        window.scene            = this.engineScene;
        window.renderizador     = this.renderizador;
        window.objLidos         = this.objLidos;
        window.luzesAssociadas  = this.toRenderLightsAssociation;
    }

    // Armazena o OBJ lido atualmente
    public salvarOBJMemoria( idObjeto:string, objString:ObjString ): void
    {
        this.objLidos[ idObjeto ] = objString;
    }
    
    /**
    * Função especifica para ler o OBJ associado ao objeto, consultando ele
    */
    public getOBJMemoria( idObjeto:string ): ObjString
    {
        return this.objLidos[ idObjeto ];
    }

    /**
    * Função que lê o objeto e diz que ja foi carregado 
    */
    public async carregarOBJ_seNaoCarregado( idObjeto:string, tipoObjeto:string, caminho_obj:string, caminho_mtl:string ): Promise<boolean>
    {
        const context = this;

        // Se o objeto não está presente no Mapa de OBJs
        if( tipoObjeto == "OBJ" && this.getOBJMemoria( idObjeto ) == null )
        {   
            this.objLidos[ idObjeto ] = {
                obj_string : "",
                mtl_string : "",
                foi_lido   : false,
                concluido  : false,
                carregando : false
            }
        }

        // O carregamento do OBJ ainda não terminou
        if( this.getOBJMemoria( idObjeto ).carregando == false )
        {
            // Diz que o objeto está sendo carregado
            this.objLidos[ idObjeto ].carregando  = true;

            // Cria uma Thread pra fazer o carregamento de forma asincrona
            setTimeout(async function(){
                const idObjetoCarregando : string  = idObjeto;
                const objString          : string  = await carregarTxt( caminho_obj );
                const mtlString          : string  = await carregarTxt( caminho_mtl );

                // Salva e diz que ja terminou de carregar
                context.objLidos[ idObjetoCarregando ].obj_string = objString;
                context.objLidos[ idObjetoCarregando ].mtl_string = mtlString;
                context.objLidos[ idObjetoCarregando ].concluido  = true;
            }, 1);
        }

        return true;
    }

    /** 
    * Atualiza os objetos visualmente, convertendo os objetos da minha Engine principal pra minha Engine de renderização
    * Se o objeto não existe, cria. Se ja existe, só atualiza
    */
    public updateObjectsVisually(): void
    {

        const engineScene         : Scene                                = this.engineScene;
        const engineSceneObjects  : Array<Ponteiro<AbstractObjectBase>>  = engineScene.objects;

        /**
        * Para cada objeto da cena da minha engine 
        */
        for( let i:int = 0 ; i < engineSceneObjects.length ; i++ )
        {
            const objetoAtual : Ponteiro<ObjectBase> = engineSceneObjects[i];

            if( objetoAtual != null )
            {
                const objProps        : ObjectProps     = objetoAtual.objProps;
                const tipoObjeto      : string          = objProps.type;
                const stringsOBJ      : ObjString       = this.getOBJMemoria( objetoAtual.id );
                const isOBJCarregado  : boolean         = stringsOBJ != null;

                // Se for um OBJ
                if( tipoObjeto == "OBJ" )
                {
                    // Se não está carregando o OBJ
                    if( isOBJCarregado == false )
                    {
                        // Inicia o carregamento
                        this.carregarOBJ_seNaoCarregado( objetoAtual.id, 
                                                         tipoObjeto,
                                                         objProps.obj, 
                                                         objProps.mtl );

                        // NOTA: Vai sinalizar que está carregando
                    }
                }

                let podeInserirOBJ   : boolean         = false;
                let jaFoiInserido    : boolean         = false;

                // Se o OBJ ja foi carregado
                if( tipoObjeto == "OBJ" && isOBJCarregado == true)
                {
                    // Se le ja terminou de carregar porém ainda não foi inserido
                    if( stringsOBJ.concluido == true && stringsOBJ.foi_lido == false )
                    {
                        podeInserirOBJ = true;
                    }

                    // Detecta quanto o OBJ ja foi inserido
                    if( stringsOBJ.concluido == true && stringsOBJ.foi_lido == true )
                    {
                        jaFoiInserido = true;
                    }
                }

                //Se o objeto já não foi criado na renderização do meu mini renderizador webgl, cria ele pela primeira vez
                if ( this.toRenderAssociation[objetoAtual.id] == null ) 
                {
                    const context : RenderizadorCena  = this;

                    const atributosObjetos = {
                        tipo: objProps.type,
                        objString : "",
                        mtlString : "",
                        position: objProps.position,
                        scale: objProps.scale,
                        rotation: objProps.rotation,
                        invisivel: objProps.isInvisible,
                        transparencia: objProps.opacity, // 100 opaco

                        // Iluminação
                        alwaysUpdateLights: true,
                        brilho: 0,
                        ambient: 0,
                        diffuse: 0,
                        specular: 0,

                        childrenIndividualLights: true,
                        useAccumulatedLights: true,
                        staticAccumulatedLights: false,
                    };

                    // Avisa se tiver erros bobos
                    if( tipoObjeto != "OBJ" && (objProps.obj != "" || objProps.mtl != "") )
                    {
                        console.warn(`Parece que voce está tentando importar um objeto .OBJ, pra isso altere o "type" do objeto "${objProps.name}" para "OBJ".`);
                    }

                    if( tipoObjeto == "OBJ" && (objProps.obj == "" || objProps.mtl == "") )
                    {
                        console.warn(`O mtl ou obj do objeto "${objProps.name}" não foi preenchido. Isso impossibilita a Engine de carregar esses modelos.`);
                    }

                    // Se o tipo for OBJ, ele só cria ele quando o carregamento terminar
                    if( tipoObjeto == "OBJ" && podeInserirOBJ == true )
                    {
                        // Se for um OBJ e ele ja foi carregado, e ainda não foi inserido no objeto, o faz
                        atributosObjetos.objString = stringsOBJ.obj_string;
                        atributosObjetos.mtlString = stringsOBJ.mtl_string;

                        // Marca que ja foi inserido
                        stringsOBJ.foi_lido = true;

                        // Cria o OBJ no meu mini renderizador
                        const novoObjetoVisual = this.renderizador.criarObjeto(atributosObjetos);
                        this.toRenderAssociation[ objetoAtual.id ] = novoObjetoVisual

                        // ERRO: Mesmo assim, ele ainda continua dando erro na hora de criar o OBJMesh, umas 4 vezes, dos primeiros frames
                        // DEPOIS O ERRO PARA, PORÈM, O OBJETO CONTINUA NÂO SENDO DESENHADO
                        

                    }else if( tipoObjeto != "OBJ" ){
                        const novoObjetoVisual = this.renderizador.criarObjeto(atributosObjetos);
                        this.toRenderAssociation[ objetoAtual.id ] = novoObjetoVisual
                    }
                    
                }   

                /**
                * Atualiza visualmente a posição, rotação e escala dos objetos
                */
                let objetoVisual : Ponteiro<VisualMesh>  = this.toRenderAssociation.get( objetoAtual.id );

                // ENQUANTO ESSA LINHA DE CÒDIGO NUNCA FOR EXECUTADA, OS OBJETOS TODOS APARECEM NORMALMENTE
                // MAIS A PARTIR DO MOMENTO EM QUE ESSA LINHA DE CÒDIGO È EXECUTADA, TUDO SOME
                // E AI O RESTO DO BUG OCORRE, ALGUNS VOLTAM DEPOIS DE CAIR NO CHAO (os objetos com fisica), mais outros não voltam(como os objetos sem fisica)
                if( objetoVisual != null && objetoVisual != undefined )
                {
                    /**
                    * Espelha atributos que a minha engine informou
                    */
                    const position : ObjectPosition  = objetoAtual.getRepresentacaoMesh().position;
                    const rotation : ObjectPosition  = objetoAtual.getRepresentacaoMesh().rotation;
                    const scale    : ObjectScale     = objetoAtual.getRepresentacaoMesh().scale;

                    objetoVisual.nome = objetoAtual.name;

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

                    objetoVisual.invisivel = false;
                }
            }
        }

    }

    /** 
    * Atualiza as luzes visualmente, convertendo as luzes da minha Engine principal pra minha Engine de renderização
    * Se a luz não existe, cria. Se ja existe, só atualiza
    */
    public updateLightsVisually(): void
    {
        const engineScene       : Scene                            = this.engineScene;
        const engineSceneLights : Array<Ponteiro<LightInstance>>   = engineScene.lights;

        /**
        * Para cada objeto da cena da minha engine 
        */
        for( let i:int = 0 ; i < engineSceneLights.length ; i++ )
        {
            const luzAtual : Ponteiro<LightInstance> = engineSceneLights[i]; // o tipo aqui é a luz(tipo LightInstance) da engine prinicipal
            
            if( luzAtual != null )
            {
                const propriedadesLuz : PropriedadesLuz   = luzAtual.getPropriedadesLuz();

                //Se a luz já não foi criado na renderização do meu mini renderizador webgl, cria ele pela primeira vez
                if ( this.toRenderLightsAssociation[ luzAtual.id ] == null ) 
                {
                    // Cria a luz no meu mini renderizador webgl
                    const novaLuzVisual   = this.renderizador.criarLuz( propriedadesLuz );

                    // Se o ponteiro da luz não for null
                    if( novaLuzVisual != null )
                    {
                        this.toRenderLightsAssociation[ luzAtual.id ] = novaLuzVisual;
                    }
                }

                /**
                * Atualiza visualmente a luz
                */
                let luzVisual : Ponteiro<LightRenderizador>  = this.toRenderLightsAssociation.get( luzAtual.id );

                // Copiando os atributos da luz da minha engine de logica para meu mini renderizador webgl
    
                // Se o ponteiro da luz não for null
                if( luzVisual != null )
                {
                    // Posicao 
                    luzVisual.position.x  = propriedadesLuz.position.x;
                    luzVisual.position.y  = propriedadesLuz.position.y;
                    luzVisual.position.z  = propriedadesLuz.position.z;
            
                    luzVisual.ambient     = propriedadesLuz.ambient;
                    luzVisual.raio        = propriedadesLuz.raio;
                    luzVisual.brilho      = propriedadesLuz.brilho;
                    luzVisual.ambient     = propriedadesLuz.ambient;
                    luzVisual.diffuse     = propriedadesLuz.diffuse;
                    luzVisual.specular    = propriedadesLuz.specular;

                    // Cores
                    luzVisual.cor[0]      = propriedadesLuz.cor[0];
                    luzVisual.cor[1]      = propriedadesLuz.cor[1];
                    luzVisual.cor[2]      = propriedadesLuz.cor[2];

                    luzVisual.intensidade = propriedadesLuz.intensidade;
                }
            }
        }
    }

    /** 
    * Atualiza as cameras, convertendo as cameras da minha Engine principal pra minha Engine de renderização
    * Se a camera não existe, cria. Se ja existe, só atualiza
    */
    public updateCamerasVisually()
    {
        const engineScene        : Scene                            = this.engineScene;
        const engineSceneCameras : Array<Ponteiro<CameraInstance>>  = engineScene.cameras;

        /**
        * Para cada camera da cena da minha engine 
        */
        for( let i:int = 0 ; i < engineSceneCameras.length ; i++ )
        {
            const cameraAtual : Ponteiro<CameraInstance> = engineSceneCameras[i]; // o tipo aqui é a luz(tipo LightInstance) da engine prinicipal
            
            if( cameraAtual != null )
            {
                const propriedadesCamera : ConfigCamera   = cameraAtual.getPropriedadesCamera();

                //Se a camera já não foi criado na renderização do meu mini renderizador webgl, cria ele pela primeira vez
                if ( this.toRenderCameraAssociation[ cameraAtual.id ] == null ) 
                {
                    // Cria a camera no meu mini renderizador webgl
                    const novaCameraVisual   = this.renderizador.criarCamera( propriedadesCamera );

                    // Se o novaCameraVisual da luz não for null
                    if( novaCameraVisual != null )
                    {
                        this.toRenderCameraAssociation[ cameraAtual.id ] = novaCameraVisual;
                    }
                }

                /**
                * Atualiza visualmente a luz
                */
                let cameraVisual : Ponteiro<CameraRenderizador>  = this.toRenderCameraAssociation.get( cameraAtual.id );

                // Copiando os atributos da luz da minha engine de logica para meu mini renderizador webgl
    
                // Se o ponteiro da luz não for null
                if( cameraVisual != null )
                {
                    // Camera ativa no meu renderizador
                    this.renderizador.idCameraAtiva = engineScene.idCameraAtiva;

                    // Posicao 
                    cameraVisual.posicaoCamera.x  = propriedadesCamera.posicaoCamera.x;
                    cameraVisual.posicaoCamera.y  = propriedadesCamera.posicaoCamera.y;
                    cameraVisual.posicaoCamera.z  = propriedadesCamera.posicaoCamera.z;

                    // Mira 
                    cameraVisual.miraCamera.x   = propriedadesCamera.miraCamera.x;
                    cameraVisual.miraCamera.y   = propriedadesCamera.miraCamera.y;
                    cameraVisual.miraCamera.z   = propriedadesCamera.miraCamera.z;
        
                    // Outros atributos
                    cameraVisual.nome                 = propriedadesCamera.nome;
                    cameraVisual.passosAndar          = propriedadesCamera.passosAndar;
                    cameraVisual.sensibilidade        = propriedadesCamera.sensibilidade;
                    cameraVisual.limiteMiraCimaBaixo  = propriedadesCamera.limiteMiraCimaBaixo;
                    
                }
            }
        }
    }

    /**
    * NÂO USADO, 08/08/2025 18:09 PM
    * NÂO È POSSIVEL FAZER DESSA FORMA EM JAVASCRIPT/TYPESCRIPT para rodar no navegador, por causa que não é possivel rodar loops while true de forma não bloqueante em duas Theads. 
    * @Thread
    * Thread para ler o teclado e mouse, responsável por capturar teclas do teclado e movimentos do mouse
    *
    public async thread_entrada(): Thread<void>
    {
        const context             : RenderizadorCena = this;

        // Se já estiver rodando
        while( context.executandoRenderizacao == true )
        {
            context.armazenamentoEntrada.keyDetection.W = false;
            context.armazenamentoEntrada.keyDetection.A = false;
            context.armazenamentoEntrada.keyDetection.S = false;
            context.armazenamentoEntrada.keyDetection.D = false;

            if( lerTeclaPrecionada( "w" ) == true )
            {
                context.armazenamentoEntrada.keyDetection.W = true;
            }

            if( lerTeclaPrecionada( "a" ) == true )
            {
                context.armazenamentoEntrada.keyDetection.A = true;
            }

            if( lerTeclaPrecionada( "s" ) == true )
            {
                context.armazenamentoEntrada.keyDetection.S = true;
            }

            if( lerTeclaPrecionada( "d" ) == true )
            {
                context.armazenamentoEntrada.keyDetection.D = true;
            }

            if(context.armazenamentoEntrada.keyDetection.W == true)
            {
                console.log("asdasdasdsadasddsa");
            }
        }
    }
    */

    /**
    * @Esbolço
    * @EtapaThreadPrincipal
    * @RodaPorFrame 
    * Etapa de renderização da thread principal, uma sub-função dedicada para fazer o processamento da entrada do teclado. 
    * 
    * NOTA DE PORTABILIDADE PRA C++:
    *   Não precisaria ter "async" depois do "public"
    *   O "Thread<void>" seria apenas void. Isso é uma função que funcioan de forma sincrona.
    *   "await" também não existiria.
    */
    public async loop_entrada_teclado(): Thread<void>
    {

    }   

    /**
    * @Esbolço
    * @EtapaThreadPrincipal
    * @RodaPorFrame 
    * Etapa de renderização da thread principal, uma sub-função dedicada para fazer o processamento da entrada do mouse. 
    * 
    * NOTA DE PORTABILIDADE PRA C++:
    *   Não precisaria ter "async" depois do "public"
    *   O "Thread<void>" seria apenas void. Isso é uma função que funcioan de forma sincrona.
    *   "await" também não existiria.
    */
    public async loop_entrada_mouse(): Thread<void>
    {

    }

    /**
    * @EtapaThreadPrincipal 
    * @RodaPorFrame
    * Etapa de renderização da thread principal, uma sub-função dedicada para fazer o processamento da lógica, fisica e renderização, de tudo.
    * 
    * Executa uma vez por frame. Ela é chamada a cada frame pelo laço de repetição while, enquanto a minha engine estiver rodando.
    * Em outras palavras: Executa a cada frame.
    * 
    * NOTA DE PORTABILIDADE PRA C++:
    *   Não precisaria ter "async" depois do "public"
    *   O "Thread<void>" seria apenas void. Isso é uma função que funcioan de forma sincrona.
    *   "await" também não existiria.
    */
    public async loop_principal(): Thread<void>
    {
        const context             : RenderizadorCena = this;
        const TempoEsperaPorFrame : float            = 1000 / context.LimiteFPS; // Calcula os milisegundos que serão usados para fazer a espera

        //Outras coisas que vão acontecer
        const milisegundosFrameComecou : float  = context.engineScene.sceneCounter.getTime();
        const frameDelta               : float  = context.engineScene.sceneCounter.calculateFrameDelta(); // Tempo entre frames
        const frameNumber              : float  = context.engineScene.sceneCounter.getFrameNumber();

        // Fornece as informações atualizadas de teclado e mouse para a engine de logica pra usar nas cameras
        context.engineScene.receberInformacoesTecladoMouse( context.armazenamentoEntrada.mousePosition, 
                                                            context.armazenamentoEntrada.keyDetection );

        // Fornece as informações atualizadas de teclado e mouse para o renderizador usar nas cameras
        context.renderizador.receberInformacoesTecladoMouse( context.armazenamentoEntrada.mousePosition, 
                                                             context.armazenamentoEntrada.keyDetection );

        // Só chama o loop da minha engine se o renderizador já está apto para renderizar coisas
        context.engineScene.loop( frameDelta, 
                                  frameNumber, 
                                  context.firstRender, 
                                  context.provavelmentePronto );

        // Atualiza as cameras
        context.updateCamerasVisually();

        // Atualiza a visualização dos objetos
        context.updateObjectsVisually();

        // Atualiza as luzes
        context.updateLightsVisually();

        // TODO: Atualiza os movimentos da camera
        
        // TODO: Renderizar a cena

        // Diz que a primeira renderização já terminou
        context.firstRender = false;

        const milisegundosFrameTerminou : float  = context.engineScene.sceneCounter.getTime();
        const diferencaComecouTerminou  : float  = milisegundosFrameTerminou - milisegundosFrameComecou;

        /**
        * Se a diferença(tempo decorrido neste frame em questão) for menor que o tempo de espera(do FPS) que eu defini, 
        * ai ele vai aguarda ele completar os milisegundos que faltam pra terminar. 
        * Porém, caso contrário, se a diferença for maior, vai seguir direto sem dar sleep, pois não precisa.
        */
        if( diferencaComecouTerminou < TempoEsperaPorFrame )
        {
            // Faz uma pausa, para poder manter o controle do FPS que eu quero
            await sleep_thread( TempoEsperaPorFrame );
        }
    }

    /**
    * @Thread 
    * Thread principal, responsavel por fazer todas as chamadas necessárias para a lógica e renderização. 
    * 
    * NOTA CASO EU QUEIRA PORTAR PRA C++ UM DIA: 
    *   29/07/2025 22:25 PM
    *   Como minha thread principal ela faz tudo: a renderização gráfica e também, o processamento da lógica de jogo, fisica, teclado, mouse, etc
    *   eu não preciso me preocupar com concorrencia e nem sincronização de threads. No entando, se eu precisar ter alguma thread que acessa dados que uma thread está escrevendo por exemplo, ai eu precisaria usar mutex, atomics, condition_variable do C++
    *   só esse detalhe, caso um dia eu queira portar isso pra C++
    * 
    *   Tambem não preciso me preocupar com tempo de vida, pois, as variaveis e ponteiros não são destruidos em lugar nenhum.
    *   Se uma thread fizesse uso de alguma variavel ou ponteiro que pode ser destruido em algum momento, eu preciso tratar isso, para a thread não dar crash no programa.
    *   Eu preciso ter certeza de que todas as variaveis que uma thread usa vão estar realmente disponiveis e não tenham sido destruidas.
    * 
    * NOTA DE PORTABILIDADE PRA C++:
    *   Não precisaria ter "async" depois do "public"
    *   O "Thread<void>" seria apenas void. Isso é uma função que funcioan de forma sincrona.
    *   "await" também não existiria.
    */
    public async thread_loop_principal(): Thread<void>
    {
        const context             : RenderizadorCena = this;

        // Se o ponteiro não for null
        if( this.canvasRef.current != null )
        {   
            // Se já estiver rodando
            while( context.executandoRenderizacao == true )
            {
                /**
                * Faz o processamento do teclado e mouse 
                */
                await this.loop_entrada_teclado();
                await this.loop_entrada_mouse();

                /**
                * Faz o processamento de logica de jogo, fisica e renderização  
                */
                await this.loop_principal();
            }

            // Quando o loop principal terminar
            this.encerrar();
        }   
    }

    //Função que inicia o loop principal
    public iniciar(): void
    {
        const context = this;

        // Aguarda um pouco o meu mini renderizador webgl terminar de carregar os objetos
        setTimeout(function(){
            context.provavelmentePronto = true;
        }, 500);

        // Diz pra minha Engine que ela já está executando
        context.executandoRenderizacao = true;

        // Cria a Thread principal usada na renderização
        const thread_principal = new ThreadInstance( context.thread_loop_principal, context ); // Executa a função loop_principal passando o própia context, ou seja, o this
        thread_principal.detach();
    }

    // Função que vai destruir o Renderizador
    public encerrar(): void
    {
        const context = this;

        // Manda a thread principal parar de rodar
        context.executandoRenderizacao = false;
        context.provavelmentePronto = false;
    }

    public getRenderizador(): Renderer
    {
        return this.renderizador;
    }

    public getCanvas(): React.RefObject<HTMLCanvasElement>
    {
        return this.canvasRef;
    }
}

/**
* ESPECIFICO PARA O JAVSCRIPT( em C++ não iria precisar disso ):
* 
* Estou fazendo isso para ele capturar informações do teclado e armazenar globalmente,
* eu vou usar as informações do keyDetection_geral dentro de minhas funções abstratas da minha pasta utils, para acessar o teclado por meio disso
* PORÈM SIMULANDO UM ESTILO VISUAL QUE LEMBRA O ESTILO QUE EU FARIA EM C++, pra compatibilidade, pra mim sempre lembrar como eu faria em C++
*/
/*
window.keyDetection_geral  = { 
                               SHIFT      : false,
                               W          : false,
                               A          : false,
                               S          : false,
                               D          : false,
                               ArrowUp    : false,
                               ArrowDown  : false,
                               ArrowLeft  : false,
                               ArrowRight : false 
                           };

const onKeyDown_geral = (event: KeyboardEvent) => {
    
    if( window.keyDetection_geral != undefined )
    {
        if(event.code == "ArrowUp")
        {
            window.keyDetection_geral.ArrowUp = true;
        }

        if(event.code == "KeyW")
        {
            window.keyDetection_geral.W = true;
        }      

        if(event.code == "ArrowDown")
        {
            window.keyDetection_geral.ArrowDown = true;
        }

        if(event.code == "KeyS")
        {
            window.keyDetection_geral.S = true;
        }

        if(event.code == "ArrowLeft")
        {
            window.keyDetection_geral.ArrowLeft = true;
        }

        if(event.code == "KeyA")
        {
            window.keyDetection_geral.A = true;
        }

        if(event.code == "ArrowRight")
        {
            window.keyDetection_geral.ArrowRight = true;
        }

        if(event.code == "KeyD")
        {
            window.keyDetection_geral.D = true;
        }

        if( event.shiftKey == true ){
            window.keyDetection_geral.SHIFT = true;
        }
    }
    
};

const onKeyUp_geral = (event: KeyboardEvent) => {

    if( window.keyDetection_geral != undefined )
    {
        if(event.code == "ArrowUp")
        {
            window.keyDetection_geral.ArrowUp = false;
        }

        if(event.code == "KeyW")
        {
            window.keyDetection_geral.W = false;
        }      

        if(event.code == "ArrowDown")
        {
            window.keyDetection_geral.ArrowDown = false;
        }

        if(event.code == "KeyS")
        {
            window.keyDetection_geral.S = false;
        }

        if(event.code == "ArrowLeft")
        {
            window.keyDetection_geral.ArrowLeft = false;
        }

        if(event.code == "KeyA")
        {
            window.keyDetection_geral.A = false;
        }

        if(event.code == "ArrowRight")
        {
            window.keyDetection_geral.ArrowRight = false;
        }

        if(event.code == "KeyD")
        {
            window.keyDetection_geral.D = false;
        }

        if( event.shiftKey == true ){
            window.keyDetection_geral.SHIFT = false;
        }

        // Mesmo que não seja o Shift, se eu soltar qualquer tecla, ele ja para de dar sinal de Shift, pra ajudar na minha de logica de correr com a camera
        if( event.shiftKey == false ){
            window.keyDetection_geral.SHIFT = false;
        }
    }
    
};

document.addEventListener("keydown", onKeyDown_geral);
document.addEventListener("keyup",   onKeyUp_geral);

// FIM DAS FUNÇÔES ESPECIFICAS DO JAVASCRIPT.

Se eu quisse seguir essa ideia, eu só precisaria verificar se o window.keyDetection_geral existe e verificar as teclas
*/