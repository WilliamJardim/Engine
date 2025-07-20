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
    DefinirZ} from '../../../utils/render_engine/math.js';
import { Renderer } from "../../Renderer/Renderer.js";
import VisualMeshConfig from "../../../interfaces/render_engine/VisualMeshConfig.js";
import InformacoesPrograma from "../../../interfaces/render_engine/InformacoesPrograma.js";

export class CilindroMesh extends VisualMesh
{
    constructor( renderer:Renderer, propriedadesMesh:VisualMeshConfig )
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cilindros
        this.tipo = 'Cilindro';

        // Diz se o objeto é uma superficie plana ou não
        this.isPlano       = false;
        
        //this.setProgram( renderer.getCilindroProgram() );

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor     = null;
        this.bufferIndices = null;

        // Um cilindro sem textura sempre vai usar cores
        this.useColors     = true;

        this.childrenIndividualLights = propriedadesMesh.childrenIndividualLights;   // Se cada parte vai usar iluminação
        this.useAccumulatedLights     = propriedadesMesh.useAccumulatedLights;       // Se os objetos vai receber uma acumulação de luzes ao seu redor
        this.staticAccumulatedLights  = propriedadesMesh.staticAccumulatedLights;    // Se ativado, a acumulação das luzes ao redor dos objetos só vai ocorrer uma unica vez

        this.criar();

    }

    /**
    * Obtem as posições de renderização do cilindro 
    */
    getPositions()
    {
        const N = 32; // Mais pontos = mais suave
        const altura = 2;
        const raio = 1;

        const positions = [];

        // Topo do cilindro
        for (let i = 0; i < N; i++) 
        {
            const ang = (i / N) * 2 * Math.PI;
            const x = Math.cos(ang) * raio;
            const z = Math.sin(ang) * raio;
            positions.push(x, altura / 2, z);
        }

        // Base do cilindro
        for (let i = 0; i < N; i++) 
        {
            const ang = (i / N) * 2 * Math.PI;
            const x = Math.cos(ang) * raio;
            const z = Math.sin(ang) * raio;
            positions.push(x, -altura / 2, z);
        }

        // Adiciona centro do topo e base
        positions.push(0, altura / 2, 0);    // Centro do topo (índice = N*2)
        positions.push(0, -altura / 2, 0);   // Centro da base (índice = N*2 + 1)

        // Lateral do cilindro (duplicando os pontos de topo e base)
        for (let i = 0; i < N; i++) 
        {
            const ang = (i / N) * 2 * Math.PI;
            const x = Math.cos(ang) * raio;
            const z = Math.sin(ang) * raio;
            positions.push(x, altura / 2, z);   // topo
            positions.push(x, -altura / 2, z);  // base
        }

        return positions;
    }

    /**
    * Obtem os indices de renderização do cilindro 
    */
    getIndices()
    {
        const N = 32;
        const indices = [];

        // Topo
        for (let i = 0; i < N; i++) 
        {
            const next = (i + 1) % N;
            indices.push(i, next, N * 2); // Centro fictício ainda não criado, falamos disso abaixo
        }

        // Base
        for (let i = 0; i < N; i++) 
        {
            const next = (i + 1) % N;
            indices.push(i + N, N + next, N * 2 + 1); // Centro fictício da base
        }

        // Laterais
        const baseOffset = N * 2 + 2; // Lateral começa depois do centro do topo e base

        for (let i = 0; i < N; i++) 
        {
            const next = (i + 1) % N;
            const top1 = baseOffset + i * 2;
            const bot1 = top1 + 1;
            const top2 = baseOffset + next * 2;
            const bot2 = top2 + 1;

            indices.push(top1, bot1, top2);
            indices.push(top2, bot1, bot2);
        }

        return indices;
    }

    /**
    * Obtem as cores das faces do cilindro, usados na renderização do cilindro 
    */
    getFaceColors()
    {
       // NAO USADO 
    }

    /**
    * Cria o vetor de cores usando o getFaceColors
    */
    getColors()
    {
        const N = 32;
        const nivelTransparencia = this.getTransparencia();
        const cor = [1.0, 0.6, 0.2, nivelTransparencia]; // Laranja

        const totalVertices = N * 2 + 2 + N * 2; // topo + base + centros + laterais
        const cores = [];

        for (let i = 0; i < totalVertices; i++) 
        {
            cores.push(...cor);
        }

        return cores;
    }

    /**
    * @implementation 
    * Implementação do método desenhar para especificamente desenhar um cilindro
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
    * Cria o cilindro em si, usando o WebGL 
    */
    criar()
    {
        this.atualizarDesenho();
    }
}