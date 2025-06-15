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
import { createShader, createBuffer, createProgram} from '../funcoesBase.js';
import { cuboShaders } from '../Shaders/cube.js';

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
        DefinirZ} from '../math.js';

export class EsferaMesh extends VisualMesh
{
    constructor( renderer, propriedadesMesh )
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = 'Esfera';
        this.setProgram( renderer.getEsferaProgram() );

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
        const positions   = [];
        const latitudes   = 30;
        const longitudes  = 30;
        const raio        = 1;

        for (let lat = 0; lat <= latitudes; lat++) 
        {
            const theta = lat * Math.PI / latitudes;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= longitudes; lon++) 
            {
                const phi = lon * 2 * Math.PI / longitudes;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = raio * cosPhi * sinTheta;
                const y = raio * cosTheta;
                const z = raio * sinPhi * sinTheta;

                positions.push(x, y, z);
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
        const latitudes = 30;
        const longitudes = 30;

        for (let lat = 0; lat < latitudes; lat++) 
        {
            for (let lon = 0; lon < longitudes; lon++) 
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
        const latitudes = 30;
        const longitudes = 30;
        const nivelTransparencia = this.getTransparencia();

        for (let lat = 0; lat <= latitudes; lat++) {
            for (let lon = 0; lon <= longitudes; lon++) {
                // Aqui, cada vértice recebe uma cor RGBA
                cores.push(1, 0, 0, nivelTransparencia); // vermelho como exemplo
            }
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
                posicao   : gl.getAttribLocation(programUsado, cuboShaders.vertexExtraInfo.variavelPosicaoCubo), // Obtem a variavel que armazena a posicao do objeto na renderização WebGL na GPU
                cor       : gl.getAttribLocation(programUsado, cuboShaders.vertexExtraInfo.variavelCorCubo),     // Obtem a variavel que armazena a cor do objeto na renderização WebGL na GPU
            },

            atributosVisualizacaoObjeto: {
                matrixVisualizacao : gl.getUniformLocation(programUsado, cuboShaders.vertexExtraInfo.variavelMatrixVisualizacao), // Obtem a variavel que armazena a matrix de visualização do renderizador na renderização WebGL na GPU
                modeloObjetoVisual : gl.getUniformLocation(programUsado, cuboShaders.vertexExtraInfo.variavelModeloObjeto), // Obtem a variavel que armazena a matrix do modelo do objeto na renderização WebGL na GPU
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

        // Se for um objeto transparente
        if( isTransparente )
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
        

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);

        // Usa o programa criado
        gl.useProgram( programUsado );

        // Usa as informações do cubo(que criamos e calculamos acima)
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.matrixVisualizacao, false, matrixVisualizacao);
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, modeloObjetoVisual);

        // Desenha o cubo
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        // Se for um objeto transparente
        if( isTransparente )
        {
            gl.depthMask(true);
        }

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
}