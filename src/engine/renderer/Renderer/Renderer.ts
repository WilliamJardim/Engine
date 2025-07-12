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
import { createShader, createBuffer, createProgram } from '../utils/funcoesBase.js';
import { criarGL }    from '../utils/funcoesBase.js';
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
        FrameCounter} from '../utils/math.js';
        
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

export class Renderer
{
    public canvas:React.RefObject<HTMLCanvasElement>;
    public skyTexture:any;
    public skyQuadBuffer:any;
    public ambient:number;
    public diffuse:number;
    public specular:number;
    public brilho:number;
    public corAmbient:Array<number>;
    public intensidadeLuz:number;
    public childrenIndividualLights:boolean;
    public useAccumulatedLights:boolean;
    public staticAccumulatedLights:boolean;
    public frameCounter:FrameCounter;
    public lastFrameDelta:number;
    public width:number;
    public height:number;
    public gl:WebGL2RenderingContext;
    public glVersion:string;

    public matrixCamera:any;
    public matrixPontoVista:any;
    public matrixVisualizacao:any;
    public sentidoCamera:Array<float>;
    public posicaoCamera:Array<float>;
    public miraCamera:Array<float>;

    public objetos : Array<any>;
    public luzes   : Array<any>;

    public programs:Mapa<string, WebGLProgram>;
    
    public tipoPerspectiva:string;
    public anguloVisaoY: number;
    public aspectoCamera: number;
    public pPerto: number;
    public pLonge: number;
    
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
    atualizarIluminacao()
    {
        for( let i = 0 ; i < this.objetos.length ; i++ )
        {
            this.objetos[i].atualizarIluminacao();
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
    updateCamera( frameDelta:number )
    {
        this.matrixPontoVista   = CriarMatrixPontoVista( frameDelta, "FPS", this.posicaoCamera, this.miraCamera, this.sentidoCamera );
        this.matrixVisualizacao = MultiplicarMatrix4x4( new Float32Array(16), this.matrixCamera, this.matrixPontoVista );
    }

    /*** OBTEM VISUALIZACAO ATUALIZADA */
    getMatrixVisualizacao()
    {
        return this.matrixVisualizacao;
    }

    getObjetos()
    {
        return this.objetos;
    }

    getLuzes()
    {
        return this.luzes;
    }

    /**
    * Cria um novo objeto na cena( adicionando ele na lista de renderização )
    */
    criarObjeto( propriedadesObjeto:any ): Ponteiro<VisualMesh>
    {
        const contextoRenderizador = this;

        switch( propriedadesObjeto.tipo )
        {
            case "OBJ":
                this.objetos.push( new OBJMesh( contextoRenderizador, 
                                                propriedadesObjeto ) 
                                 );
                break;

            case "Cubo":
                this.objetos.push( new CuboMesh( contextoRenderizador, 
                                                 propriedadesObjeto ) 
                                 );
                break;

            case "CuboDeformavel":
                this.objetos.push( new CuboDeformavelMesh( contextoRenderizador, 
                                                           propriedadesObjeto ) 
                                 );
                break;

            case "Cilindro":
                this.objetos.push( new CilindroMesh( contextoRenderizador, 
                                                     propriedadesObjeto ) 
                                 );
                break;

            case "PlanoOndulado":
                this.objetos.push( new PlanoOnduladoMesh( contextoRenderizador, 
                                                          propriedadesObjeto ) 
                                 );
                break;

            case "TexturedUVCubo":
                this.objetos.push( new TexturedUVCuboMesh( contextoRenderizador, 
                                                           propriedadesObjeto ) 
                                 );
                break;

            case "TexturedFacesCubo":
                this.objetos.push( new TexturedFacesCuboMesh( contextoRenderizador, 
                                                              propriedadesObjeto ) 
                                 );
                
                break;

            case "Esfera":
                this.objetos.push( new EsferaMesh( contextoRenderizador, 
                                                   propriedadesObjeto ) 
                                 );
                break;

            case "Triangulo2D":
                this.objetos.push( new Triangulo2DMesh( contextoRenderizador, 
                                                        propriedadesObjeto ) 
                                 );
                break;

            case "Triangulo3D":
                this.objetos.push( new Triangulo3DMesh( contextoRenderizador, 
                                                        propriedadesObjeto ) 
                                 );
                break;

            case "Light":
                this.luzes.push( new Light( contextoRenderizador, 
                                            propriedadesObjeto ) 
                                 );
                break;
        }

        // Retorna o ultimo objeto criado
        return this.objetos[ this.objetos.length-1 ];
    }   

    /**
    * Desenha os objetos na tela
    * Converte a representação de Meshs para desenhos com WebGL
    */
    desenharObjetos()
    {
        const gl             = this.gl;
        const objetosVisuais = this.getObjetos();
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
            const objetoAtual = objetosVisuais[i];
            const tipoObjeto  = objetoAtual.tipo;
            const isInvisivel = objetoAtual.invisivel;
            const isOpaco     = objetoAtual.isOpaco();

            // Se não está invisivel e SE ES OPACO, ENTAO desenha o objeto
            if( isInvisivel == false && isOpaco == true )
            {
                objetoAtual.desenhar( frameDelta );
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
                objetoAtual.desenhar( frameDelta );
            }
        }

        gl.depthMask(true);
        gl.disable(this.gl.BLEND);
    }

    // Desenha tudo
    desenharTudo()
    {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.desenharSkyboxFundo();
        this.desenharObjetos();
    }

    // SERIA NECESSARIO ADAPTAR NO C++ POR CAUSA DE CONTEXTO DE BIND
    render(now:number) {
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
    ){
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
    queryObjeto( criterio:string, operador:string, valorPesquisar:string )
    {
        return this.queryObjetos(criterio, operador, valorPesquisar)[0];
    }

    /**
    * Inicia o loop de renderização 
    */
    inicializar()
    {
        this.carregarImagemSkybox("./images/sky.jpg");
        this.render(0);    
    }
}