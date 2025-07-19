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
import { createShader, createBuffer, createProgram } from '../../utils/render_engine/funcoesBase.js';
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
        FrameCounter} from '../../utils/render_engine/math.js';
        
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
import { Light } from '../Mesh/Light.js';
import { float, Ponteiro } from '../../types/types-cpp-like.js';
import Mapa from '../../utils/dicionarios/Mapa.js';
import { VisualMesh } from '../Mesh/VisualMesh.ts';
import InformacoesPrograma from '../../interfaces/render_engine/InformacoesPrograma.ts';

export class Renderer
{
    public canvas        : React.RefObject<HTMLCanvasElement>;
    public skyTexture    : Ponteiro<WebGLTexture>;
    public skyQuadBuffer : Ponteiro<WebGLBuffer>;
    public ambient       : number;
    public diffuse       : number;
    public specular      : number;
    public brilho        : number;
    public corAmbient    : Array<number>;

    public intensidadeLuz           : number;
    public childrenIndividualLights : boolean;
    public useAccumulatedLights     : boolean;
    public staticAccumulatedLights  : boolean;

    public frameCounter   : FrameCounter;
    public lastFrameDelta : number;
    public width          : number;
    public height         : number;
    public gl             : WebGL2RenderingContext;
    public glVersion      : string;

    public matrixCamera       : Float32Array<ArrayBufferLike>;
    public matrixPontoVista   : Float32Array<ArrayBufferLike>;
    public matrixVisualizacao : Float32Array<ArrayBufferLike>;
    public sentidoCamera      : Array<float>;
    public posicaoCamera      : Array<float>;
    public miraCamera         : Array<float>;

    public objetos  : Array<VisualMesh>;
    public luzes    : Array<Light>;

    public programs : Mapa<string, WebGLProgram>;
    
    public tipoPerspectiva  : string;
    public anguloVisaoY     : number;
    public aspectoCamera    : number;
    public pPerto           : number;
    public pLonge           : number;
    
