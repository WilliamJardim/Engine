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
import { createShader, createBuffer, createProgram } from '../funcoesBase.js';
import { criarGL }    from '../funcoesBase.js';
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
        FrameCounter} from '../math.js';
        
/**
* Importando shaders 
*/
import { baseShaders } from '../Shaders/Base.js';
import { skyboxPlaneShaders } from '../Shaders/planeskybox.js';

/**
* Importando Meshes 
*/
import { CuboMesh } from '../Mesh/colored/CuboMesh.js';
import { CuboDeformavelMesh } from '../Mesh/colored/CuboDeformavelMesh.js';
import { PlanoOnduladoMesh } from '../Mesh/colored/PlanoOnduladoMesh.js';
import { TexturedUVCuboMesh } from '../Mesh/textured/TexturedUVCubeMesh.js';
import { TexturedFacesCuboMesh } from '../Mesh/textured/TexturedFacesCubeMesh.js';
import { EsferaMesh } from '../Mesh/colored/EsferaMesh.js';
import { CilindroMesh } from '../Mesh/colored/CilindroMesh.js';
import { Triangulo2DMesh } from '../Mesh/colored/Triangulo2DMesh.js';
import { Triangulo3DMesh } from '../Mesh/colored/Triangulo3DMesh.js';
import { OBJMesh } from '../Mesh/OBJMesh.js';
import { Light } from '../Mesh/Light.js';

export class Renderer
{
    constructor( canvasRef, tipoPerspectiva="perspectiva", renderConfig={} ){
        this.canvas = canvasRef;

        // Inicializa a textura do skybox nula
        this.skyTexture    = null;
        this.skyQuadBuffer = null;

        // Iluminação global base que todos os objetos vão seguir
        this.ambient        = renderConfig.ambient  || 1.5; // Força da luz ambiente
        this.diffuse        = renderConfig.diffuse  || 0.6;
        this.specular       = renderConfig.specular || 0.6;
        this.brilho         = renderConfig.brilho   || 32;   // Brilho geral
        this.corAmbient     = renderConfig.corAmbient || [1, 1, 1];
        this.intensidadeLuz = renderConfig.intensidadeLuz || 1;

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
        this.updateCamera();

        // Armazena os programs( um para cada tipo de objeto )
        this.programs = {

            skyboxProgram             : createProgram(this.gl, 
                                          skyboxPlaneShaders.vertexScript, 
                                          skyboxPlaneShaders.fragmentScript),

            basicProgram              : createProgram(this.gl, 
                                          baseShaders.vertexScript, 
                                          baseShaders.fragmentScript),

            onduladoProgram           : createProgram(this.gl, 
                                          baseShaders.vertexScript, 
                                          baseShaders.fragmentScript),

            textureProgram            : createProgram(this.gl, 
                                          baseShaders.vertexScript, 
                                          baseShaders.fragmentScript)            
        };

        // Armazena os objetos visuais que serão desenhados
        this.objetos = [];

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
    carregarImagemSkybox(imagemURL) 
    {
        const gl            = this.gl;
        const programSkybox = this.getSkyboxProgram();

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
    updateCamera( frameDelta )
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

    /**
    * Cria um novo objeto na cena( adicionando ele na lista de renderização )
    */
    criarObjeto( propriedadesObjeto )
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
                this.objetos.push( new Light( contextoRenderizador, 
                                              propriedadesObjeto ) 
                                 );
                break;
        }
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

    // SERIA NECESSARIO ADAPTAR NO C++ POR CAUSA DE CONTEXTO DE BIND
    render(now) {
        requestAnimationFrame(this.render);

        now *= 0.001;

        // Códigos para a renderização aqui....
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.desenharSkyboxFundo();
        this.desenharObjetos();
    }

    /**
    * Obtem um objeto que contenha nomeObjeto em seu nome, ou algum outro critério
    */
    queryObjetos( criterio="nome", 
                  operador="like", 
                  valorPesquisar="" 
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

                if( parteTemMaterial == true )
                {
                    partes.push( referenciaParte );
                    nomesPartes.push(nomeParte);
                }
            }
        }

        return objetos;
    }

    // Traz o primeiro que encontrar
    queryObjeto( criterio, operador, valorPesquisar )
    {
        return this.queryObjetos(criterio, operador, valorPesquisar)[0];
    }

    /**
    * Inicia o loop de renderização 
    */
    inicializar()
    {
        this.carregarImagemSkybox("./images/sky.jpg");
        this.render();    
    }
}