/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { VisualMesh } from "../VisualMesh.js";
import { createShader, createBuffer, createProgram} from '../../funcoesBase.js';
import { baseShaders } from '../../Shaders/Base.js';

import {CriarMatrix4x4, 
        MultiplicarMatrix4x4, 
        CriarMatrixPerspectiva, 
        DefinirTranslacao, 
        DefinirEscala,
        RotacionarX, 
        RotacionarY, 
        RotacionarZ, 
        DefinirRotacao, 
        DefinirX, 
        DefinirY, 
        DefinirZ} from '../../math.js';

export class TexturedUVCuboMesh extends VisualMesh
{
    constructor( renderer, propriedadesMesh )
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = 'CuboTexturizadoUV';
        this.setProgram( renderer.getCubeTextureUVProgram() );

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor     = null;
        this.bufferIndices = null;
        this.bufferUV      = null;
        this.texturaUV     = null;

        // Pega a textura UV como atributo do objeto
        this.useColors     = propriedadesMesh.useColors || false;
        this.texturaUV     = propriedadesMesh.texturaUV;

        this.criar();

    }

    /**
    * Obtem o mapa UV do cubo, que permite aplicar uma textura em cada face,
    * A partir de uma unica imagem que contém o mapa UV nele
    */
    getUVs() 
    {
        return [
            // Front
            0, 0, 1, 0, 1, 1, 0, 1,
            // Back
            0, 0, 1, 0, 1, 1, 0, 1,
            // Top
            0, 0, 1, 0, 1, 1, 0, 1,
            // Bottom
            0, 0, 1, 0, 1, 1, 0, 1,
            // Right
            0, 0, 1, 0, 1, 1, 0, 1,
            // Left
            0, 0, 1, 0, 1, 1, 0, 1
        ];
    }

    /**
    * Obtem as posições de renderização do cubo 
    */
    getPositions()
    {
        return [
            // Front
            -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,
            // Back
            -1, -1, -1,  -1,  1, -1,   1,  1, -1,   1, -1, -1,
            // Top
            -1,  1, -1,  -1,  1,  1,   1,  1,  1,   1,  1, -1,
            // Bottom
            -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,
            // Right
            1, -1, -1,   1,  1, -1,   1,  1,  1,   1, -1,  1,
            // Left
            -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1,
        ];
    }

    /**
    * Obtem os indices de renderização do cubo 
    */
    getIndices()
    {
        return [
            0, 1, 2,    0, 2, 3,     // front
            4, 5, 6,    4, 6, 7,     // back
            8, 9,10,    8,10,11,     // top
            12,13,14,   12,14,15,    // bottom
            16,17,18,   16,18,19,    // right
            20,21,22,   20,22,23,    // left
        ];
    }

    /**
    * Obtem as cores das faces do cubo, usados na renderização do cubo 
    */
    getFaceColors()
    {
        // A implantação em C++ seria diferente
        const nivelTransparencia = this.getTransparencia();

        if( this.useColors == true ){
            return [
                [1, 0, 0, nivelTransparencia],    // red
                [0, 1, 0, nivelTransparencia],    // green
                [0, 0, 1, nivelTransparencia],    // blue
                [1, 1, 0, nivelTransparencia],    // yellow
                [1, 0, 1, nivelTransparencia],    // magenta
                [0, 1, 1, nivelTransparencia],    // cyan
            ];

        }else{
            // Tudo branco pra nao ter cor
            return [
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
            ];
        }
    }

    /**
    * Cria o vetor de cores usando o getFaceColors
    */
    getColors()
    {
        const faceColors = this.getFaceColors();

        let cores = [];
        for ( let c = 0 ; c < faceColors.length ; c++ ) {
            const cor = faceColors[c];
            cores = cores.concat(cor, cor, cor, cor);
        }

        return cores;
    }

    /**
    * Obtem as informações do programa, que vão ser usadas na renderização deste cubo 
    */
    getInformacoesPrograma()
    {
        const renderer           = this.getRenderer();
        const gl                 = renderer.gl;
        const programUsado       = this.getProgram();

        return {
            atributosObjeto: {
                posicao   : gl.getAttribLocation(programUsado, baseShaders.vertexExtraInfo.variavelPosicaoCubo), // Obtem a variavel que armazena a posicao do objeto na renderização WebGL na GPU
                cor       : gl.getAttribLocation(programUsado, baseShaders.vertexExtraInfo.variavelCorCubo),     // Obtem a variavel que armazena a cor do objeto na renderização WebGL na GPU
            },
            atributosVisualizacaoObjeto: {
                matrixVisualizacao : gl.getUniformLocation(programUsado, baseShaders.vertexExtraInfo.variavelMatrixVisualizacao), // Obtem a variavel que armazena a matrix de visualização do renderizador na renderização WebGL na GPU
                modeloObjetoVisual : gl.getUniformLocation(programUsado, baseShaders.vertexExtraInfo.variavelModeloObjeto), // Obtem a variavel que armazena a matrix do modelo do objeto na renderização WebGL na GPU
            },
            uniformsCustomizados: {
                usarTextura: gl.getUniformLocation(programUsado, "uUsarTextura"),
                opacidade  : gl.getUniformLocation(programUsado, "uOpacidade"),
                sampler    : gl.getUniformLocation(programUsado, "uSampler")
            }
        }
    }

    /**
    * @implementation
    * Se implementa ela em cada objeto
    * Cria os buffers que vão ser usados na renderização
    * SÒ CRIA UMA VEZ, ENTAO SE ELES JA FORAM CRIADOS, USA ELES MESMO SEM PRECISAR CRIAR NOVAMENTE
    * lembrando que cada buffer é um ponteiro, então ele pode ser nulo
    */
    createBuffers()
    {
        const renderer            = this.getRenderer();
        const gl                  = renderer.gl;

        // Cria os buffers, ou apenas obtem eles se eles ja existem na malha
        if( this.bufferPosicao == null )
        {
            this.bufferPosicao   = createBuffer(gl, this.getPositions(), gl.ARRAY_BUFFER,         gl.STATIC_DRAW);
        }

        if( this.bufferCor == null )
        {
            this.bufferCor       = createBuffer(gl, this.getColors(),    gl.ARRAY_BUFFER,         gl.STATIC_DRAW);
        }

        if( this.bufferIndices == null )
        {
            this.bufferIndices   = createBuffer(gl, this.getIndices(),   gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        if (this.bufferUV == null) 
        {
            this.bufferUV = createBuffer(gl, this.getUVs(), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        //Se não é null é por que ja existe, então nao faz nada!
    }

    /**
    * @implementation 
    * Implementação do método desenhar para especificamente desenhar um cubo
    * Converte a representação desse Mesh para desenhos com WebGL
    */
    desenhar()
    {
        const renderer            = this.getRenderer();
        const matrixVisualizacao  = renderer.getMatrixVisualizacao();
        const atributosCubo       = this.getAtributos();
        const gl                  = renderer.gl;
        const programUsado        = this.getProgram();
        const informacoesPrograma = this.getInformacoesPrograma();
        const indices             = this.getIndices();
        const isTransparente      = this.isTransparente();
        
        // Atributos visuais 
        const meshConfig = this.meshConfig;
        const position   = meshConfig.position;
        const rotation   = meshConfig.rotation;
        const scale      = meshConfig.scale;

        /**
        * Cria os buffers que vão ser usados na renderização
        */
        this.createBuffers();

        // Cria uma matrix para a representação visual do objeto 3d
        let modeloObjetoVisual = CriarMatrix4x4();
        
        modeloObjetoVisual     = DefinirTranslacao(modeloObjetoVisual, [position.x, position.y, position.z] );

        modeloObjetoVisual     = RotacionarX(modeloObjetoVisual,  rotation.x);
        modeloObjetoVisual     = RotacionarY(modeloObjetoVisual,  rotation.y);
        modeloObjetoVisual     = RotacionarZ(modeloObjetoVisual,  rotation.z);

        modeloObjetoVisual     = DefinirEscala(modeloObjetoVisual,     [scale.x, scale.y, scale.z]          );

        // Atualiza os buffers do objeto 3d com os dados calculados
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.posicao, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.posicao);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferCor);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.cor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.cor);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);

        // Usa o programa criado
        gl.useProgram( programUsado );

        if( this.texturaUV != null )
        {
            // Aplica a textura UV(uma imagem para todas as faces do cubo)
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texturaUV ); // o texturaUV precisa estar carregado!
            gl.uniform1i(gl.getUniformLocation(programUsado, "u_textura"), 0);

            gl.uniform1i(informacoesPrograma.uniformsCustomizados.usarTextura, true );
        }

        // Ativa o atributo UV
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferUV);
        gl.vertexAttribPointer(gl.getAttribLocation(programUsado, "aUV"), 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(gl.getAttribLocation(programUsado, "aUV"));

        // Usa as informações do cubo(que criamos e calculamos acima)
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.matrixVisualizacao, false, matrixVisualizacao);
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, modeloObjetoVisual);

        if( isTransparente )
        {
            // Opacidade
            gl.uniform1f(informacoesPrograma.uniformsCustomizados.opacidade, this.transparencia );
        }

        // Desenha o cubo
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        // FIM DESSA LOGICA
    }

    /**
    * Metodo chamado logo após o fim do construtor, quanto todos os parametros necessários já foram atribudos
    * Cria o cubo em si, usando o WebGL 
    */
    criar()
    {
        this.desenhar();
    }
}