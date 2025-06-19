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
import { planoOnduladoShaders } from '../../Shaders/planoOndulado.js';

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

export class PlanoOnduladoMesh extends VisualMesh
{
    constructor( renderer, propriedadesMesh )
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = 'PlanoOndulado';
        this.setProgram( renderer.getCubeProgram() );

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor     = null;
        this.bufferIndices = null;

        // Sem textura sempre vai usar cores
        this.useColors     = true;

        this.criar();

    }

    /**
    * Obtem as posições de renderização do cubo 
    */
    getPositions()
    {
        const positions = [];
        const largura = 10;
        const altura = 10;
        const subdivisoes = 100;

        for (let y = 0; y <= subdivisoes; y++) 
        {
            for (let x = 0; x <= subdivisoes; x++) 
            {
                const posX = (x / subdivisoes - 0.5) * largura;
                const posZ = (y / subdivisoes - 0.5) * altura;
                const posY = 0; // altura começa em zero, pode mudar depois dinamicamente
                positions.push(posX, posY, posZ);
            }
        }

        return positions;
    }

    /**
    * Obtem os indices de renderização do cubo 
    */
    getIndices()
    {
        const indices = [];
        const subdivisoes = 100;

        for (let y = 0; y < subdivisoes; y++) 
        {
            for (let x = 0; x < subdivisoes; x++) 
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
    getFaceColors()
    {
        return [];
    }

    /**
    * Cria o vetor de cores usando o getFaceColors
    */
    getColors()
    {
        const cores = [];
        const vertices = this.getPositions();
        const nivelTransparencia = this.getTransparencia();

        const totalVertices = vertices.length / 3; // 3 por vértice
        for (let i = 0; i < totalVertices; i++) 
        {
            cores.push(1, 0, 0, nivelTransparencia);
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
                posicao   : gl.getAttribLocation(programUsado, planoOnduladoShaders.vertexExtraInfo.variavelPosicaoCubo), // Obtem a variavel que armazena a posicao do objeto na renderização WebGL na GPU
                cor       : gl.getAttribLocation(programUsado, planoOnduladoShaders.vertexExtraInfo.variavelCorCubo),     // Obtem a variavel que armazena a cor do objeto na renderização WebGL na GPU
            },

            atributosVisualizacaoObjeto: {
                matrixVisualizacao : gl.getUniformLocation(programUsado, planoOnduladoShaders.vertexExtraInfo.variavelMatrixVisualizacao), // Obtem a variavel que armazena a matrix de visualização do renderizador na renderização WebGL na GPU
                modeloObjetoVisual : gl.getUniformLocation(programUsado, planoOnduladoShaders.vertexExtraInfo.variavelModeloObjeto), // Obtem a variavel que armazena a matrix do modelo do objeto na renderização WebGL na GPU
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

        gl.disable(gl.CULL_FACE);

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

        // Usa as informações do cubo(que criamos e calculamos acima)
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.matrixVisualizacao, false, matrixVisualizacao);
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, modeloObjetoVisual);

        // Desenha o cubo
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        gl.enable(gl.CULL_FACE);

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

    /**
    * Pode subir ou afundar os pontos deste plano
    */
    elevarPico(xAlvo, zAlvo, raio, intensidade) {
        const vertices = this.getPositions();
        for (let i = 0; i < vertices.length; i += 3) 
        {
            const dx = vertices[i]     - xAlvo;
            const dz = vertices[i + 2] - zAlvo;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < raio) 
            {
                const fator = Math.cos((dist / raio) * Math.PI) * intensidade;
                vertices[i + 1] += fator;
            }
        }

        // Atualiza o buffer no WebGL
        const gl = this.getRenderer().gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
    }

    /**
    * Pode subir ou afundar os pontos deste plano
    * Versão melhorada para criar animações
    */
    elevarPicoParaAnimacao(xAlvo, zAlvo, raio, intensidade, tempo) 
    {
        const vertices = this.vertices;
        for (let i = 0; i < vertices.length; i += 3) 
        {
            const dx = vertices[i] - xAlvo;
            const dz = vertices[i + 2] - zAlvo;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < raio) 
            {
                const onda = Math.cos((dist / raio) * Math.PI - tempo * 5); // senóide que se move
                vertices[i + 1] += onda * intensidade;
            }
        }

        // Atualiza buffer
        const gl = this.getRenderer().gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
    }
}