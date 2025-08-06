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
* Importando funções essenciais 
*/
import { createShader, createBuffer, createProgram, carregarTextura } from '../../utils/render_engine/funcoesBase.js';
import { criarGL }    from '../../utils/render_engine/funcoesBase.js';
import {CriarMatrix4x4, 
        MultiplicarMatrix4x4, 
        CriarMatrixPerspectiva, 
        CriarMatrixOrtografica,
        CriarMatrixPontoVista,
        DefinirTranslacao, 
        RotacionarX, 
        RotacionarY, 
        RotacionarZ, 
        DefinirRotacao, 
        DefinirX, 
        DefinirY, 
        DefinirZ,
        FrameCounter,
        booleanToNumber} from '../../utils/render_engine/math.js';
        
/**
* Importando shaders 
*/
import { baseShaders } from '../Shaders/Base.js';
import { skyboxPlaneShaders } from '../Shaders/planeskybox.js';

/**
* Importando Meshes 
*/
import { CuboMesh } from '../Mesh/colored/CuboMesh.ts';
import { CuboDeformavelMesh } from '../Mesh/colored/CuboDeformavelMesh.ts';
import { PlanoOnduladoMesh } from '../Mesh/colored/PlanoOnduladoMesh.ts';
import { TexturedUVCuboMesh } from '../Mesh/textured/TexturedUVCubeMesh.ts';
import { TexturedFacesCuboMesh } from '../Mesh/textured/TexturedFacesCubeMesh.ts';
import { EsferaMesh } from '../Mesh/colored/EsferaMesh.ts';
import { CilindroMesh } from '../Mesh/colored/CilindroMesh.ts';
import { Triangulo2DMesh } from '../Mesh/colored/Triangulo2DMesh.ts';
import { Triangulo3DMesh } from '../Mesh/colored/Triangulo3DMesh.ts';
import { OBJMesh } from '../Mesh/OBJMesh.ts';
import { LightRenderizador } from '../Mesh/LightRenderizador.js';
import { float, int, Ponteiro } from '../../types/types-cpp-like.js';
import Mapa from '../../utils/dicionarios/Mapa.js';
import { VisualMesh } from '../Mesh/VisualMesh.ts';
import InformacoesPrograma from '../../interfaces/render_engine/InformacoesPrograma.ts';
import IluminacaoGeral from '../../interfaces/render_engine/IluminacaoGeral.ts';
import IluminacaoTotalParte from '../../interfaces/render_engine/IluminacaoTotalParte.ts';
import IluminacaoAcumuladaParte from '../../interfaces/render_engine/IluminacaoAcumuladaParte.ts';
import IluminacaoGeralParte from '../../interfaces/render_engine/IluminacaoGeralParte.ts';
import { getMaxListeners } from 'events';
import ContagemIndicesParteOBJ from '../../interfaces/render_engine/ContagemIndicesParteOBJ.ts';
import Material from '../../interfaces/render_engine/Material.ts';
import Position3D from '../../interfaces/main_engine/Position3D.ts';
import LightConfig from '../../interfaces/render_engine/LightConfig.ts';
import RenderConfig from '../../interfaces/render_engine/RenderConfig.ts';
import VisualMeshConfig from '../../interfaces/render_engine/VisualMeshConfig.ts';
import KeyDetection from '../../interfaces/both_engines/KeyDetection.ts';
import Position2D from '../../interfaces/main_engine/Position2D.ts';
import CameraRenderizador from '../CameraRenderizador.ts';
import ConfigCamera from '../../interfaces/both_engines/CameraConfig.ts';

/**
* NOTA DE PORTABILIDADE
* 
* o "canvas" ele só usa 3 vezes. Ele só define, e usa para criar a instancia de GL do WebGL, que ele precisa do canvas, e é por isso que eu passo ele como parametro. 
*/

export class Renderer
{
    public canvas        : React.RefObject<HTMLCanvasElement>;
    public skyTexture    : Ponteiro<WebGLTexture>;
    public skyQuadBuffer : Ponteiro<WebGLBuffer>;
    public ambient       : float;
    public diffuse       : float;
    public specular      : float;
    public brilho        : float;
    public corAmbient    : Array<float>;

    public intensidadeLuz           : float;
    public childrenIndividualLights : boolean;
    public useAccumulatedLights     : boolean;
    public staticAccumulatedLights  : boolean;

    public frameCounter   : FrameCounter;
    public lastFrameDelta : float;
    public width          : float;
    public height         : float;
    public gl             : WebGL2RenderingContext;
    public glVersion      : string;

    public matrixCamera       : Float32Array<ArrayBufferLike>;
    public matrixPontoVista   : Float32Array<ArrayBufferLike>;
    public matrixVisualizacao : Float32Array<ArrayBufferLike>;
    public sentidoCamera      : Array<float>;
    public posicaoCamera      : Array<float>;
    public miraCamera         : Array<float>;

    public objetos  : Array<VisualMesh>;
    public luzes    : Array<Ponteiro<LightRenderizador>>;

    public programs : Mapa<string, WebGLProgram>;
    
    public tipoPerspectiva  : string;
    public anguloVisaoY     : float;
    public aspectoCamera    : float;
    public pPerto           : float;
    public pLonge           : float;

    public mapaTexturasCarregadas : Mapa<string, WebGLTexture>;

    // Informações sobre o teclado e mouse
    public infoPosicaoMouse  : Position2D;
    public infoTeclasTeclado : KeyDetection;

    public cameras           : Array<Ponteiro<CameraRenderizador>>;
    public idCameraAtiva     : int;
    public refCameraAtiva    : Ponteiro<CameraRenderizador>;
    
