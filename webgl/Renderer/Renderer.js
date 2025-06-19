/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import {createShader, createBuffer, createProgram} from '../funcoesBase.js';

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
        
import { cuboShaders } from '../Shaders/cube.js';
import { cuboTextureUVShaders } from '../Shaders/cubeTextureUV.js'
import { esferaShaders } from '../Shaders/esfera.js';
import { trianguloShaders } from '../Shaders/triangulo.js';
import { cilindroShaders } from '../Shaders/cilindro.js';
import { OBJShaders } from '../Shaders/obj.js';

import { criarGL }    from '../funcoesBase.js';
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

import { skyboxPlaneShaders } from '../Shaders/planeskybox.js';

export class Renderer
{
    constructor( canvasRef, tipoPerspectiva="perspectiva" ){
        this.canvas = canvasRef;

        // Inicializa a textura do skybox nula
        this.skyTexture    = null;
        this.skyQuadBuffer = null;

        this.frameCounter = new FrameCounter(60);

        // Calcula o tamanho da tela
        this.width  = window.innerWidth;
        this.height = window.innerHeight;

        // Inicializo o contexto GL que vai ser usado pra desenhar tudo na tela
        this.gl = criarGL( this.canvas ); 

        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clearDepth(1);
        
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        //this.gl.depthFunc(this.gl.LESS);

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

            skyboxProgram    : createProgram(this.gl, 
                                          skyboxPlaneShaders.vertexScript, 
                                          skyboxPlaneShaders.fragmentScript),

            cubeProgram      : createProgram(this.gl, 
                                          cuboShaders.vertexScript, 
                                          cuboShaders.fragmentScript),

            OBJProgram       : createProgram(this.gl, 
                                          OBJShaders.vertexScript, 
                                          OBJShaders.fragmentScript),

            cubeTextureUVProgram : createProgram(this.gl, 
                                          cuboTextureUVShaders.vertexScript, 
                                          cuboTextureUVShaders.fragmentScript),

            esferaProgram    : createProgram(this.gl, 
                                          esferaShaders.vertexScript, 
                                          esferaShaders.fragmentScript),

            cilindroProgram   : createProgram(this.gl, 
                                          cilindroShaders.vertexScript, 
                                          cilindroShaders.fragmentScript),

            trianguloProgram : createProgram(this.gl, 
                                          trianguloShaders.vertexScript, 
                                          trianguloShaders.fragmentScript)
                                       
        };

        // Armazena os objetos visuais que serão desenhados
        this.objetos = [];

        // AQUI USEI BIND PRA NAO DAR ERRO NA HORA DE RODAR O LOOP COM O requestAnimationFrame
        // SERIA NECESSARIO ADAPTAR NO C++
        this.render = this.render.bind(this);
    }


    /*** PROGRAMS (para cada tipo de objeto) */
    getSkyboxProgram()
    {
        return this.programs.skyboxProgram;
    }

    getCubeProgram()
    {
        return this.programs.cubeProgram;
    }

    getOBJProgram()
    {
        return this.programs.OBJProgram;
    }

    getCilindroProgram()
    {
        return this.programs.cilindroProgram;
    }

    getCubeTextureUVProgram()
    {
        return this.programs.cubeTextureUVProgram;
    }

    getEsferaProgram()
    {
        return this.programs.esferaProgram;
    }

    getTrianguloProgram()
    {
        return this.programs.trianguloProgram;
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
        }
    }   

    /**
    * Desenha os objetos na tela
    * Converte a representação de Meshs para desenhos com WebGL
    */
    desenharObjetos()
    {
        const objetosVisuais = this.getObjetos();
        const frameDelta     = this.frameCounter.calculateFrameDelta();
        this.lastFrameDelta  = frameDelta;

        // Atualiza a camera
        this.updateCamera( frameDelta );

        for( let i = 0 ; i < objetosVisuais.length ; i++ )
        {
            const objetoAtual = objetosVisuais[i];
            const isInvisivel = objetoAtual.invisivel;

            // Se não está invisivel, desenha o objeto
            if( isInvisivel == false )
            {
                objetoAtual.desenhar( frameDelta );
            }
        }
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
    * Inicia o loop de renderização 
    */
    inicializar()
    {
        this.carregarImagemSkybox("./images/sky.jpg");
        this.render();    
    }
}