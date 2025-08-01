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
* Similar ao TexturedUVCubeMesh, 
* porém, permite aplicar uma textura diferente para cada face
*/

import { VisualMesh } from "../VisualMesh.js";
import { createShader, createBuffer, createProgram} from '../../../utils/render_engine/funcoesBase.js';
import { baseShaders } from '../../Shaders/Base.js';

import {
    CriarMatrix4x4, 
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
    DefinirZ
} from '../../../utils/render_engine/math.js';
import { Renderer } from "../../Renderer/Renderer.js";
import { float, int, Ponteiro } from "../../../types/types-cpp-like.js";
import TexturedFacesCuboMeshConfig from "../../../interfaces/render_engine/TexturedFacesCuboMeshConfig.js";
import InformacoesPrograma from "../../../interfaces/render_engine/InformacoesPrograma.js";
import { Matrix } from "../../../types/matrix.js";
import VisualMeshConfig from "../../../interfaces/render_engine/VisualMeshConfig.js";
import Position3D from "../../../interfaces/main_engine/Position3D.js";

export class TexturedFacesCuboMesh extends VisualMesh
{
    public texturasFaces : Array<WebGLTexture>;
    public bufferUV      : Ponteiro<WebGLBuffer>;

    constructor( renderer:Renderer, propriedadesMesh:TexturedFacesCuboMeshConfig )
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = "CuboFacesTexturizadas";

        // Diz se o objeto é uma superficie plana ou não
        this.isPlano       = false;
        
        //this.setProgram( renderer.getCubeTextureUVProgram() );

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor     = null;
        this.bufferIndices = null;
        this.bufferUV      = null;

        // Pega a textura UV como atributo do objeto
        this.usaTexturas    = true; // Obrigaório para que tenha textura
        this.useColors      = propriedadesMesh.useColors || false;
        this.texturasFaces  = propriedadesMesh.texturasFaces; // Array de 6 texturas WebGLTexture

        this.childrenIndividualLights = propriedadesMesh.childrenIndividualLights;   // Se cada parte vai usar iluminação
        this.useAccumulatedLights     = propriedadesMesh.useAccumulatedLights;       // Se os objetos vai receber uma acumulação de luzes ao seu redor
        this.staticAccumulatedLights  = propriedadesMesh.staticAccumulatedLights;    // Se ativado, a acumulação das luzes ao redor dos objetos só vai ocorrer uma unica vez

        if( this.texturasFaces == null )
        {
            throw Error("Voce precisa definir as 6 texturas!");
        }

        this.criar();

    }

    /**
    * Cria os indices de cada face
    */
    getIndicesPorFace() : Matrix<float>
    {
        return [
            [0, 1, 2, 0, 2, 3],     // front
            [4, 5, 6, 4, 6, 7],     // back
            [8, 9,10, 8,10,11],     // top
            [12,13,14,12,14,15],    // bottom
            [16,17,18,16,18,19],    // right
            [20,21,22,20,22,23],    // left
        ];
    }

    /**
    * Obtem o mapa UV do cubo, que permite aplicar uma textura em cada face,
    * A partir de uma unica imagem que contém o mapa UV nele
    */
    getUVs() : Array<float>
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
    getPositions() : Array<float>
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
    getIndices() : Array<float> 
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
    getFaceColors() : Matrix<float>
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
    getColors() : Array<float>
    {
        const faceColors = this.getFaceColors();

        let cores : Array<float> = [];
        for ( let c:int = 0 ; c < faceColors.length ; c++ ) {
            const cor = faceColors[c];
            cores = cores.concat(cor, cor, cor, cor);
        }

        return cores;
    }

    /**
    * @implementation 
    * Implementação do método desenhar para especificamente desenhar um cubo
    * Converte a representação desse Mesh para desenhos com WebGL
    */
    atualizarDesenho() : void
    {
        // Atributos visuais 
        const meshConfig : VisualMeshConfig  = this.meshConfig;
        const position   : Position3D        = meshConfig.position;
        const rotation   : Position3D        = meshConfig.rotation;
        const scale      : Position3D        = meshConfig.scale;

        // Copia os valores do renderer que o objeto acompanha
        this.copiarValoresRenderer();

        // Cria uma matrix para a representação visual do objeto 3d
        this.modeloObjetoVisual = CriarMatrix4x4();
        
        this.modeloObjetoVisual = DefinirTranslacao(this.modeloObjetoVisual, [position.x, position.y, position.z] );

        this.modeloObjetoVisual      = RotacionarX(this.modeloObjetoVisual,  rotation.x);
        this.modeloObjetoVisual      = RotacionarY(this.modeloObjetoVisual,  rotation.y);
        this.modeloObjetoVisual      = RotacionarZ(this.modeloObjetoVisual,  rotation.z);

        this.modeloObjetoVisual      = DefinirEscala(this.modeloObjetoVisual,     [scale.x, scale.y, scale.z]          );

        // PRONTO AGORA O MEU MINI RENDERIZADOR WEBGL JA TEM TUDO O QUE PRECISA PRA DESENHAR ELE
        // VEJA o arquivo Renderer/Renderer.ts

        // PASSOS QUE O Renderer/Renderer.ts faz pra desenhar esse objeto:

            // Cria os buffers se não existirem

            // Determina se vai usar CULL_FACE ou não

            // Define o program a ser usado

            // Faz bind dos buffers usados pelo objeto

            // Se tem texturaUV, aplica ela

            // Se tem bufferUV, faz bind dele

            // Usa as informações calculadas nesse objeto(como posição, rotação e escala) para enviar para o shader

            // Aplica transparencia se o objeto usa

            // Aplica a iluminação geral do objeto como um todo

            // CONCLUSAO ALGORITMO:

                // Se for um cubo com 6 faces texturizadas

                    // Aplica nas 6 faces sua respectiva textura

                    // Chama o drawElements para DESENHAR O OBJETO

                // Se for um OBJ

                    // Calcula, Acumula a iluminação de cada uma das partes do objeto

                    // Envia a iluminação das partes para o shader

                    // Determina a opacidade da parte e se ela usa textura ou não

                    // Se usa textura, aplica ela

                    // Chama o drawElements para DESENHAR O OBJETO

                // Se for qualquer outro tipo

                    // Chama o drawElements para DESENHAR O OBJETO
    }

    /**
    * Metodo chamado logo após o fim do construtor, quanto todos os parametros necessários já foram atribudos
    * Cria o cubo em si, usando o WebGL 
    */
    criar() : void
    {
        this.atualizarDesenho();
    }
}