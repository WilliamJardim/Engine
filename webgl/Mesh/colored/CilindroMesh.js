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
import { baseShaders } from '../../Shaders/Base.js';

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

export class CilindroMesh extends VisualMesh
{
    constructor( renderer, propriedadesMesh )
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cilindros
        this.tipo = 'Cilindro';
        this.setProgram( renderer.getCilindroProgram() );

        // Atributos de renderização SÂO PONTEIROS INICIALMENTE NULO, MAIS QUE SERÂO ATRIBUIDOS LOGO NA EXECUCAO DESTE CODIGO
        this.bufferPosicao = null;
        this.bufferCor     = null;
        this.bufferIndices = null;

        // Um cilindro sem textura sempre vai usar cores
        this.useColors     = true;
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
    * Obtem as informações do programa, que vão ser usadas na renderização deste cilindro 
    */
    getInformacoesPrograma()
    {
        const renderer           = this.getRenderer();
        const gl                 = renderer.gl;
        const programUsado       = this.getProgram();

        return {
            atributosObjeto: {
                posicao   : gl.getAttribLocation(programUsado, baseShaders.vertexExtraInfo.variavelPosicaoCubo), // Obtem a variavel que armazena a posicao do objeto na renderização WebGL na GPU
                cor       : gl.getAttribLocation(programUsado, baseShaders.vertexExtraInfo.variavelCorCubo),     // Obtem a variavel que armazena a cor do objeto na renderização WebGL na GPU
                // Iluminação
                brilho     : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelBrilho),
                ambient    : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelAmbient),
                diffuse    : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelDiffuse),
                specular   : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelSpecular),
            },
            atributosVisualizacaoObjeto: {
                matrixVisualizacao : gl.getUniformLocation(programUsado, baseShaders.vertexExtraInfo.variavelMatrixVisualizacao), // Obtem a variavel que armazena a matrix de visualização do renderizador na renderização WebGL na GPU
                modeloObjetoVisual : gl.getUniformLocation(programUsado, baseShaders.vertexExtraInfo.variavelModeloObjeto), // Obtem a variavel que armazena a matrix do modelo do objeto na renderização WebGL na GPU
            },
            uniformsCustomizados: {
                usarTextura: gl.getUniformLocation(programUsado, "uUsarTextura"),
                opacidade  : gl.getUniformLocation(programUsado, "uOpacidade"),
                sampler    : gl.getUniformLocation(programUsado, "uSampler")
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
    * Implementação do método desenhar para especificamente desenhar um cilindro
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

        // Usa as informações do cilindro(que criamos e calculamos acima)
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.matrixVisualizacao, false, matrixVisualizacao);
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, modeloObjetoVisual);

        // Não usa textura
        gl.uniform1i(informacoesPrograma.uniformsCustomizados.usarTextura, false );

        if( isTransparente )
        {
            // Opacidade
            gl.uniform1f(informacoesPrograma.uniformsCustomizados.opacidade, this.transparencia );
        }

        this.aplicarIluminacao( gl, informacoesPrograma );

        // Desenha o cilindro
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        gl.enable(gl.CULL_FACE);

        // FIM DESSA LOGICA
    }

    /**
    * Metodo chamado logo após o fim do construtor, quanto todos os parametros necessários já foram atribudos
    * Cria o cilindro em si, usando o WebGL 
    */
    criar()
    {
        this.desenhar();
    }
}