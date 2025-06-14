/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { VisualMesh } from "./VisualMesh.js";
import { createBuffer } from "../funcoesBase.js";
import { cuboShaders } from "../Shaders/cube.js";
import { CriarMatrix4x4, DefinirTranslacao, RotacionarX, RotacionarY, RotacionarZ, DefinirEscala } from "../math.js";

export class Triangulo3DMesh extends VisualMesh 
{
    constructor(renderer, propriedadesMesh) 
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = "Triangulo3D";
        this.setProgram(renderer.getTrianguloProgram()); 

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor = null;

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

        let cores = [];
        for (let cor of faceColors) {
            cores = cores.concat(cor, cor, cor); // Cada face tem 3 vértices
        }
        return cores;
    }

    getInformacoesPrograma() 
    {
        const renderer            = this.getRenderer();
        const gl                  = renderer.gl;
        const programUsado        = this.getProgram();

        return {
            atributosObjeto: {
                posicao: gl.getAttribLocation(programUsado, cuboShaders.vertexExtraInfo.variavelPosicaoCubo),
                cor:     gl.getAttribLocation(programUsado, cuboShaders.vertexExtraInfo.variavelCorCubo)
            },
            atributosVisualizacaoObjeto: {
                matrixVisualizacao: gl.getUniformLocation(programUsado, cuboShaders.vertexExtraInfo.variavelMatrixVisualizacao),
                modeloObjetoVisual: gl.getUniformLocation(programUsado, cuboShaders.vertexExtraInfo.variavelModeloObjeto)
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

        if (this.bufferIndices == null) {
            this.bufferIndices = createBuffer(gl, this.getIndices(), gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        }
    }

    desenhar() 
    {
        const renderer                       = this.getRenderer();
        const matrixVisualizacao             = renderer.getMatrixVisualizacao();
        const atributosTriangulo             = this.getAtributos();
        const indices                        = this.getIndices();
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

        // Se for um objeto transparente
        if (isTransparente)
        {
            gl.depthMask(false);
        }
        
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
        gl.drawArrays(gl.TRIANGLES, this.getIndices().length, gl.UNSIGNED_SHORT, 0);

        if (isTransparente) 
        {
            gl.depthMask(true);
        }
        
        gl.useProgram(programUsado);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.posicao, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.posicao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferCor);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.cor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.cor);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);

        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.matrixVisualizacao, false, matrixVisualizacao);
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, modeloObjetoVisual);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        if (isTransparente) 
        {
            gl.depthMask(true);
        }

        // FIM DESSA LOGICA
    }

    criar() 
    {
        this.desenhar();
    }
}
