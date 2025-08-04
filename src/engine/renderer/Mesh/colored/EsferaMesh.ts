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
import { float, int, Ponteiro } from "../../../types/types-cpp-like.js";
import VisualMeshConfig from "../../../interfaces/render_engine/VisualMeshConfig.js";
import InformacoesPrograma from "../../../interfaces/render_engine/InformacoesPrograma.js";
import Position3D from "../../../interfaces/main_engine/Position3D.js";

export class EsferaMesh extends VisualMesh
{
    constructor( renderer:Renderer, propriedadesMesh:VisualMeshConfig )
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = "Esfera";

        // Diz se o objeto é uma superficie plana ou não
        this.isPlano       = false;
        
        //this.setProgram( renderer.getEsferaProgram() );

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor     = null;
        this.bufferIndices = null;

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
    public getPositions() : Array<float>
    {
        const positions  : Array<float>  = [];
        const latitudes  : float         = 30;
        const longitudes : float         = 30;
        const raio       : int           = 1;

        for (let lat:int = 0; lat <= latitudes; lat++) 
        {
            const theta    : float  = lat * Math.PI / latitudes;
            const sinTheta : float  = Math.sin(theta);
            const cosTheta : float  = Math.cos(theta);

            for (let lon:int = 0; lon <= longitudes; lon++) 
            {
                const phi    : float  = lon * 2 * Math.PI / longitudes;
                const sinPhi : float  = Math.sin(phi);
                const cosPhi : float  = Math.cos(phi);

                const x : float  = raio * cosPhi * sinTheta;
                const y : float  = raio * cosTheta;
                const z : float  = raio * sinPhi * sinTheta;

                positions.push(x, y, z);
            }
        }

        return positions;
    }

    /**
    * Obtem os indices de renderização do cubo 
    */
    public getIndices() : Array<float>
    {
        const indices    : Array<float> = [];
        const latitudes  : float  = 30;
        const longitudes : float  = 30;

        for (let lat:int = 0; lat < latitudes; lat++) 
        {
            for (let lon:int = 0; lon < longitudes; lon++) 
            {
                const first = (lat * (longitudes + 1)) + lon;
                const second = first + longitudes + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        return indices;
    }

    /**
    * Obtem as cores das faces do cubo, usados na renderização do cubo 
    */
    public getFaceColors() : Array<float>
    {
        return [];
    }

    /**
    * Cria o vetor de cores usando o getFaceColors
    */
    public getColors() : Array<float>
    {
        const cores              : Array<float>  = [];
        const latitudes          : float         = 30;
        const longitudes         : float         = 30;
        const nivelTransparencia : float         = this.getTransparencia();

        for (let lat:int = 0; lat <= latitudes; lat++) {
            for (let lon:int = 0; lon <= longitudes; lon++) {
                // Aqui, cada vértice recebe uma cor RGBA
                cores.push(1, 0, 0, nivelTransparencia); // vermelho como exemplo
            }
        }

        return cores;
    }
    
    /**
    * @implementation 
    * Implementação do método desenhar para especificamente desenhar um cubo
    * Converte a representação desse Mesh para desenhos com WebGL
    */
    public atualizarDesenho() : void
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
    public criar() : void
    {
        this.atualizarDesenho();
    }
}