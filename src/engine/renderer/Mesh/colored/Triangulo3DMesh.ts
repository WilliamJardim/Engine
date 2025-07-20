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
import { createBuffer } from "../../../utils/render_engine/funcoesBase.js";
import { baseShaders } from '../../Shaders/Base.js';
import { 
    CriarMatrix4x4, 
    DefinirTranslacao, 
    RotacionarX, 
    RotacionarY, 
    RotacionarZ, 
    DefinirEscala 
} from "../../../utils/render_engine/math.js";
import { Renderer } from "../../Renderer/Renderer.js";
import { float } from "../../../types/types-cpp-like.js";
import VisualMeshConfig from "../../../interfaces/render_engine/VisualMeshConfig.js";
import InformacoesPrograma from "../../../interfaces/render_engine/InformacoesPrograma.js";

export class Triangulo3DMesh extends VisualMesh 
{
    constructor(renderer:Renderer, propriedadesMesh:VisualMeshConfig) 
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = "Triangulo3D";

        // Diz se o objeto é uma superficie plana ou não
        this.isPlano       = false;
        
        //this.setProgram(renderer.getTrianguloProgram()); 

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor = null;

        // Sem textura sempre vai usar cores
        this.useColors     = true;

        this.childrenIndividualLights = propriedadesMesh.childrenIndividualLights;   // Se cada parte vai usar iluminação
        this.useAccumulatedLights     = propriedadesMesh.useAccumulatedLights;       // Se os objetos vai receber uma acumulação de luzes ao seu redor
        this.staticAccumulatedLights  = propriedadesMesh.staticAccumulatedLights;    // Se ativado, a acumulação das luzes ao redor dos objetos só vai ocorrer uma unica vez

        this.criar();
    }

    getPositions() 
    {
        return [
            // Base (quadrado)
            -1, 0, -1,
             1, 0, -1,
             1, 0,  1,
            -1, 0,  1,

            // Topo (vértice da pirâmide)
             0, 1.5, 0
        ];
    }

    getIndices()
    {
        return [
            // Base (2 triângulos)
            0, 1, 2,
            0, 2, 3,

            // Lados
            0, 1, 4,
            1, 2, 4,
            2, 3, 4,
            3, 0, 4
        ];
    }

    getFaceColors() {
        const nivelTransparencia = this.getTransparencia();

        return [
            [1, 0, 0, nivelTransparencia], // base 1
            [1, 0, 0, nivelTransparencia], // base 2
            [0, 1, 0, nivelTransparencia],
            [0, 0, 1, nivelTransparencia],
            [1, 1, 0, nivelTransparencia],
            [1, 0, 1, nivelTransparencia],   
        ];
    }

    getColors() 
    {
        const faceColors = this.getFaceColors();

        let cores : Array<float> = [];
        for (let cor of faceColors) {
            cores = cores.concat(cor, cor, cor); // Cada face tem 3 vértices
        }
        return cores;
    }

    atualizarDesenho() 
    {
        // Atributos visuais 
        const meshConfig = this.meshConfig;
        const position   = meshConfig.position;
        const rotation   = meshConfig.rotation;
        const scale      = meshConfig.scale;

        // Copia os valores do renderer que o objeto acompanha
        this.copiarValoresRenderer();

        this.modeloObjetoVisual = CriarMatrix4x4();

        this.modeloObjetoVisual = DefinirTranslacao(this.modeloObjetoVisual, [position.x, position.y, position.z]);

        this.modeloObjetoVisual = RotacionarX(this.modeloObjetoVisual, rotation.x);
        this.modeloObjetoVisual = RotacionarY(this.modeloObjetoVisual, rotation.y);
        this.modeloObjetoVisual = RotacionarZ(this.modeloObjetoVisual, rotation.z);

        this.modeloObjetoVisual = DefinirEscala(this.modeloObjetoVisual, [scale.x, scale.y, scale.z]);

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

    criar() 
    {
        this.atualizarDesenho();
    }
}
