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
import { float } from "../../../types/types-cpp-like.js";
import VisualMeshConfig from "../../../interfaces/render_engine/VisualMeshConfig.js";
import InformacoesPrograma from "../../../interfaces/render_engine/InformacoesPrograma.js";

export class CuboDeformavelMesh extends VisualMesh
{
    public positionsBase     : Array<float>;
    public verticesOriginais : Array<float>;
    public verticesAtuais    : Array<float>;

    constructor( renderer:Renderer, propriedadesMesh:VisualMeshConfig )
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = 'Cubo';

        // Diz se o objeto é uma superficie plana ou não
        this.isPlano       = false;
        
        //this.setProgram( renderer.getCubeProgram() );

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor     = null;
        this.bufferIndices = null;

        this.positionsBase     = this.getPositions();
        this.verticesOriginais = this.positionsBase.slice();
        this.verticesAtuais    = this.positionsBase.slice();

        // Um cubo sem textura sempre vai usar cores
        this.useColors     = true;

        this.childrenIndividualLights = propriedadesMesh.childrenIndividualLights;   // Se cada parte vai usar iluminação
        this.useAccumulatedLights     = propriedadesMesh.useAccumulatedLights;       // Se os objetos vai receber uma acumulação de luzes ao seu redor
        this.staticAccumulatedLights  = propriedadesMesh.staticAccumulatedLights;    // Se ativado, a acumulação das luzes ao redor dos objetos só vai ocorrer uma unica vez
        
        this.criar();

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

        return [
            [1, 0, 0, nivelTransparencia],    // red
            [0, 1, 0, nivelTransparencia],    // green
            [0, 0, 1, nivelTransparencia],    // blue
            [1, 1, 0, nivelTransparencia],    // yellow
            [1, 0, 1, nivelTransparencia],    // magenta
            [0, 1, 1, nivelTransparencia],    // cyan
        ];
    }

    /**
    * Cria o vetor de cores usando o getFaceColors
    */
    getColors()
    {
        const faceColors = this.getFaceColors();

        let cores : Array<float> = [];
        for ( let c = 0 ; c < faceColors.length ; c++ ) 
        {
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
    atualizarDesenho()
    {
        // Atributos visuais 
        const meshConfig = this.meshConfig;
        const position   = meshConfig.position;
        const rotation   = meshConfig.rotation;
        const scale      = meshConfig.scale;

        // Copia os valores do renderer que o objeto acompanha
        this.copiarValoresRenderer();

        // Cria uma matrix para a representação visual do objeto 3d
        this.modeloObjetoVisual = CriarMatrix4x4();
        
        this.modeloObjetoVisual     = DefinirTranslacao(this.modeloObjetoVisual, [position.x, position.y, position.z] );

        this.modeloObjetoVisual     = RotacionarX(this.modeloObjetoVisual,  rotation.x);
        this.modeloObjetoVisual     = RotacionarY(this.modeloObjetoVisual,  rotation.y);
        this.modeloObjetoVisual     = RotacionarZ(this.modeloObjetoVisual,  rotation.z);

        this.modeloObjetoVisual     = DefinirEscala(this.modeloObjetoVisual,     [scale.x, scale.y, scale.z] );

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
    criar()
    {
        this.atualizarDesenho();
    }

    /**
    * Causa uma deformação no cubo em torno de um ponto de origem
    */
    deformarVerticePorProximidade(xAlvo:number, yAlvo:number, zAlvo:number, raio:number, intensidade:number) 
    {
        const vertices = this.verticesAtuais;

        for (let i = 0; i < vertices.length; i += 3) 
        {
            const dx = vertices[i]     - xAlvo;
            const dy = vertices[i + 1] - yAlvo;
            const dz = vertices[i + 2] - zAlvo;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < raio && dist > 0.00001) 
            {
                const fator = Math.cos((dist / raio) * Math.PI) * intensidade;
                vertices[i]     += (dx / dist) * fator;
                vertices[i + 1] += (dy / dist) * fator;
                vertices[i + 2] += (dz / dist) * fator;
            }
        }

        const gl = this.getRenderer().gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
    }

    /**
    * Volta o cubo em seu estado original sem as deformações 
    */
    restaurarFormaOriginal() 
    {
        this.verticesAtuais = this.verticesOriginais.slice();

        const gl = this.getRenderer().gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.verticesAtuais));
    }
}