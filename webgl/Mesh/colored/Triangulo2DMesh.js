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
import { createBuffer } from "../../funcoesBase.js";
import { basicShaders } from '../../Shaders/Basic.js';
import { CriarMatrix4x4, DefinirTranslacao, RotacionarX, RotacionarY, RotacionarZ, DefinirEscala } from "../../math.js";

export class Triangulo2DMesh extends VisualMesh 
{
    constructor(renderer, propriedadesMesh) 
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = "Triangulo2D";
        this.setProgram(renderer.getTrianguloProgram()); 

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor = null;

        // Sem textura sempre vai usar cores
        this.useColors     = true;

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

    getInformacoesPrograma() 
    {
        const renderer            = this.getRenderer();
        const gl                  = renderer.gl;
        const programUsado        = this.getProgram();

        return {
            atributosObjeto: {
                posicao: gl.getAttribLocation(programUsado, basicShaders.vertexExtraInfo.variavelPosicaoCubo),
                cor:     gl.getAttribLocation(programUsado, basicShaders.vertexExtraInfo.variavelCorCubo)
            },
            atributosVisualizacaoObjeto: {
                matrixVisualizacao: gl.getUniformLocation(programUsado, basicShaders.vertexExtraInfo.variavelMatrixVisualizacao),
                modeloObjetoVisual: gl.getUniformLocation(programUsado, basicShaders.vertexExtraInfo.variavelModeloObjeto)
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

    desenhar() 
    {
        const renderer                       = this.getRenderer();
        const matrixVisualizacao             = renderer.getMatrixVisualizacao();
        const atributosTriangulo             = this.getAtributos();
        const gl                             = renderer.gl;
        const programUsado                   = this.getProgram();
        const informacoesPrograma            = this.getInformacoesPrograma();
        const isTransparente                 = this.isTransparente();

        // Atributos visuais 
        const meshConfig = this.meshConfig;
        const position   = meshConfig.position;
        const rotation   = meshConfig.rotation;
        const scale      = meshConfig.scale;

        this.createBuffers();

        let modeloObjetoVisual = CriarMatrix4x4();

        modeloObjetoVisual = DefinirTranslacao(modeloObjetoVisual, [position.x, position.y, position.z]);

        modeloObjetoVisual = RotacionarX(modeloObjetoVisual, rotation.x);
        modeloObjetoVisual = RotacionarY(modeloObjetoVisual, rotation.y);
        modeloObjetoVisual = RotacionarZ(modeloObjetoVisual, rotation.z);

        modeloObjetoVisual = DefinirEscala(modeloObjetoVisual, [scale.x, scale.y, scale.z]);

        // Atualiza os buffers do objeto 3d com os dados calculados
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.posicao, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.posicao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferCor);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.cor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.cor);

        // Usa o programa criado
        gl.useProgram(programUsado);

        // Usa as informações do cubo(que criamos e calculamos acima)
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.matrixVisualizacao, false, matrixVisualizacao);
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, modeloObjetoVisual);

        // Desenha o tringulo
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // FIM DESSA LOGICA
    }

    criar() 
    {
        this.desenhar();
    }
}
