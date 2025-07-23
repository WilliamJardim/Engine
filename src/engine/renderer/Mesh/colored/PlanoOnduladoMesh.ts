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
    DefinirZ,
    booleanToNumber
} from '../../../utils/render_engine/math.js';
import { Renderer } from "../../Renderer/Renderer.js";
import { float, int } from "../../../types/types-cpp-like.js";
import PlanoOnduladoMeshConfig from "../../../interfaces/render_engine/PlanoOnduladoMeshConfig.js";
import InformacoesPrograma from "../../../interfaces/render_engine/InformacoesPrograma.js";
import { Matrix } from "../../../types/matrix.js";

export class PlanoOnduladoMesh extends VisualMesh
{
    public meshConfig : PlanoOnduladoMeshConfig; // Apenas pra dizer pro TypeScript que esse objeto usa um Mesh config diferente

    // ATRIBUTOS MOTIVOS PARA O VisualMesh, para melhor generalização de código
        //public vertices   : Array<float>;

    constructor( renderer:Renderer, propriedadesMesh:PlanoOnduladoMeshConfig )
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = 'PlanoOndulado';

        this.meshConfig    = propriedadesMesh;

        // Diz se o objeto é uma superficie plana ou não
        this.isPlano       = true;

        //this.setProgram( renderer.getOnduladoProgram() );

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor     = null;
        this.bufferIndices = null;
        
        this.vertices      = new Array<Array<float>>();

        // Sem textura sempre vai usar cores
        this.useColors     = true;

        this.childrenIndividualLights = propriedadesMesh.childrenIndividualLights;   // Se cada parte vai usar iluminação
        this.useAccumulatedLights     = propriedadesMesh.useAccumulatedLights;       // Se os objetos vai receber uma acumulação de luzes ao seu redor
        this.staticAccumulatedLights  = propriedadesMesh.staticAccumulatedLights;    // Se ativado, a acumulação das luzes ao redor dos objetos só vai ocorrer uma unica vez

        this.criar();

    }

    /**
    * Obtem as posições de renderização do cubo 
    */
    getPositions() : Array<float>
    {
        const positions   : Array<float>  = [];
        const largura     : float         = 10;
        const altura      : float         = 10;
        const subdivisoes : float         = 100;

        for (let y:int = 0; y <= subdivisoes; y++) 
        {
            for (let x:int = 0; x <= subdivisoes; x++) 
            {
                const posX = (x / subdivisoes - 0.5) * largura;
                const posZ = (y / subdivisoes - 0.5) * altura;
                const posY = 0;

                positions.push(posX, posY, posZ);
            }
        }

        this.vertices = positions;

        return positions;
    }

    /**
    * Obtem os indices de renderização do cubo 
    */
    getIndices() : Array<float>
    {
        const indices     : Array<float>  = [];
        const subdivisoes : float         = 100;

        for (let y:int = 0; y < subdivisoes; y++) 
        {
            for (let x:int = 0; x < subdivisoes; x++) 
            {
                const i = y * (subdivisoes + 1) + x;
                indices.push(i, i + 1, i + subdivisoes + 1);
                indices.push(i + 1, i + subdivisoes + 2, i + subdivisoes + 1);
            }
        }

        return indices;
    }

    /**
    * Obtem as cores das faces do cubo, usados na renderização do cubo 
    */
    getFaceColors() : Array<float>
    {
        return [];
    }

    /**
    * Cria o vetor de cores usando o getFaceColors
    */
    getColors() : Array<float>
    {
        const cores              : Array<float>    = [];
        const vertices           : Array<float>    = this.getPositions();
        const nivelTransparencia : float           = this.getTransparencia();

        const totalVertices : float  = vertices.length / 3; // 3 por vértice
        for (let i:int = 0; i < totalVertices; i++) 
        {
            cores.push(1, 0, 0, nivelTransparencia);
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

        this.modeloObjetoVisual     = DefinirEscala(this.modeloObjetoVisual,     [scale.x, scale.y, scale.z]          );

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

    /**
    * Pode subir ou afundar os pontos deste plano
    */
    elevarPico(xAlvo:float, zAlvo:float, raio:float, intensidade:float) : void
    {
        const vertices : Array<float>  = this.getPositions();
        for (let i:int = 0; i < vertices.length; i += 3) 
        {
            const dx   : float  = vertices[i]     - xAlvo;
            const dz   : float  = vertices[i + 2] - zAlvo;
            const dist : float  = Math.sqrt(dx * dx + dz * dz);

            if (dist < raio) 
            {
                const fator : float  = Math.cos((dist / raio) * Math.PI) * intensidade;
                vertices[i + 1] += fator;
            }
        }

        // Atualiza os vertices desse objeto
        this.renderer.atualizarVerticesPosicao( this, vertices );
    }

    /**
    * Pode subir ou afundar os pontos deste plano
    * Versão melhorada para criar animações
    */
    elevarPicoParaAnimacao(xAlvo:float, zAlvo:float, raio:float, intensidade:float, tempo:float) : void
    {
        const vertices : Array<float>  = this.vertices;
        for (let i:int = 0; i < vertices.length; i += 3) 
        {
            const dx   : float  = vertices[i] - xAlvo;
            const dz   : float  = vertices[i + 2] - zAlvo;
            const dist : float  = Math.sqrt(dx * dx + dz * dz);

            if (dist < raio) 
            {
                const onda = Math.cos((dist / raio) * Math.PI - tempo * 5); // senóide que se move
                vertices[i + 1] += onda * intensidade;
            }
        }

        // Atualiza os vertices desse objeto
        this.renderer.atualizarVerticesPosicao( this, vertices );
    }
}