    constructor( canvasRef:React.RefObject<HTMLCanvasElement>, tipoPerspectiva:string="perspectiva", renderConfig:RenderConfig )
    {
        this.canvas = canvasRef;

        this.cameras         = new Array();
        this.idCameraAtiva   = -1;
        this.refCameraAtiva  = null;

        // Informações sobre o teclado e mouse(vão ser atualizadas via função atualizarDadosTecladoMouse)
        this.infoPosicaoMouse = {
            x: 0,
            y: 0,
        }
        this.infoTeclasTeclado = { 
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

        // Inicializa um mapa que vai ser usado para armazenar e reaproveitar as texturas carregadas
        this.mapaTexturasCarregadas = new Mapa<string, WebGLTexture>();

        this.lastFrameDelta = 0;

        // Inicializa a textura do skybox nula
        this.skyTexture    = null;
        this.skyQuadBuffer = null;

        // Iluminação global base que todos os objetos vão seguir
        this.ambient        = renderConfig.ambient  || 0.4; // Força da luz ambiente
        this.diffuse        = renderConfig.diffuse  || 0.6;
        this.specular       = renderConfig.specular || 0.6;
        this.brilho         = renderConfig.brilho   || 16;   // Brilho geral
        this.corAmbient     = renderConfig.corAmbient || [1, 1, 1];
        this.intensidadeLuz = renderConfig.intensidadeLuz || 1;

        // Configurações globais de aplicação de iluminação
        this.childrenIndividualLights = true;   // Em OBJs: Se cada parte vai usar iluminação propia
        this.useAccumulatedLights     = true;   // Se cada objeto vai receber uma acumulação de luzes ao seu redor
        this.staticAccumulatedLights  = false;  // Se ativado, a acumulação das luzes ao redor dos objetos só vai ocorrer uma unica vez

        if( this.staticAccumulatedLights )
        {
            console.warn("Usando luzes acumuladas (se elas foram calculadas antes de inserir pontos de iluminação , nenhuma iluminação será aplicada e vai parecer que luzes não fazem efeito )");
        }

        this.frameCounter = new FrameCounter(60);

        // Calcula o tamanho da tela
        this.width  = window.innerWidth;
        this.height = window.innerHeight;

        // Inicializo o contexto GL que vai ser usado pra desenhar tudo na tela
        const glContextRetrive = criarGL( this.canvas, "auto" );
        this.gl        = glContextRetrive.gl; 
        this.glVersion = glContextRetrive.version; 

        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clearDepth(1);
        
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        // Permite transparencia
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Calcula alguns parametros para a camera
        this.tipoPerspectiva = tipoPerspectiva;
        
        this.anguloVisaoY    = 60 * Math.PI / 180;
        this.aspectoCamera   = this.width / this.height;
        this.pPerto          = 0.1;
        this.pLonge          = 100;

        // Inicializa as matrizes com valores padrão
        this.matrixCamera       = new Float32Array<ArrayBufferLike>( new Float32Array(16) );
        this.matrixPontoVista   = new Float32Array<ArrayBufferLike>( new Float32Array(16) );
        this.matrixVisualizacao = new Float32Array<ArrayBufferLike>( new Float32Array(16) );

        // Cria uma matrix que vai ser usada pra projetar o cubo no espaço 3d
        if( this.tipoPerspectiva == "perspectiva" ) 
        {
            this.anguloVisaoY    = 60 * Math.PI / 180;
            this.aspectoCamera   = this.width / this.height;
            this.pPerto          = 0.1;
            this.pLonge          = 100;
            
            this.matrixCamera = CriarMatrixPerspectiva(this.anguloVisaoY, 
                                                       this.aspectoCamera, 
                                                       this.pPerto, 
                                                       this.pLonge);

        }else if( this.tipoPerspectiva == "ortografica" ) 
        {
            this.matrixCamera = CriarMatrixOrtografica(
                                        -10, 10, // esquerda, direita
                                        -10, 10, // baixo, cima
                                        0.1, 100 // perto, longe
                                    );
        }

        /**
        * Define o ponto de vista da camera
        */
        this.posicaoCamera      = [0.5, -10.5, 10.8];
        this.sentidoCamera      = [0, 0.1, 0];
        this.miraCamera         = [-1, -5, -5];

        // Atualiza a camera pela primeira vez
        this.updateCamera( this.lastFrameDelta );

        // Armazena os programs( um para cada tipo de objeto )
        this.programs = new Mapa<string, WebGLProgram>({

            "skyboxProgram"           : createProgram(this.gl, 
                                                    skyboxPlaneShaders.vertexScript, 
                                                    skyboxPlaneShaders.fragmentScript),

            "basicProgram"            : createProgram(this.gl, 
                                                    baseShaders.vertexScript, 
                                                    baseShaders.fragmentScript),

            "onduladoProgram"         : createProgram(this.gl, 
                                                    baseShaders.vertexScript, 
                                                    baseShaders.fragmentScript),

            "textureProgram"          : createProgram(this.gl, 
                                                    baseShaders.vertexScript, 
                                                    baseShaders.fragmentScript)            
        });

        // Armazena os objetos visuais que serão desenhados
        this.objetos = [];

        // Armazena as luzes que afetam os objetos
        this.luzes   = []; 

        // AQUI USEI BIND PRA NAO DAR ERRO NA HORA DE RODAR O LOOP COM O requestAnimationFrame
        // SERIA NECESSARIO ADAPTAR NO C++
        this.render = this.render.bind(this);
    }

    /**
    * Chamado no arquivo principal, para atualizar as informações de teclado e mouse, que serão usadas por exemplo nos calculos de movimentação e rotação da camera do jogador
    */
    public receberInformacoesTecladoMouse( infoPosicaoMouse: Position2D, infoTeclasTeclado: KeyDetection ): void
    {
        // Atualiza a posição do mouse, do meu renderizador
        this.infoPosicaoMouse.x = infoPosicaoMouse.x;
        this.infoPosicaoMouse.y = infoPosicaoMouse.y;

        // Atualiza as teclas do teclado
        this.infoTeclasTeclado.W = infoTeclasTeclado.W;
        this.infoTeclasTeclado.A = infoTeclasTeclado.A;
        this.infoTeclasTeclado.S = infoTeclasTeclado.S;
        this.infoTeclasTeclado.D = infoTeclasTeclado.D;
        this.infoTeclasTeclado.ArrowUp    = infoTeclasTeclado.ArrowUp;
        this.infoTeclasTeclado.ArrowDown  = infoTeclasTeclado.ArrowDown;
        this.infoTeclasTeclado.ArrowLeft  = infoTeclasTeclado.ArrowLeft;
        this.infoTeclasTeclado.ArrowRight = infoTeclasTeclado.ArrowRight;
        this.infoTeclasTeclado.SHIFT      = infoTeclasTeclado.SHIFT;
    }

    /**
    * Carrega uma textura WebGL e armazena num mapa de texturas
    */
    public carregarTextura( textureFile:string ): WebGLTexture
    {
        const gl:WebGL2RenderingContext = this.gl;

        // Se a textura ainda não está registrada na memoria, registra ela carregando ela
        if( this.mapaTexturasCarregadas[ textureFile ] == null )
        {
            this.mapaTexturasCarregadas[ textureFile ] = carregarTextura(gl, textureFile);
        }

        return this.mapaTexturasCarregadas[ textureFile ];
    }

    /**
    * Atualiza os vertices da posição de um objeto.
    * Voce passa o objeto atual em questão, e em seguida, os vertices que quer definir nele. 
    */
    public atualizarVerticesPosicao( objetoAtual:Ponteiro<VisualMesh>, vertices:Array<float> ): void
    {
        const gl:WebGL2RenderingContext = this.gl;

        // Se o ponteiro não for null
        if( objetoAtual != null )
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, objetoAtual.bufferPosicao);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array( vertices ));
        }
    }
    
    public ficarNoite()
    {
        this.ambient  = 0.2;  
        this.diffuse  = 0.3; 
        this.specular = 0.2;  
        this.brilho   = 16;   
    }


    /*** PROGRAMS (para cada tipo de objeto) */

    /**
    * Programas basicos
    */
    public getSkyboxProgram()
    {
        return this.programs.skyboxProgram;
    }

    public getCubeProgram()
    {
        return this.programs.basicProgram;
    }

    public getEsferaProgram()
    {
        return this.programs.basicProgram;
    }

    public getTrianguloProgram()
    {
        return this.programs.basicProgram;
    }

    public getCilindroProgram()
    {
        return this.programs.basicProgram;
    }

    public getOnduladoProgram()
    {
        return this.programs.onduladoProgram;
    }

    /**
    * Programas com textura
    */
    public getOBJProgram()
    {
        return this.programs.textureProgram;
    }

    public getCubeTextureUVProgram()
    {
        return this.programs.textureProgram;
    }

    // Força atualizar a iluminação geral de todos os objetos
    public atualizarIluminacaoGeralObjetos(): void
    {
        const gl : WebGL2RenderingContext = this.gl;

        for( let i:int = 0 ; i < this.objetos.length ; i++ )
        {
            const objetoAtual               : VisualMesh           = this.objetos[i];
            const informacoesProgramaObjeto : InformacoesPrograma  = this.getInformacoesProgramaObjeto( gl, objetoAtual );

            this.aplicarIluminacaoGeralObjeto( gl, 
                                               informacoesProgramaObjeto, 
                                               objetoAtual, 
                                               objetoAtual.iluminacaoGeral 
                                             );
        }
    }

    /**
    * Carrega a textura do fundo a cena(o skybox 2D)
    */
    public carregarImagemSkybox(imagemURL:string) : void
    {
        const gl            : WebGL2RenderingContext   = this.gl;
        const programSkybox : WebGLProgram             = this.getSkyboxProgram();

        // Criar buffer com quad (-1,-1 a 1,1)
        this.skyQuadBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.skyQuadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1,  1,
            1,  1
        ]), gl.STATIC_DRAW);

        // Criar textura
        const skyTexture : WebGLTexture      = gl.createTexture();
        const imagem     : HTMLImageElement  = new Image();

        imagem.src = imagemURL;
        imagem.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, skyTexture);

            // Inverte verticalmente a imagem ao carregar
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagem);
            gl.generateMipmap(gl.TEXTURE_2D);
        };

        // Salva o skybox no renderizador objeto
        this.skyTexture = skyTexture;
    }

    /**
    * Desenha o skybox da cena 
    */
    public desenharSkyboxFundo() : void
    {
        const gl                     : WebGL2RenderingContext          = this.gl;
        const programSkybox          : WebGLProgram                    = this.getSkyboxProgram();
        const attribPosicaoSkybox    : GLint                           = gl.getAttribLocation(programSkybox,  "aPosicao");
        const locationTexturaSkybox  : Ponteiro<WebGLUniformLocation>  = gl.getUniformLocation(programSkybox, "uTextura");

        if (this.getSkyboxProgram() != null && this.skyTexture != null)
        {
            gl.useProgram(programSkybox);

            gl.disable(gl.DEPTH_TEST); // para não bloquear nada do fundo
            gl.bindBuffer(gl.ARRAY_BUFFER, this.skyQuadBuffer);
            gl.enableVertexAttribArray(attribPosicaoSkybox);
            gl.vertexAttribPointer(attribPosicaoSkybox, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.skyTexture);
            gl.uniform1i(locationTexturaSkybox, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.enable(gl.DEPTH_TEST); // reativa o depth test para objetos 3D
        }

    }


    // chamada sempre que vão haver mudanças de camera, como no loop de renderização dos objetos, etc.
    // OBS: a matrixVisualizacao ja inclui o ponto de vista da camera, já está embutido
    public updateCamera( frameDelta:float ) : void
    {
        this.matrixPontoVista   = CriarMatrixPontoVista( frameDelta, "FPS", this.posicaoCamera, this.miraCamera, this.sentidoCamera );
        this.matrixVisualizacao = MultiplicarMatrix4x4( new Float32Array(16), this.matrixCamera, this.matrixPontoVista );
    }

    /*** OBTEM VISUALIZACAO ATUALIZADA */
    public getMatrixVisualizacao() : Float32Array<ArrayBufferLike>
    {
        return this.matrixVisualizacao;
    }

    public getObjetos() : Array<VisualMesh>
    {
        return this.objetos;
    }

    public getLuzes()   : Array<Ponteiro<LightRenderizador>>
    {
        return this.luzes;
    }

    /**
    * Cria um novo objeto na cena( adicionando ele na lista de renderização )
    */
    public criarObjeto( propriedadesObjeto:VisualMeshConfig ): Ponteiro<VisualMesh>
    {
        const contextoRenderizador = this;

        if( propriedadesObjeto.tipo == "OBJ" )
        {
            this.objetos.push( new OBJMesh( contextoRenderizador, 
                                            propriedadesObjeto ) 
                                );
        }

        if( propriedadesObjeto.tipo == "Cubo" )
        {
            this.objetos.push( new CuboMesh( contextoRenderizador, 
                                                propriedadesObjeto ) 
                                );
        }

        if( propriedadesObjeto.tipo == "CuboDeformavel" )
        {
            this.objetos.push( new CuboDeformavelMesh( contextoRenderizador, 
                                                        propriedadesObjeto ) 
                                );
        }

        if( propriedadesObjeto.tipo == "Cilindro" )
        {
            this.objetos.push( new CilindroMesh( contextoRenderizador, 
                                                    propriedadesObjeto ) 
                                );
        }

        if( propriedadesObjeto.tipo == "PlanoOndulado" )
        {
            this.objetos.push( new PlanoOnduladoMesh( contextoRenderizador, 
                                                        propriedadesObjeto ) 
                                );
        }

        if( propriedadesObjeto.tipo == "TexturedUVCubo" )
        {
            this.objetos.push( new TexturedUVCuboMesh( contextoRenderizador, 
                                                        propriedadesObjeto ) 
                                );
        }

        if( propriedadesObjeto.tipo == "TexturedFacesCubo" )
        {
            this.objetos.push( new TexturedFacesCuboMesh( contextoRenderizador, 
                                                            propriedadesObjeto ) 
                                );
            
        }

        if( propriedadesObjeto.tipo == "Esfera" )
        {
            this.objetos.push( new EsferaMesh( contextoRenderizador, 
                                                propriedadesObjeto ) 
                                );
        }

        if( propriedadesObjeto.tipo == "Triangulo2D" )
        {
            this.objetos.push( new Triangulo2DMesh( contextoRenderizador, 
                                                    propriedadesObjeto ) 
                                );
        }

        if( propriedadesObjeto.tipo == "Triangulo3D" )
        {
            this.objetos.push( new Triangulo3DMesh( contextoRenderizador, 
                                                    propriedadesObjeto ) 
                                );
        }

        // Retorna o ultimo objeto criado
        return this.objetos[ this.objetos.length-1 ];
    }   

    /**
    * Cria uma nova luz na cena( adicionando ele na lista de renderização )
    */
    public criarLuz( propriedadesLuz:LightConfig ): Ponteiro<LightRenderizador>
    {
        this.luzes.push( new LightRenderizador( propriedadesLuz ) );

        // Retorna a ultima luz criada
        return this.luzes[ this.luzes.length-1 ];
    }

    /**
    * Cria uma nova camera no meu renderizador 
    */
    public criarCamera( propriedadesCamera:ConfigCamera ) : Ponteiro<CameraRenderizador>
    {
        this.cameras.push( new CameraRenderizador( propriedadesCamera ) );

        // Retorna a ultima camera criada
        return this.cameras[ this.cameras.length-1 ];
    }

    /**
    * Retorna qual o program deve ser usado para desenhar um objeto, de acordo com o tipo dele 
    */
    public getProgramObjetoDesenhar( tipoObjeto:string ) : Ponteiro<WebGLProgram>
    {
        if( tipoObjeto == "Cubo" )
        {
            return this.getCubeProgram();

        }else if( tipoObjeto == "Cilindro" )
        {
            return this.getCilindroProgram();

        }else if( tipoObjeto == "Esfera" )
        {
            return this.getEsferaProgram();

        }else if( tipoObjeto == "PlanoOndulado" )
        {
            return this.getOnduladoProgram();
            
        }else if( tipoObjeto == "Triangulo2D" || tipoObjeto == "Triangulo3D" )
        {
            return this.getTrianguloProgram();

        }else if( tipoObjeto == "CuboFacesTexturizadas" )
        {
            return this.getCubeTextureUVProgram();

        }else if( tipoObjeto == "CuboTexturizadoUV" )
        {
            return this.getCubeTextureUVProgram();
            
        }else if( tipoObjeto == "OBJ" )
        {
            return this.getOBJProgram();
        }

        return null;
    }

    /**
    * Obtem as informações do programa de um objeto, que vão ser usadas na renderização desse tal objeto
    */
    public getInformacoesProgramaObjeto( gl:WebGL2RenderingContext, objetoAtual:Ponteiro<VisualMesh> ) : InformacoesPrograma
    {
        // Se o ponteiro não for null
        if( objetoAtual != null )
        {
            const programUsado : Ponteiro<WebGLProgram>  = this.getProgramObjetoDesenhar( objetoAtual.tipo );

            // Se o ponteiro do programa não for null
            if( programUsado != null )
            {
                // Determina se o objeto usa UV ou não
                let attribLocationUV : GLint = 0;

                if( objetoAtual.usaUV == true )
                {   
                    attribLocationUV = gl.getAttribLocation(programUsado, baseShaders.vertexExtraInfo.variavelUV);
                }

                return {
                    atributosObjeto: {
                        posicao    : gl.getAttribLocation(programUsado, baseShaders.vertexExtraInfo.variavelPosicaoCubo),
                        cor        : gl.getAttribLocation(programUsado, baseShaders.vertexExtraInfo.variavelCorCubo),
                        uv         : attribLocationUV,

                        // Iluminação
                        brilho     : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelBrilho),
                        ambient    : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelAmbient),
                        diffuse    : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelDiffuse),
                        specular   : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelSpecular),
                        corLuz     : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelCorLuz),
                        intensidadeLuz : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelIntensidadeLuz)

                    },
                    atributosVisualizacaoObjeto: {
                        matrixVisualizacao: gl.getUniformLocation(programUsado, baseShaders.vertexExtraInfo.variavelMatrixVisualizacao),
                        modeloObjetoVisual: gl.getUniformLocation(programUsado, baseShaders.vertexExtraInfo.variavelModeloObjeto)
                    },
                    uniformsCustomizados: {
                        usarTextura: gl.getUniformLocation(programUsado, "uUsarTextura"),
                        opacidade  : gl.getUniformLocation(programUsado, "uOpacidade"),
                        textura    : gl.getUniformLocation(programUsado, "uTextura")
                    }
                };
            }
        }

        //Caso não exista retorna algo generico
        // APENAS UM TEMPLATE PRA INDICAR QUE TIPO DE RETORNO O getInformacoesPrograma de um objeto retorna
        return {
            atributosObjeto: {
                posicao: 0,
                cor: 0,
                uv : 0,
                brilho: new WebGLUniformLocation(),
                ambient: new WebGLUniformLocation(),
                diffuse: new WebGLUniformLocation(),
                specular: new WebGLUniformLocation(),
                corLuz: new WebGLUniformLocation(),
                intensidadeLuz: new WebGLUniformLocation()
            },
            atributosVisualizacaoObjeto: {
                matrixVisualizacao: new WebGLUniformLocation(),
                modeloObjetoVisual: new WebGLUniformLocation()
            },
            uniformsCustomizados: {
                usarTextura  : new WebGLUniformLocation(),
                opacidade    : new WebGLUniformLocation(),
                textura      : new WebGLUniformLocation()
            }
        };
    }

    /**
    * Código base para aplicar iluminação geral em um objeto, usado em todos os objetos
    * A iluminação geral é uma iluminação aplicada a todas as partes de um objeto
    * 
    * Pra isso implementar em C++ eu teria 3 opções:
    *    (1) Declarar ele só no final(pois ele depende da Cena com todos os métodos dela)
    *    
    *    (2) Ou então, ele tambem poderia ser virtual, e eu implemento em cada objeto(vai ter que duplicar código)
    * 
    *    (3) Ou então, eu poderia criar uma outra classe VisualMesh que vai herdar o ObjectBase, no final das definições raizes, e ai como todos os objetos herdam o VisualMesh, iria seguir o fluxo normal(visto que nesse ponto Cena, ObjectBase e outras classes raiz vão estar totalmente definidas)
    *        Mais pode ser um pouco mais complicado por causa de conversões de objetos que podem ser necessarias ser feitas
    */
    public atualizarIluminacaoGeralObjeto( objetoAtual:Ponteiro<VisualMesh>, iluminacaoGeral:IluminacaoGeral ) : void
    {
        const luzesCena : Array<Ponteiro<LightRenderizador>>   = this.getLuzes();

        // Se o ponteiro não for nulo
        if( objetoAtual != null )
        {
            /**
            * Calcula o recebimento de todas as luzes que afeta esse objeto 
            */
            objetoAtual.brilhoLocalAcumulado          = 0;
            objetoAtual.ambientLocalAcumulado         = 0;
            objetoAtual.diffuseLocalAcumulado         = 0;
            objetoAtual.specularLocalAcumulado        = 0;
            objetoAtual.corLocalAcumulado             = [0,0,0];
            objetoAtual.intensidadeLocalAcumulado     = 0;

            // Se esse recurso está ativado
            if( objetoAtual.useAccumulatedLights == true )
            {
                /** NOVA REGRA: 
                *      Se ele usa acumulação estatica(que acumula apenas uma unica vez), então essa condição não vai permitir que o loop continue
                *      EXCETO, se staticAccumulatedLights for false, que ai ele passa direto e não interrompe nada por que o recurso está desativado
                */
                if( 
                    (objetoAtual.staticAccumulatedLights == false) ||                                 // Se não usa o recurso passa direto
                    (objetoAtual.staticAccumulatedLights == true && objetoAtual._jaAcumulouLuzes == false)   // se usa, e ja acumulou, então não faz mais

                ){
                    /**
                    * Calcula o recebimento de todas as luzes que afeta esse objeto 
                    */
                    objetoAtual.brilhoLocalAcumulado          = 0;
                    objetoAtual.ambientLocalAcumulado         = 0;
                    objetoAtual.diffuseLocalAcumulado         = 0;
                    objetoAtual.specularLocalAcumulado        = 0;
                    objetoAtual.corLocalAcumulado             = [0,0,0];
                    objetoAtual.intensidadeLocalAcumulado     = 0;

                    for( let i:int = 0 ; i < luzesCena.length ; i++ )
                    {
                        const luz                = luzesCena[i];

                        // Se o ponteiro não for nulo
                        if( luz != null )
                        {
                            const posicaoObjetoArray : Array<float>  = [ 
                                                                         objetoAtual.position.x, 
                                                                         objetoAtual.position.y, 
                                                                         objetoAtual.position.z
                                                                       ];

                            const interferenciaLuz   : Array<float>  = luz.calcularInterferencia( posicaoObjetoArray );

                            /**
                            * Calcula o como essa luz, dada sua força, influencia a iluminação do objeto atual(do primeiro laço FOR)
                            */
                            const forcaLuz              : float   = interferenciaLuz[0];
                            const influenciaBrilho      : float   = interferenciaLuz[1];
                            const influenciaAmbient     : float   = interferenciaLuz[2];
                            const influenciaDiffuse     : float   = interferenciaLuz[3];
                            const influenciaSpecular    : float   = interferenciaLuz[4];
                            const influenciaIntensidade : float   = interferenciaLuz[5];

                            // Cores
                            const influenciaVermelho : float     = interferenciaLuz[6];
                            const influenciaVerde    : float     = interferenciaLuz[7];
                            const influenciaAzul     : float     = interferenciaLuz[8];

                            // Quanto mais perto estiver da luz, mais a luz vai afetar o objeto
                            objetoAtual.brilhoLocalAcumulado         += influenciaBrilho;
                            objetoAtual.ambientLocalAcumulado        += influenciaAmbient;
                            objetoAtual.diffuseLocalAcumulado        += influenciaDiffuse;
                            objetoAtual.specularLocalAcumulado       += influenciaSpecular;
                            objetoAtual.intensidadeLocalAcumulado    += influenciaIntensidade;

                            // As luzes mais proximas terão tambem mais influencia na cor
                            objetoAtual.corLocalAcumulado[0]         += influenciaVermelho;
                            objetoAtual.corLocalAcumulado[1]         += influenciaVerde;
                            objetoAtual.corLocalAcumulado[2]         += influenciaAzul;
                        }
                    }
                }
            }

            /**
            * Obtem o ambiente atualizado como a soma dos valores do objeto com os globais da cena
            */
            iluminacaoGeral.ambient         = objetoAtual.ambientObjeto        + this.ambient         + objetoAtual.ambientLocalAcumulado;
            iluminacaoGeral.diffuse         = objetoAtual.diffuseObjeto        + this.diffuse         + objetoAtual.diffuseLocalAcumulado;
            iluminacaoGeral.specular        = objetoAtual.specularObjeto       + this.specular        + objetoAtual.specularLocalAcumulado;
            iluminacaoGeral.brilho          = objetoAtual.brilhoObjeto         + this.brilho          + objetoAtual.brilhoLocalAcumulado;
            iluminacaoGeral.intensidadeLuz  = objetoAtual.intensidadeLuzObjeto + this.intensidadeLuz  + objetoAtual.intensidadeLocalAcumulado;

            // Pega a cor da luz
            iluminacaoGeral.corLuz = [0, 0, 0];
            iluminacaoGeral.corLuz[0] = objetoAtual.corLuzObjeto[0] + this.corAmbient[0] + objetoAtual.corLocalAcumulado[0];
            iluminacaoGeral.corLuz[1] = objetoAtual.corLuzObjeto[1] + this.corAmbient[1] + objetoAtual.corLocalAcumulado[1];
            iluminacaoGeral.corLuz[2] = objetoAtual.corLuzObjeto[2] + this.corAmbient[2] + objetoAtual.corLocalAcumulado[2];
        }
    }

    /**
    * Envia a iluminação geral do objeto já calculada para o shader 
    * A iluminação geral é uma iluminação aplicada a todas as partes de um objeto
    */
    public enviarIluminacaoGeralObjetoShader(gl:WebGL2RenderingContext, informacoesPrograma:InformacoesPrograma, iluminacaoGeral:IluminacaoGeral): void
    {
        /**
        * Aplica os valores 
        */
        const brilhoShader          : Ponteiro<WebGLUniformLocation>    = informacoesPrograma.atributosObjeto.brilho;
        const ambientShader         : Ponteiro<WebGLUniformLocation>    = informacoesPrograma.atributosObjeto.ambient;
        const diffuseShader         : Ponteiro<WebGLUniformLocation>    = informacoesPrograma.atributosObjeto.diffuse;
        const specularShader        : Ponteiro<WebGLUniformLocation>    = informacoesPrograma.atributosObjeto.specular;
        const corLuzShader          : Ponteiro<WebGLUniformLocation>    = informacoesPrograma.atributosObjeto.corLuz;
        const intensidadeLuzShader  : Ponteiro<WebGLUniformLocation>    = informacoesPrograma.atributosObjeto.intensidadeLuz;

        // Atualiza as configurações gerais 
        gl.uniform1f(brilhoShader,   iluminacaoGeral.brilho);
        gl.uniform1f(ambientShader,  iluminacaoGeral.ambient);
        gl.uniform1f(diffuseShader,  iluminacaoGeral.diffuse);
        gl.uniform1f(specularShader, iluminacaoGeral.specular);

        // Cores RGB
        gl.uniform3fv(corLuzShader,  new Float32Array([
                                                        iluminacaoGeral.corLuz[0], // Vermelho
                                                        iluminacaoGeral.corLuz[1], // Verde
                                                        iluminacaoGeral.corLuz[2]  // Azul
                                                      ]) );

        gl.uniform1f(intensidadeLuzShader, iluminacaoGeral.intensidadeLuz);
    }

    /**
    * Aplica a iluminação geral em um objeto 
    */
    public aplicarIluminacaoGeralObjeto(gl:WebGL2RenderingContext, informacoesPrograma:InformacoesPrograma, objetoAtual:Ponteiro<VisualMesh>, iluminacaoGeral:IluminacaoGeral): void
    {
        // Se o ponteiro não for null
        if( objetoAtual != null )
        {
            // Se o objeto sempre for atualizar luzes
            if( objetoAtual.alwaysUpdateLights == true )
            {
                // Calcula a iluminação e salva na iluminacaoGeral do objeto
                this.atualizarIluminacaoGeralObjeto( 
                                                     objetoAtual, 
                                                     iluminacaoGeral    // o mesmo que objetoAtual.iluminacaoGeral 
                                                   );

                // Envia essa iluminaçao geral calculada para o shader
                this.enviarIluminacaoGeralObjetoShader( 
                                                        gl, 
                                                        informacoesPrograma, 
                                                        iluminacaoGeral        // o mesmo que objetoAtual.iluminacaoGeral
                                                        );

                // Marca que as luzes de todas as partes ja foram atualizadas pela primeira vez
                objetoAtual._jaAcumulouLuzes = true;
            }
        }
    }

    /**
    * Sempre o mesmo em cada objeto
    * Cria os buffers que vão ser usados na renderização
    * SÒ CRIA UMA VEZ, ENTAO SE ELES JA FORAM CRIADOS, USA ELES MESMO SEM PRECISAR CRIAR NOVAMENTE
    * lembrando que cada buffer é um ponteiro, então ele pode ser nulo
    */
    public createBuffersObjetoDesenhar( gl:WebGL2RenderingContext, objetoAtual:Ponteiro<VisualMesh> ): void
    {
        // Se o ponteiro não for nulo
        if( objetoAtual != null )
        {
            if ( objetoAtual.bufferPosicao == null ) 
            {
                objetoAtual.bufferPosicao = createBuffer(gl, objetoAtual.getPositions(), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
            }

            if ( objetoAtual.bufferCor == null )
            {
                objetoAtual.bufferCor     = createBuffer(gl, objetoAtual.getColors(),    gl.ARRAY_BUFFER, gl.STATIC_DRAW);
            }
            
            if ( objetoAtual.bufferIndices == null )
            { 
                objetoAtual.bufferIndices = createBuffer(gl, objetoAtual.getIndices(),   gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
            }

            if( objetoAtual.bufferUV == null )
            {
                objetoAtual.bufferUV = createBuffer(gl, objetoAtual.getUVs(), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
            }
        }
    }

    /**
    * Envia a iluminação já calculada para o shader 
    * Para isso, precisa do arrayIluminacaoParte, que é na verdade o array retornado pela função acima
    * O pipeline do meu mini renderizador no arquivo Renderer/Renderer.ts na linha 803 deixará isso bem claro.
    */
    public enviarIluminacaoParteShader(gl:WebGL2RenderingContext, informacoesPrograma:InformacoesPrograma, mapaIluminacaoTotalParte:IluminacaoTotalParte ): void
    {
        /**
        * Aplica os valores 
        */
        const ambientShader         : Ponteiro<WebGLUniformLocation>   = informacoesPrograma.atributosObjeto.ambient;
        const diffuseShader         : Ponteiro<WebGLUniformLocation>   = informacoesPrograma.atributosObjeto.diffuse;
        const specularShader        : Ponteiro<WebGLUniformLocation>   = informacoesPrograma.atributosObjeto.specular;
        const brilhoShader          : Ponteiro<WebGLUniformLocation>   = informacoesPrograma.atributosObjeto.brilho;
        const intensidadeLuzShader  : Ponteiro<WebGLUniformLocation>   = informacoesPrograma.atributosObjeto.intensidadeLuz;
        const corLuzShader          : Ponteiro<WebGLUniformLocation>   = informacoesPrograma.atributosObjeto.corLuz;

        // Atualiza as configurações gerais 
        gl.uniform1f(ambientShader,        mapaIluminacaoTotalParte.ambientTotal ); // o ambient
        gl.uniform1f(diffuseShader,        mapaIluminacaoTotalParte.diffuseTotal ); // o diffuse
        gl.uniform1f(specularShader,       mapaIluminacaoTotalParte.specularTotal ); // o specular
        gl.uniform1f(brilhoShader,         mapaIluminacaoTotalParte.brilhoTotal ); // O brilho
        gl.uniform1f(intensidadeLuzShader, mapaIluminacaoTotalParte.intensidadeTotal ); // a intensidade da luz

        // Cores RGB
        gl.uniform3fv(corLuzShader,        new Float32Array([ 
                                                               mapaIluminacaoTotalParte.corLuzTotal[0],  // Vermelho
                                                               mapaIluminacaoTotalParte.corLuzTotal[1],  // Verde
                                                               mapaIluminacaoTotalParte.corLuzTotal[2]   // Azul
                                                            ]) );

    }
    

    /**
    * Desenha um objeto(seja ele qual for)
    * Uma função genérica, e que pode ser chamada aqui dentro, para qualquer objeto.
    * Vou usar ela no método desenharObjetos abaixo
    */
    public desenharUmObjeto( frameDelta:float, 
                             objetoAtual:Ponteiro<VisualMesh>
    ): void
    {
        const gl                             : WebGL2RenderingContext              = this.gl;
        const luzesCena                      : Array<Ponteiro<LightRenderizador>>  = this.luzes;   
        const matrixVisualizacaoRenderizador : Float32Array<ArrayBufferLike>       = this.getMatrixVisualizacao();

        // Se o ponteiro não for nulo
        if( objetoAtual != null )
        {
            /**
            * Identificação do objeto e alguns de seus parametros 
            */
            const tipoObjeto                : string             = objetoAtual.tipo;
            const isTransparente            : boolean            = objetoAtual.isTransparente();
            const transparenciaObjeto       : float              = objetoAtual.transparencia;

            /**
            * Dados de desenho 
            */
            const programUsado              : Ponteiro<WebGLProgram>  = this.getProgramObjetoDesenhar( tipoObjeto );
            const informacoesProgramaObjeto : InformacoesPrograma     = this.getInformacoesProgramaObjeto( gl, objetoAtual );
            const locationPosicaoObjeto     : GLint                   = informacoesProgramaObjeto.atributosObjeto.posicao;
            const locationCorObjeto         : GLint                   = informacoesProgramaObjeto.atributosObjeto.cor;

            // Se os ponteiros não forem nulos
            if( objetoAtual.modeloObjetoVisual != null && programUsado != null )
            {
                // Se usa colling face ou não
                if( objetoAtual.usaCollingFace == false )
                {
                    gl.disable(gl.CULL_FACE);
                }else{
                    gl.enable(gl.CULL_FACE);
                }
            
                // Se for a primeira vez do objeto, cria os buffers que ele vai precisar na memoria
                if( objetoAtual.allBuffersCriated == false )
                {
                    // Cria os buffers do objeto que serão usados - se eles não existirem.
                    this.createBuffersObjetoDesenhar( gl, objetoAtual );

                    // Diz que ja criou todos os buffers para não chamar novamente
                    objetoAtual.allBuffersCriated = true;
                }

                // Usa o programa do objeto atual em questão
                gl.useProgram( programUsado );

                /**
                * Atualiza os buffers do objeto 3d com os dados calculados
                */

                // Se tem buffer posição
                if( objetoAtual.bufferPosicao != null )
                {
                    gl.bindBuffer( gl.ARRAY_BUFFER, objetoAtual.bufferPosicao );
                    gl.vertexAttribPointer(locationPosicaoObjeto, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(locationPosicaoObjeto);
                }
                
                // Se tem buffer cor
                if( objetoAtual.bufferCor != null )
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, objetoAtual.bufferCor );
                    gl.vertexAttribPointer(locationCorObjeto, 4, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(locationCorObjeto);
                }
                
                // Se tem buffer indices
                if( objetoAtual.bufferIndices != null )
                {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, objetoAtual.bufferIndices );  
                }

                // SE TEM texturaUV
                if( objetoAtual.usaTexturas == true )
                {
                    if( objetoAtual.texturaUV != null )
                    {
                        // Aplica a textura UV(uma imagem para todas as faces do cubo)
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, objetoAtual.texturaUV ); // o texturaUV precisa estar carregado!
                    
                        gl.uniform1i(informacoesProgramaObjeto.uniformsCustomizados.usarTextura, 0 ); //0 por que é false
                    }

                    // SE TEM bufferUV
                    if( objetoAtual.bufferUV != null )
                    {
                        // Ativa o atributo UV
                        gl.bindBuffer(gl.ARRAY_BUFFER, objetoAtual.bufferUV);
                        gl.vertexAttribPointer(informacoesProgramaObjeto.atributosObjeto.uv, 2, gl.FLOAT, false, 0, 0);
                        gl.enableVertexAttribArray(informacoesProgramaObjeto.atributosObjeto.uv);
                    }

                // Se não usa textura(ou seja, se for um material sem textura)
                // porém isso não vai servir para outros tipos de objetos que tenham textura e não sejam OBJ
                }else{
                    // Diz que não usa textura
                    gl.uniform1i(informacoesProgramaObjeto.uniformsCustomizados.usarTextura, 0); // 0 pois é false

                    if( isTransparente == true )
                    {
                        // Opacidade
                        gl.uniform1f(informacoesProgramaObjeto.uniformsCustomizados.opacidade, transparenciaObjeto );
                    }
                }

                // Usa as informações do cubo(que criamos e calculamos acima)
                gl.uniformMatrix4fv(informacoesProgramaObjeto.atributosVisualizacaoObjeto.matrixVisualizacao, false, matrixVisualizacaoRenderizador);
                gl.uniformMatrix4fv(informacoesProgramaObjeto.atributosVisualizacaoObjeto.modeloObjetoVisual, false, objetoAtual.modeloObjetoVisual);

                // Se não for um objeto
                if( objetoAtual.tipo != "OBJ")
                {
                    // Se tiver transparencia, aplica
                    if( isTransparente == true )
                    {
                        // Opacidade
                        gl.uniform1f(informacoesProgramaObjeto.uniformsCustomizados.opacidade, transparenciaObjeto );
                    }
                }

                // Atualiza a iluminação geral do objeto
                this.aplicarIluminacaoGeralObjeto(
                                                    gl,
                                                    informacoesProgramaObjeto,
                                                    objetoAtual,
                                                    objetoAtual.iluminacaoGeral
                                                 );

                /**
                * Desenha conforme o tipo do objeto em questão
                */
                if( objetoAtual.tipo == "CuboFacesTexturizadas" )
                {
                    /**
                    * Desenha cada face com sua respectiva textura
                    */
                    for( let i:int = 0; i < 6; i++ )
                    {
                        // Vincula a textura da face i
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, objetoAtual.texturasFaces[i]);

                        // Inverte verticalmente a imagem ao carregar
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                        
                        gl.uniform1i(informacoesProgramaObjeto.uniformsCustomizados.textura, 0);

                        // Desenha só os índices daquela face (passa o offset correto)
                        // O offset do drawElements é em bytes. Cada índice é um UNSIGNED_SHORT (2 bytes).
                        const indiceInicioFace = 6 * i * 2; // 6 indices por face * i * 2 bytes por indice
                        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, indiceInicioFace);
                    }

                }else if( objetoAtual.tipo == "OBJ"){
                    /**
                    * Desenha cada objeto dentro deste OBJ 
                    */
                    for ( let i:int = 0 ; i < objetoAtual.nomesObjetos.length ; i++ ) 
                    {
                        const nomeParte   : string                   = objetoAtual.nomesObjetos[i];
                        const info        : ContagemIndicesParteOBJ  = objetoAtual.objetosInfo[ nomeParte ];
                        const material    : Material                 = objetoAtual.materiais[ objetoAtual.objetos[ nomeParte ][0].nomeMaterial ];
                        const usarTextura : boolean                  = material != null && material.map_Kd != null;
                        const opacidade   : float                    = material.opacity || 1.0;

                        /**
                        * Se esse objeto usa iluminação por cada sub-objeto
                        * Ou seja, Calcula o recebimento de todas as luzes que afeta todas as partes desse objeto 
                        * Nesse caso, eu programei um código por parte. Ou seja, cada parte vai executar esse código abaixo:
                        */
                        if( objetoAtual.childrenIndividualLights == true && objetoAtual.alwaysUpdateLights == true )
                        {
                            const iluminacaoParte           : IluminacaoGeralParte      = objetoAtual.iluminationInfo[ nomeParte ];
                            const iluminacaoAcumuladaParte  : IluminacaoAcumuladaParte  = objetoAtual.iluminationAcumuladaInfo[ nomeParte ];
                            const iluminacaoTotalParte      : IluminacaoTotalParte      = objetoAtual.iluminationTotal[ nomeParte ];

                            /**
                            * Calcula a iluminação dessa parte atual ( se esse OBJ usa acumulação de luzes )
                            */
                            if( objetoAtual.useAccumulatedLights == true )
                            {

                                /** NOVA REGRA: 
                                *      Se ele usa acumulação estatica(que acumula apenas uma unica vez), então essa condição não vai permitir que o loop continue
                                *      EXCETO, se staticAccumulatedLights for false, que ai ele passa direto e não interrompe nada por que o recurso está desativado
                                */
                                if( 
                                    (objetoAtual.staticAccumulatedLights == false) ||                                 // Se não usa o recurso passa direto
                                    (objetoAtual.staticAccumulatedLights == true && objetoAtual._jaAcumulouLuzes == false)   // se usa, e ja acumulou, então não faz mais

                                ){
                                    const posicaoCentroParte : Array<float>  = objetoAtual.calcularCentroideGlobalParte( nomeParte );

                                    iluminacaoAcumuladaParte.brilhoLocalAcumulado          = 0;
                                    iluminacaoAcumuladaParte.ambientLocalAcumulado         = 0;
                                    iluminacaoAcumuladaParte.diffuseLocalAcumulado         = 0;
                                    iluminacaoAcumuladaParte.specularLocalAcumulado        = 0;
                                    iluminacaoAcumuladaParte.corLocalAcumulado             = [0,0,0];
                                    iluminacaoAcumuladaParte.intensidadeLocalAcumulado     = 0;

                                    /**
                                    * Calcula o recebimento de todas as luzes que afeta essa parte 
                                    */
                                    for( let j:int = 0 ; j < luzesCena.length ; j++ )
                                    {
                                        // Calcula a força da luz em relação a posição do objeto atual(do primeiro laço FOR)
                                        const luz : Ponteiro<LightRenderizador>   = luzesCena[j];

                                        // Se o ponteiro não é nulo
                                        if( luz != null )
                                        {
                                            const interferenciaLuz  : Array<float>  = luz.calcularInterferencia( posicaoCentroParte );

                                            const forcaLuz              : float     = interferenciaLuz[0];
                                            const influenciaBrilho      : float     = interferenciaLuz[1];
                                            const influenciaAmbient     : float     = interferenciaLuz[2];
                                            const influenciaDiffuse     : float     = interferenciaLuz[3];
                                            const influenciaSpecular    : float     = interferenciaLuz[4];
                                            const influenciaIntensidade : float     = interferenciaLuz[5];

                                            // Cores
                                            const influenciaVermelho    : float     = interferenciaLuz[6];
                                            const influenciaVerde       : float     = interferenciaLuz[7];
                                            const influenciaAzul        : float     = interferenciaLuz[8];
                                            
                                            // Quanto mais perto estiver da luz, mais a luz vai afetar o objeto
                                            iluminacaoAcumuladaParte.brilhoLocalAcumulado         += influenciaBrilho;
                                            iluminacaoAcumuladaParte.ambientLocalAcumulado        += influenciaAmbient;
                                            iluminacaoAcumuladaParte.diffuseLocalAcumulado        += influenciaDiffuse;
                                            iluminacaoAcumuladaParte.specularLocalAcumulado       += influenciaSpecular;
                                            iluminacaoAcumuladaParte.intensidadeLocalAcumulado    += influenciaIntensidade;

                                            // As luzes mais proximas terão tambem mais influencia na cor
                                            iluminacaoAcumuladaParte.corLocalAcumulado[0]         += influenciaVermelho;
                                            iluminacaoAcumuladaParte.corLocalAcumulado[1]         += influenciaVerde;
                                            iluminacaoAcumuladaParte.corLocalAcumulado[2]         += influenciaAzul;
                                        }
                                    }

                                    /**
                                    * Obtem o ambiente da parte atual atualizado como a soma dos valores do objeto com os globais da cena
                                    */
                                    const ambientTotalParte      : float   = iluminacaoParte.ambientObjeto         + this.ambient                + iluminacaoAcumuladaParte.ambientLocalAcumulado;
                                    const diffuseTotalParte      : float   = iluminacaoParte.diffuseObjeto         + this.diffuse                + iluminacaoAcumuladaParte.diffuseLocalAcumulado;
                                    const specularTotalParte     : float   = iluminacaoParte.specularObjeto        + this.specular               + iluminacaoAcumuladaParte.specularLocalAcumulado;
                                    const brilhoTotalParte       : float   = iluminacaoParte.brilhoObjeto          + this.brilho                 + iluminacaoAcumuladaParte.brilhoLocalAcumulado;
                                    const intensidadeTotalParte  : float   = iluminacaoParte.intensidadeLuzObjeto  + this.intensidadeLuz         + iluminacaoAcumuladaParte.intensidadeLocalAcumulado;

                                    const corLuzTotalParte : Array<float>  = [0, 0, 0];
                                    corLuzTotalParte[0] = iluminacaoParte.corLuzObjeto[0] + this.corAmbient[0] + iluminacaoAcumuladaParte.corLocalAcumulado[0];
                                    corLuzTotalParte[1] = iluminacaoParte.corLuzObjeto[1] + this.corAmbient[1] + iluminacaoAcumuladaParte.corLocalAcumulado[1];
                                    corLuzTotalParte[2] = iluminacaoParte.corLuzObjeto[2] + this.corAmbient[2] + iluminacaoAcumuladaParte.corLocalAcumulado[2];

                                    // Salva no mapa que contém a iluminação total da parte(ja levendo em conta essas somas acima)
                                    iluminacaoTotalParte.ambientTotal         = ambientTotalParte;
                                    iluminacaoTotalParte.diffuseTotal         = diffuseTotalParte;
                                    iluminacaoTotalParte.specularTotal        = specularTotalParte;
                                    iluminacaoTotalParte.brilhoTotal          = brilhoTotalParte;
                                    iluminacaoTotalParte.intensidadeTotal     = intensidadeTotalParte;
                                    iluminacaoTotalParte.corLuzTotal          = corLuzTotalParte;

                                    // Marca que as luzes de todas as partes ja foram atualizadas pela primeira vez
                                    objetoAtual._jaAcumulouLuzes = true;
                                }
                            }
                                                                                  
                            // Depois envia a iluminação calculada para o shader
                            this.enviarIluminacaoParteShader( gl, 
                                                              informacoesProgramaObjeto, 
                                                              iluminacaoTotalParte
                                                            );
                        }

                        gl.uniform1i(informacoesProgramaObjeto.uniformsCustomizados.usarTextura, booleanToNumber(usarTextura) );
                        gl.uniform1f(informacoesProgramaObjeto.uniformsCustomizados.opacidade, opacidade);

                        // Se tiver opacidade, ativa blending
                        if( opacidade < 1 )
                        {
                            gl.depthMask(false);
                            gl.enable(gl.BLEND);
                            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                        }else {
                            gl.disable(gl.BLEND);
                        }

                        if( informacoesProgramaObjeto.uniformsCustomizados.usarTextura != null ) 
                        {
                            gl.activeTexture(gl.TEXTURE0);
                            gl.bindTexture(gl.TEXTURE_2D, material.map_Kd);
                            gl.uniform1i(informacoesProgramaObjeto.uniformsCustomizados.textura, 0);
                        }

                        // Se este objeto usa iluminação por partes, ele não aplica a global(EM TODO), pois as partes ja controlam isso
                        if( objetoAtual.childrenIndividualLights == false && objetoAtual.alwaysUpdateLights == true )
                        {
                            // Atualiza a iluminação geral do objeto
                            this.aplicarIluminacaoGeralObjeto(
                                                                gl,
                                                                informacoesProgramaObjeto,
                                                                objetoAtual,
                                                                objetoAtual.iluminacaoGeral
                                                            );
                        }

                        gl.drawElements(gl.TRIANGLES, info.quantidadeIndicesParte, gl.UNSIGNED_SHORT, info.indiceInicialParte);

                        // Se foi usado transparencia, desliga a excessão, e volta ao padrão
                        if( opacidade < 1 )
                        {
                            gl.depthMask(true);
                            gl.disable(gl.BLEND);
                        }
                    }

                }else{
                    gl.drawElements(gl.TRIANGLES, objetoAtual.getIndices().length, gl.UNSIGNED_SHORT, 0);
                }

                // FIM DA LOGICA DE RENDERIZAÇÂO DE UM OBJETO   
            }
        }


    }

    /**
    * Desenha os objetos na tela
    * Converte a representação de Meshs para desenhos com WebGL
    */
    public desenharObjetos() : void
    {
        const gl              : WebGL2RenderingContext               = this.gl;
        const objetosVisuais  : Array<VisualMesh>                    = this.getObjetos();
        const luzesCena       : Array<Ponteiro<LightRenderizador>>   = this.getLuzes();
        const frameDelta      : float                                = this.frameCounter.calculateFrameDelta();
        this.lastFrameDelta  = frameDelta;

        // Atualiza a camera
        this.updateCamera( frameDelta );

        /**
        * Desenha os objetos não-transparentes
        */
        gl.depthMask(true);
        gl.disable(this.gl.BLEND);
        gl.enable(this.gl.DEPTH_TEST);
        gl.enable(this.gl.CULL_FACE);

        for( let i:int = 0 ; i < objetosVisuais.length ; i++ )
        {
            const objetoAtual : VisualMesh   = objetosVisuais[i];
            const isInvisivel : boolean      = objetoAtual.invisivel;
            const isOpaco     : boolean      = objetoAtual.isOpaco();
    
            // Se não está invisivel e SE ES OPACO, ENTAO desenha o objeto
            if( isInvisivel == false && isOpaco == true )
            {
                // Atualiza as informações do objeto, como posição, rotação, escala, e outras
                objetoAtual.atualizarDesenho( frameDelta );

                // Desenha o objeto, e aplica iluminação nele
                this.desenharUmObjeto( frameDelta, 
                                       objetoAtual );
            }
        }

        /**
        * Desenha os objetos transparentes
        */
        gl.depthMask(false);
        gl.enable(this.gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        for( let i:int = 0 ; i < objetosVisuais.length ; i++ )
        {
            const objetoAtual    : VisualMesh  = objetosVisuais[i];
            const isInvisivel    : boolean     = objetoAtual.invisivel;
            const isTransparente : boolean     = objetoAtual.isTransparente();

            // Se não está invisivel e SE ES TRANSPARENTE, ENTAO desenha o objeto
            if( isInvisivel == false && isTransparente == true )
            {
                // Atualiza as informações do objeto, como posição, rotação, escala, e outras
                objetoAtual.atualizarDesenho( frameDelta );

                // Desenha o objeto, e aplica iluminação nele
                this.desenharUmObjeto( frameDelta, 
                                       objetoAtual );
            }
        }

        gl.depthMask(true);
        gl.disable(this.gl.BLEND);
    }

    // Desenha tudo
    public desenharTudo() : void
    {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.desenharSkyboxFundo();
        this.desenharObjetos();
    }

    /**
    * Obtem todas as cameras criadas no meu renderizador
    */
    public getCameras(): Array<Ponteiro<CameraRenderizador>>
    {
        return this.cameras;
    }

    /**
    * Define a camera de numero TAL como sendo a visão do jogador 
    */
    public setCameraAtiva( idCameraUsar:int ): void
    {   
        this.idCameraAtiva  = idCameraUsar;
        
        // Se for -1 significa que não é nenhuma, então, não posso fazer nada disso:
        // E não deixa acessar uma camera que não existe
        if( idCameraUsar > -1 && idCameraUsar <= this.cameras.length )
        {
            this.refCameraAtiva = this.cameras[ idCameraUsar ]; 

        }else{
            console.warn(`ID INVALIDO: A camera de ID: ${idCameraUsar}, não existe!`);
        }
    }

    /**
    * Obtem a camera ativa do momento
    */
    public getCameraAtiva(): Ponteiro<CameraRenderizador>
    {
        return this.cameras[ this.idCameraAtiva ];
    }
    /**
    * Obtem o ID da camera ativa do momento
    */
    public getIDCameraAtiva(): int
    {
        return this.idCameraAtiva;
    }

    /**
    * Atualiza a camera atual repassando os dados pra ela, e chamando a função de atualização, passando o frame dela
    */
    public atualizarCameraAtual(): void
    {
        const cameraAtual : Ponteiro<CameraRenderizador>  = this.getCameraAtiva();

        if( this.idCameraAtiva > this.cameras.length )
        {
            console.warn("O this.idCameraAtiva tem um valor invalido!");
        }

        // Se o ponteiro não for null, e se o ID da camera não for valor invalido(no caso, eu defini -1 como sendo um valor invalido)
        if( cameraAtual != null && this.idCameraAtiva != -1 )
        {
            // Repassa as informações de teclado e mouse que o meu renderizador recebeu da minha camada de entrada
            cameraAtual.receberInformacoesTecladoMouse( this.infoPosicaoMouse, this.infoTeclasTeclado );

            // Nova mudança 04/08/2025: transferi a lógica de atualização de camera para a classe CameraInstance.ts da minha outra engine: a engine principal de logica
            // No entando, mantive a função receberInformacoesTecladoMouse, para reter informações uteis de teclado e mouse na classe CameraRenderizador.ts caso eu precise depois.
            
            /**
            * IMPORTANTE: 
            *   Eu removi o calculo de MOVIMENTAÇÂO E ROTAÇÂO aqui da função atualizarCameraAtual, pois eu queria transferir para a engine de logica.
            * 
            *   A MINHA ENGINE DE LOGICA ELA JA CALCULA A MOVIMENTAÇÂO E ROTAÇÂO DESSA CAMERA DA SEGUINTE FORMA:
            *   ELA REPLICA A MOVIMENTAÇÂO E ROTAÇÂO DA CAMERA LOGICA(da engine de logica) PARA ESSA CAMERA VISUAL(deste mini renderizador), na função updateCamerasVisually, das linhas 410-471, do meu arquivo RenderizadorCena.ts. 
            *  
            * Além disso, o "receberInformacoesTecladoMouse" acima nem está sendo usado pra nada. Mais mantive por que eu quis, conforme expliquei.
            */

            // Repassa as informações da camera atual para as variaveis do meu renderizador que controlam a camera
            this.miraCamera[0]    = cameraAtual.miraCamera.x;
            this.miraCamera[1]    = cameraAtual.miraCamera.y;
            this.miraCamera[2]    = cameraAtual.miraCamera.z;
            this.posicaoCamera[0] = cameraAtual.posicaoCamera.x;
            this.posicaoCamera[1] = cameraAtual.posicaoCamera.y;
            this.posicaoCamera[2] = cameraAtual.posicaoCamera.z;
        }

        /*
        Isso eu pensei caso eu quisesse atualizar cada camera, uma por uma pra alguma coisa:
        const cameras : Array<Ponteiro<Camera>> = this.getCameras();

        for( let i:int = 0 ; i < cameras.length ; i++ )
        {
            const cameraAtual : Ponteiro<Camera>   = cameras[i];

            // Se o ponteiro não for null
            if( cameraAtual != null )
            {

            }
        }
        */
    }


    // SERIA NECESSARIO ADAPTAR NO C++ POR CAUSA DE CONTEXTO DE BIND
    public render(now:float) : void
    {
        requestAnimationFrame(this.render);

        now *= 0.001;

        // Atualiza a camera atual
        this.atualizarCameraAtual();

        // Desenha todos os objetos
        this.desenharTudo();
    }

    /**
    * Obtem um objeto que contenha nomeObjeto em seu nome, ou algum outro critério
    */
    public queryObjetos( criterio:string="nome", 
                         operador:string="like", 
                         valorPesquisar:string="" 

    ) : Array<VisualMesh> 
    {
        const objetos      = []; // Com referencia(Array de ponteiros)
        const nomesObjetos = []; // Se precisar 

        for( let i:int = 0 ; i < this.objetos.length ; i++ )
        {
            const objeto  = this.objetos[i];

            // Pesquisar por nome dos objetos
            if( criterio == "nome" )
            {
                let encontrouNome = false;
                if( operador == "like"  ){ encontrouNome = String( objeto.nome ).toLowerCase().indexOf( String( valorPesquisar ).toLowerCase() ) != -1 };
                if( operador == "equal" ){ encontrouNome = String( objeto.nome ).toLowerCase() == String( valorPesquisar ).toLowerCase() };

                if( encontrouNome == true )
                {   
                    objetos.push( objeto );
                    nomesObjetos.push( objeto.nome );
                }
            }

            if( criterio == "id" )
            {
                let encontrouId = false;
                if( operador == "like"  ){ encontrouId = String( objeto.id ).toLowerCase().indexOf( String( valorPesquisar ).toLowerCase() ) != -1 };
                if( operador == "equal" ){ encontrouId = String( objeto.id ).toLowerCase() == String( valorPesquisar ).toLowerCase() };

                if( encontrouId == true )
                {   
                    objetos.push( objeto );
                    nomesObjetos.push( objeto.nome );
                }
            }

            if( criterio == "tipo" )
            {
                let encontrouTipo = false;
                if( operador == "like"  ){ encontrouTipo = String( objeto.tipo ).toLowerCase().indexOf( String( valorPesquisar ).toLowerCase() ) != -1 };
                if( operador == "equal" ){ encontrouTipo = String( objeto.tipo ).toLowerCase() == String( valorPesquisar ).toLowerCase() };

                if( encontrouTipo == true )
                {   
                    objetos.push( objeto );
                    nomesObjetos.push( objeto.nome );
                }
            }

            if( criterio == "classe" )
            {
                let encontrouClasse = false;
                if( operador == "like"  ){ encontrouClasse = String( objeto.classe ).toLowerCase().indexOf( String( valorPesquisar ).toLowerCase() ) != -1 };
                if( operador == "equal" ){ encontrouClasse = String( objeto.classe ).toLowerCase() == String( valorPesquisar ).toLowerCase() };

                if( encontrouClasse == true )
                {   
                    objetos.push( objeto );
                    nomesObjetos.push( objeto.nome );
                }
            }

            if( criterio == "material" )
            {
                let parteTemMaterial = false;

                // .... eu posso criar tambem
            }
        }

        return objetos;
    }

    // Traz o primeiro que encontrar
    public queryObjeto( criterio:string, operador:string, valorPesquisar:string ) : VisualMesh
    {
        return this.queryObjetos(criterio, operador, valorPesquisar)[0];
    }

    /**
    * Inicia o loop de renderização 
    */
    public inicializar(): void
    {
        this.carregarImagemSkybox("/sky/sky.jpg");
        this.render(0);    
    }
}