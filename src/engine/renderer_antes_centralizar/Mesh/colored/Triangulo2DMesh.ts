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
import VisualMeshConfig from "../../../interfaces/render_engine/VisualMeshConfig.js";
import InformacoesPrograma from "../../../interfaces/render_engine/InformacoesPrograma.js";

export class Triangulo2DMesh extends VisualMesh 
{
    constructor(renderer:Renderer, propriedadesMesh:VisualMeshConfig) 
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = "Triangulo2D";

        // Diz se o objeto é uma superficie plana ou não
        this.isPlano       = false;
        
        this.setProgram(renderer.getTrianguloProgram()); 

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
            0.0,  1.0,  0.0,   // Topo
           -1.0, -1.0,  0.0,   // Esquerda
            1.0, -1.0,  0.0    // Direita
        ];
    }

    getColors() 
    {
        const nivelTransparencia = this.getTransparencia();

        return [
            1.0, 0.0, 0.0, nivelTransparencia,  // Vermelho
            0.0, 1.0, 0.0, nivelTransparencia,  // Verde
            0.0, 0.0, 1.0, nivelTransparencia   // Azul
        ];
    }

    getInformacoesPrograma() : InformacoesPrograma
    {
        const renderer            = this.getRenderer();
        const gl                  = renderer.gl;
        const programUsado        = this.getProgram();

        return {
            atributosObjeto: {
                posicao : gl.getAttribLocation(programUsado!, baseShaders.vertexExtraInfo.variavelPosicaoCubo),
                cor     : gl.getAttribLocation(programUsado!, baseShaders.vertexExtraInfo.variavelCorCubo),
                uv      : 0, // NAO USA MAIS PODE SER ZERO PRA NAO DAR ERRO DE TIPO

                // Iluminação
                brilho     : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelBrilho),
                ambient    : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelAmbient),
                diffuse    : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelDiffuse),
                specular   : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelSpecular),
                corLuz     : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelCorLuz),
                intensidadeLuz : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelIntensidadeLuz)
            },
            atributosVisualizacaoObjeto: {
                matrixVisualizacao: gl.getUniformLocation(programUsado!, baseShaders.vertexExtraInfo.variavelMatrixVisualizacao),
                modeloObjetoVisual: gl.getUniformLocation(programUsado!, baseShaders.vertexExtraInfo.variavelModeloObjeto)
            },
            uniformsCustomizados: {
                usarTextura: gl.getUniformLocation(programUsado!, "uUsarTextura"),
                opacidade  : gl.getUniformLocation(programUsado!, "uOpacidade"),
                sampler    : gl.getUniformLocation(programUsado!, "uSampler")
            }
        };
    }

    createBuffers() 
    {
        const renderer            = this.getRenderer();
        const gl                  = renderer.gl;

        if (this.bufferPosicao == null) {
            this.bufferPosicao = createBuffer(gl, this.getPositions(), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        if (this.bufferCor == null) {
            this.bufferCor = createBuffer(gl, this.getColors(), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }
    }

    atualizarDesenho() 
    {
        const renderer                       = this.getRenderer();
        const matrixVisualizacao             = renderer.getMatrixVisualizacao();
        const atributosTriangulo             = this.getAtributos();
        const gl                             = renderer.gl;
        const programUsado                   = this.getProgram();
        const informacoesPrograma            = this.getInformacoesPrograma();
        const isTransparente                 = this.isTransparente();

        // Copia os valores do renderer que o objeto acompanha
        this.copiarValoresRenderer();

        // Atributos visuais 
        const meshConfig = this.meshConfig;
        const position   = meshConfig.position;
        const rotation   = meshConfig.rotation;
        const scale      = meshConfig.scale;

        this.modeloObjetoVisual = CriarMatrix4x4();

        this.modeloObjetoVisual = DefinirTranslacao(this.modeloObjetoVisual, [position.x, position.y, position.z]);

        this.modeloObjetoVisual = RotacionarX(this.modeloObjetoVisual, rotation.x);
        this.modeloObjetoVisual = RotacionarY(this.modeloObjetoVisual, rotation.y);
        this.modeloObjetoVisual = RotacionarZ(this.modeloObjetoVisual, rotation.z);

        this.modeloObjetoVisual = DefinirEscala(this.modeloObjetoVisual, [scale.x, scale.y, scale.z]);

        /**
        * Cria os buffers que vão ser usados na renderização
        */
        this.createBuffers();

        // PRONTO AGORA O MEU MINI RENDERIZADOR WEBGL JA TEM TUDO O QUE PRECISA PRA DESENHAR ELE
        // VEJA o arquivo Renderer/Renderer.ts

        // Usa o programa criado
        gl.useProgram(programUsado);

        // Atualiza os buffers do objeto 3d com os dados calculados
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.posicao, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.posicao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferCor);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.cor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.cor);

        // NAO FEZ NOS INDICES POR QUE NÂO TEM bufferIndices

        // NAO TEM texturaUV

        // NAO TEM bufferUV

        // Não usa textura
        gl.uniform1i(informacoesPrograma.uniformsCustomizados.usarTextura, 0 );

        if( isTransparente )
        {
            // Opacidade
            gl.uniform1f(informacoesPrograma.uniformsCustomizados.opacidade, this.transparencia );
        }

        this.aplicarIluminacao( gl, informacoesPrograma );

        // Usa as informações do cubo(que criamos e calculamos acima)
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.matrixVisualizacao, false, matrixVisualizacao);
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, this.modeloObjetoVisual);

        // Desenha o tringulo
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // FIM DESSA LOGICA
    }

    criar() 
    {
        this.atualizarDesenho();
    }
}
