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
        DefinirTranslacao, 
        RotacionarX, 
        RotacionarY, 
        RotacionarZ, 
        DefinirRotacao, 
        DefinirX, 
        DefinirY, 
        DefinirZ} from '../math.js';
        
import { cuboShaders } from '../Shaders/cube.js';

import { criarGL }    from '../funcoesBase.js';
import { CuboMesh } from '../Mesh/CuboMesh.js';

export class Renderer
{
    constructor( canvasRef, tipoPerspectiva="perspectiva" ){
        this.canvas = canvasRef;

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

        // Permite transparencia
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Calcula alguns parametros para a camera
        this.tipoPerspectiva = tipoPerspectiva;
        this.anguloVisaoY    = 75 * Math.PI / 180;
        this.aspectoCamera   = this.width / this.height;
        this.pPerto          = 0.1;
        this.pLonge          = 100;

        // Cria uma matrix que vai ser usada pra projetar o cubo no espaço 3d
        if( this.tipoPerspectiva == "perspectiva" ) {
            this.matrixVisualizacao = CriarMatrixPerspectiva(this.anguloVisaoY, 
                                                            this.aspectoCamera, 
                                                            this.pPerto, 
                                                            this.pLonge);

        }else if( this.tipoPerspectiva == "ortografica" ) {
            this.matrixVisualizacao = CriarMatrixOrtografica(
                                        -10, 10, // esquerda, direita
                                        -10, 10, // baixo, cima
                                        0.1, 100 // perto, longe
                                    );
        }

        // Armazena os programs( um para cada tipo de objeto )
        this.programs = {

            cubeProgram: createProgram(this.gl, 
                                       cuboShaders.vertexScript, 
                                       cuboShaders.fragmentScript)
                                       
        };

        // Armazena os objetos visuais que serão desenhados
        this.objetos = [];

        // AQUI USEI BIND PRA NAO DAR ERRO NA HORA DE RODAR O LOOP COM O requestAnimationFrame
        // SERIA NECESSARIO ADAPTAR NO C++
        this.render = this.render.bind(this);
    }

    /*** PROGRAMS (para cada tipo de objeto) */
    getCubeProgram()
    {
        return this.programs.cubeProgram;
    }

    /*** VISUALIZACAO */
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
            case 'Cubo':
                this.objetos.push( new CuboMesh( contextoRenderizador, 
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

        for( let i = 0 ; i < objetosVisuais.length ; i++ )
        {
            const objetoAtual = objetosVisuais[i];
            const isInvisivel = objetoAtual.invisivel;

            // Se não está invisivel, desenha o objeto
            if( isInvisivel == false )
            {
                objetoAtual.desenhar();
            }
        }
    }

    // SERIA NECESSARIO ADAPTAR NO C++ POR CAUSA DE CONTEXTO DE BIND
    render(now) {
        requestAnimationFrame(this.render);

        now *= 0.001;

        // Códigos para a renderização aqui....
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.desenharObjetos();
    }

    /**
    * Inicia o loop de renderização 
    */
    inicializar()
    {
        this.render();    
    }
}