    constructor( canvasRef:React.RefObject<HTMLCanvasElement>, tipoPerspectiva:string="perspectiva", renderConfig:any={} ){
        this.canvas = canvasRef;

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

    ficarNoite()
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
    getSkyboxProgram()
    {
        return this.programs.skyboxProgram;
    }

    getCubeProgram()
    {
        return this.programs.basicProgram;
    }

    getEsferaProgram()
    {
        return this.programs.basicProgram;
    }

    getTrianguloProgram()
    {
        return this.programs.basicProgram;
    }

    getCilindroProgram()
    {
        return this.programs.basicProgram;
    }

    getOnduladoProgram()
    {
        return this.programs.onduladoProgram;
    }

    /**
    * Programas com textura
    */
    getOBJProgram()
    {
        return this.programs.textureProgram;
    }

    getCubeTextureUVProgram()
    {
        return this.programs.textureProgram;
    }

    /**
    * Atualiza a iluminação de todos os objetos da cena
    */
    atualizarIluminacao() : void
    {
        for( let i = 0 ; i < this.objetos.length ; i++ )
        {
            const objetoAtual               : VisualMesh           = this.objetos[i];
            const informacoesProgramaObjeto : InformacoesPrograma  = objetoAtual.getInformacoesPrograma();

            objetoAtual.atualizarIluminacao();
        }
    }

    /**
    * Carrega a textura do fundo a cena(o skybox 2D)
    */
    carregarImagemSkybox(imagemURL:string) 
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
        const skyTexture = gl.createTexture();
        const imagem = new Image();
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
    desenharSkyboxFundo() 
    {
        const gl            = this.gl;
        const programSkybox = this.getSkyboxProgram();
        const a_sky_pos     = gl.getAttribLocation(programSkybox, 'a_position');
        const u_sky_texture = gl.getUniformLocation(programSkybox, 'u_texture');

        if (this.getSkyboxProgram() != null && this.skyTexture != null)
        {
            gl.useProgram(programSkybox);

            gl.disable(gl.DEPTH_TEST); // para não bloquear nada do fundo
            gl.bindBuffer(gl.ARRAY_BUFFER, this.skyQuadBuffer);
            gl.enableVertexAttribArray(a_sky_pos);
            gl.vertexAttribPointer(a_sky_pos, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.skyTexture);
            gl.uniform1i(u_sky_texture, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.enable(gl.DEPTH_TEST); // reativa o depth test para objetos 3D
        }

    }


    // chamada sempre que vão haver mudanças de camera, como no loop de renderização dos objetos, etc.
    // OBS: a matrixVisualizacao ja inclui o ponto de vista da camera, já está embutido
    updateCamera( frameDelta:number ) : void
    {
        this.matrixPontoVista   = CriarMatrixPontoVista( frameDelta, "FPS", this.posicaoCamera, this.miraCamera, this.sentidoCamera );
        this.matrixVisualizacao = MultiplicarMatrix4x4( new Float32Array(16), this.matrixCamera, this.matrixPontoVista );
    }

    /*** OBTEM VISUALIZACAO ATUALIZADA */
    getMatrixVisualizacao() : Float32Array<ArrayBufferLike>
    {
        return this.matrixVisualizacao;
    }

    getObjetos() : Array<VisualMesh>
    {
        return this.objetos;
    }

    getLuzes()   : Array<Light>
    {
        return this.luzes;
    }

    /**
    * Cria um novo objeto na cena( adicionando ele na lista de renderização )
    */
    criarObjeto( propriedadesObjeto:any ): Ponteiro<Light|VisualMesh>
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

        if( propriedadesObjeto.tipo == "Light" )
        {
            this.luzes.push( new Light( contextoRenderizador, 
                                        propriedadesObjeto ) 
                                );
        }
        
        
        if( propriedadesObjeto.tipo != "Light" )
        {
            // Retorna o ultimo objeto criado
            return this.objetos[ this.objetos.length-1 ];

        // Se o tipo for luz
        }else if( propriedadesObjeto.tipo == "Light" ){
            
             // Retorna a ultima luz criada
            return this.luzes[ this.luzes.length-1 ];
        }
    }   

    /**
    * Retorna qual o program deve ser usado para desenhar um objeto, de acordo com o tipo dele 
    */
    getProgramObjetoDesenhar( tipoObjeto:string ) : Ponteiro<WebGLProgram>
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
    * Sempre o mesmo em cada objeto
    * Cria os buffers que vão ser usados na renderização
    * SÒ CRIA UMA VEZ, ENTAO SE ELES JA FORAM CRIADOS, USA ELES MESMO SEM PRECISAR CRIAR NOVAMENTE
    * lembrando que cada buffer é um ponteiro, então ele pode ser nulo
    */
    createBuffersObjetoDesenhar( objetoAtual:Ponteiro<VisualMesh> ): void
    {
        const gl : WebGL2RenderingContext = this.gl;
        
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
    enviarIluminacaoParteShader(gl:WebGL2RenderingContext, informacoesPrograma:InformacoesPrograma, mapaIluminacaoTotalParte:Mapa<string, any> ): void
    {
        /**
        * Aplica os valores 
        */
        const ambientShader         = informacoesPrograma.atributosObjeto.ambient;
        const diffuseShader         = informacoesPrograma.atributosObjeto.diffuse;
        const specularShader        = informacoesPrograma.atributosObjeto.specular;
        const brilhoShader          = informacoesPrograma.atributosObjeto.brilho;
        const intensidadeLuzShader  = informacoesPrograma.atributosObjeto.intensidadeLuz;
        const corLuzShader          = informacoesPrograma.atributosObjeto.corLuz;

        // Atualiza as configurações gerais 
        gl.uniform1f(ambientShader,        mapaIluminacaoTotalParte.ambientTotal ); // o ambient
        gl.uniform1f(diffuseShader,        mapaIluminacaoTotalParte.diffuseTotal ); // o diffuse
        gl.uniform1f(specularShader,       mapaIluminacaoTotalParte.specularTotal ); // o specular
        gl.uniform1f(brilhoShader,         mapaIluminacaoTotalParte.brilhoTotal ); // O brilho
        gl.uniform1f(intensidadeLuzShader, mapaIluminacaoTotalParte.intensidadeTotal ); // a intensidade da luz

        // Cores RGB
        gl.uniform3fv(corLuzShader,        new Float32Array( 
                                                             [ 
                                                               mapaIluminacaoTotalParte.corLuzTotal[0],  // Vermelho
                                                               mapaIluminacaoTotalParte.corLuzTotal[1],  // Verde
                                                               mapaIluminacaoTotalParte.corLuzTotal[2]   // Azul
                                                             ] )
                                           );

    }

    /**
    * Desenha um objeto(seja ele qual for)
    * Uma função genérica, e que pode ser chamada aqui dentro, para qualquer objeto.
    * Vou usar ela no método desenharObjetos abaixo
    */
    desenharUmObjeto( frameDelta:number, 
                      objetoAtual:Ponteiro<VisualMesh>
    ): void
    {
        const gl                             : WebGL2RenderingContext         = this.gl;
        const luzesCena                      : Array<Ponteiro<Light>>         = this.luzes;   
        const matrixVisualizacaoRenderizador : Float32Array<ArrayBufferLike>  = this.getMatrixVisualizacao();

        // Se o ponteiro não for nulo
        if( objetoAtual != null )
        {
            /**
            * Identificação do objeto e alguns de seus parametros 
            */
            const tipoObjeto                : string             = objetoAtual.tipo;
            const isTransparente            : boolean            = objetoAtual.isTransparente();
            const transparenciaObjeto       : number             = objetoAtual.transparencia;

            /**
            * Dados de desenho 
            */
            const programUsado              : Ponteiro<WebGLProgram>  = this.getProgramObjetoDesenhar( tipoObjeto );
            const informacoesProgramaObjeto : InformacoesPrograma     = objetoAtual.getInformacoesPrograma();
            const locationPosicaoObjeto     : GLint              = informacoesProgramaObjeto.atributosObjeto.posicao;
            const locationCorObjeto         : GLint              = informacoesProgramaObjeto.atributosObjeto.cor;

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
                    this.createBuffersObjetoDesenhar( objetoAtual );

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
                        
                        //TODO: gl.uniform1i(gl.getUniformLocation(programUsado!, "u_textura"), 0);

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

                // Se não usa textura
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

                // Se não for um objeto, aplica transparencia
                if( objetoAtual.tipo != "OBJ")
                {
                    
                }

                // Atualiza a iluminação geral do objeto
                objetoAtual.aplicarIluminacao( gl, informacoesProgramaObjeto );

                /**
                * Desenha conforme o tipo do objeto em questão
                */
                if( objetoAtual.tipo == "CuboFacesTexturizadas" )
                {
                    /**
                    * Desenha cada face com sua respectiva textura
                    */
                    for( let i=0; i < 6; i++ )
                    {
                        // Vincula a textura da face i
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, objetoAtual.texturasFaces[i]);

                        // Inverte verticalmente a imagem ao carregar
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                        
                        gl.uniform1i(gl.getUniformLocation(programUsado!, "u_textura"), 0);

                        // Desenha só os índices daquela face (passa o offset correto)
                        // O offset do drawElements é em bytes. Cada índice é um UNSIGNED_SHORT (2 bytes).
                        const offset = 6 * i * 2; // 6 indices por face * i * 2 bytes por indice
                        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, offset);
                    }

                }else if( objetoAtual.tipo == "OBJ"){
                    /**
                    * Desenha cada objeto dentro deste OBJ 
                    */
                    for ( let i = 0 ; i < objetoAtual.nomesObjetos.length ; i++ ) 
                    {
                        const nomeObjeto  = objetoAtual.nomesObjetos[i];
                        const info        = objetoAtual.objetosInfo[ nomeObjeto ];
                        const material    = objetoAtual.materiais[objetoAtual.objetos[ nomeObjeto ][0].material];
                        const usarTextura = material != null && material.map_Kd != null;
                        const opacidade   = material.opacity || 1.0;

                        /**
                        * Se esse objeto usa iluminação por cada sub-objeto
                        * Ou seja, Calcula o recebimento de todas as luzes que afeta todas as partes desse objeto 
                        * Nesse caso, eu programei um código por parte. Ou seja, cada parte vai executar esse código abaixo:
                        */
                        if( objetoAtual.childrenIndividualLights == true && objetoAtual.alwaysUpdateLights == true )
                        {
                            const iluminacaoParte           = objetoAtual.iluminationInfo[ nomeObjeto ];
                            const iluminacaoAcumuladaParte  = objetoAtual.iluminationAcumuladaInfo[ nomeObjeto ];
                            const iluminacaoTotalParte      = objetoAtual.iluminationTotal[ nomeObjeto ];

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
                                    const posicaoCentroParte        = objetoAtual.calcularCentroideGlobalParte( nomeObjeto );

                                    iluminacaoAcumuladaParte.brilhoLocalAcumulado          = 0;
                                    iluminacaoAcumuladaParte.ambientLocalAcumulado         = 0;
                                    iluminacaoAcumuladaParte.diffuseLocalAcumulado         = 0;
                                    iluminacaoAcumuladaParte.specularLocalAcumulado        = 0;
                                    iluminacaoAcumuladaParte.corLocalAcumulado             = [0,0,0];
                                    iluminacaoAcumuladaParte.intensidadeLocalAcumulado     = 0;

                                    /**
                                    * Calcula o recebimento de todas as luzes que afeta essa parte 
                                    */
                                    for( let j = 0 ; j < luzesCena.length ; j++ )
                                    {
                                        // Calcula a força da luz em relação a posição do objeto atual(do primeiro laço FOR)
                                        const luz               = luzesCena[j];

                                        // Se o ponteiro não é nulo
                                        if( luz != null )
                                        {
                                            const interferenciaLuz  = luz.calcularInterferencia( posicaoCentroParte );

                                            const forcaLuz               =  interferenciaLuz[0];
                                            const influenciaBrilho       =  interferenciaLuz[1];
                                            const influenciaAmbient      =  interferenciaLuz[2];
                                            const influenciaDiffuse      =  interferenciaLuz[3];
                                            const influenciaSpecular     =  interferenciaLuz[4];
                                            const influenciaIntensidade  =  interferenciaLuz[5];

                                            // Cores
                                            const influenciaVermelho     =  interferenciaLuz[6];
                                            const influenciaVerde        =  interferenciaLuz[7];
                                            const influenciaAzul         =  interferenciaLuz[8];
                                            
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
                                    const ambientTotalParte     = iluminacaoParte.ambientObjeto         + this.ambient                + iluminacaoAcumuladaParte.ambientLocalAcumulado;
                                    const diffuseTotalParte     = iluminacaoParte.diffuseObjeto         + this.diffuse                + iluminacaoAcumuladaParte.diffuseLocalAcumulado;
                                    const specularTotalParte    = iluminacaoParte.specularObjeto        + this.specular               + iluminacaoAcumuladaParte.specularLocalAcumulado;
                                    const brilhoTotalParte      = iluminacaoParte.brilhoObjeto          + this.brilho                 + iluminacaoAcumuladaParte.brilhoLocalAcumulado;
                                    const intensidadeTotalParte = iluminacaoParte.intensidadeLuzObjeto  + this.intensidadeLuz         + iluminacaoAcumuladaParte.intensidadeLocalAcumulado;

                                    const corLuzTotalParte   = [0, 0, 0];
                                    corLuzTotalParte[0]      = iluminacaoParte.corLuzObjeto[0] + this.corAmbient[0] + iluminacaoAcumuladaParte.corLocalAcumulado[0];
                                    corLuzTotalParte[1]      = iluminacaoParte.corLuzObjeto[1] + this.corAmbient[1] + iluminacaoAcumuladaParte.corLocalAcumulado[1];
                                    corLuzTotalParte[2]      = iluminacaoParte.corLuzObjeto[2] + this.corAmbient[2] + iluminacaoAcumuladaParte.corLocalAcumulado[2];

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

                        gl.uniform1i(informacoesProgramaObjeto.uniformsCustomizados.usarTextura, usarTextura ? 1 : 0);
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
                            gl.uniform1i(informacoesProgramaObjeto.uniformsCustomizados.sampler, 0);
                        }

                        // Se este objeto usa iluminação por partes, ele não aplica a global(EM TODO), pois as partes ja controlam isso
                        if( objetoAtual.childrenIndividualLights == false && objetoAtual.alwaysUpdateLights == true )
                        {
                            objetoAtual.aplicarIluminacao( gl, informacoesProgramaObjeto );
                        }

                        gl.drawElements(gl.TRIANGLES, info.count, gl.UNSIGNED_SHORT, info.offset);

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
    desenharObjetos() : void
    {
        const gl             = this.gl;
        const objetosVisuais = this.getObjetos();
        const luzesCena      = this.getLuzes();
        const frameDelta     = this.frameCounter.calculateFrameDelta();
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

        for( let i = 0 ; i < objetosVisuais.length ; i++ )
        {
            const objetoAtual         = objetosVisuais[i];
            const isInvisivel         = objetoAtual.invisivel;
            const isOpaco             = objetoAtual.isOpaco();
    
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

        for( let i = 0 ; i < objetosVisuais.length ; i++ )
        {
            const objetoAtual     = objetosVisuais[i];
            const isInvisivel     = objetoAtual.invisivel;
            const isTransparente  = objetoAtual.isTransparente();

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
    desenharTudo() : void
    {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.desenharSkyboxFundo();
        this.desenharObjetos();
    }

    // SERIA NECESSARIO ADAPTAR NO C++ POR CAUSA DE CONTEXTO DE BIND
    render(now:number) : void
    {
        requestAnimationFrame(this.render);

        now *= 0.001;

        this.desenharTudo();
    }

    /**
    * Obtem um objeto que contenha nomeObjeto em seu nome, ou algum outro critério
    */
    queryObjetos( criterio:string="nome", 
                  operador:string="like", 
                  valorPesquisar:string="" 

    ) : Array<VisualMesh> 
    {
        const objetos      = []; // Com referencia(Array de ponteiros)
        const nomesObjetos = []; // Se precisar 

        for( let i = 0 ; i < this.objetos.length ; i++ )
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
    queryObjeto( criterio:string, operador:string, valorPesquisar:string ) : VisualMesh
    {
        return this.queryObjetos(criterio, operador, valorPesquisar)[0];
    }

    /**
    * Inicia o loop de renderização 
    */
    inicializar(): void
    {
        this.carregarImagemSkybox("/sky/sky.jpg");
        this.render(0);    
    }
}