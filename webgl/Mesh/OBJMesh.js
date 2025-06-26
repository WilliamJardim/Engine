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
import { createBuffer, carregarTextura } from '../funcoesBase.js';
import { baseShaders } from '../Shaders/Base.js';
import { 
    CriarMatrix4x4,
    DefinirTranslacao,
    DefinirEscala,
    RotacionarX,
    RotacionarY,
    RotacionarZ
} from '../math.js';

export class OBJMesh extends VisualMesh 
{
    constructor(renderer, propriedadesMesh) 
    {
        super(renderer, propriedadesMesh);

        this.tipo             = 'OBJ';
        this._isTransparente  = false;
        this.mtlString        = propriedadesMesh.mtlString;
        this.objString        = propriedadesMesh.objString;

        this.vertices       = [];
        this.uvs            = [];
        this.normals        = [];
        this.positions      = [];
        this.indices        = [];
        this.cores         = [];

        this.bufferPosicao     = null;
        this.bufferCor         = null;
        this.bufferIndices     = null;
        this.allBuffersCriated = false;

        this.materiais       = {};
        this.materialAtivo   = null;

        this.objetos         = {};
        this.nomesObjetos    = []; 
        this.objetoAtivo     = null;
        this.objetosInfo     = {};

        this.childrenIndividualLights = true; // Se cada parte vai usar iluminação
        this.iluminationInfo = {};            // A iluminação de cada objeto individualmente(usada quanto childrenIndividualLights for true)

        this.setProgram( renderer.getOBJProgram() );

        // (1) - Ler o arquivo MTL que contém os materiais e links para as texturas usadas
        this.carregarMTL( this.mtlString );

        // (2) - Ler o arquivo OBJ que contem a malha em si: os vertices, polignos, faces, etc...
        this.carregarOBJ( this.objString );

        // (3) - Criar o OBJ na memoria com seus buffers, etc...
        this.criar();
    }

    /**
    * Função que vai ler um arquivo .MTL
    * Para cada material, ele vai cadastrando esses materiais num dicionario, e vai tambem definindo seus atributos conforme estão nas linhas do .MTL
    * Assim que uma nova declaração de material newmtl é encontrada, ele cadastra esse novo material e repete esse processo,
    * Assim ele cria todos os materiais um por um, conforme eles estao definidos no .MTL 
    * 
    * Serve para interpretar os comandos de um arquivo MTL
    * como "newmtl" = novo material, "d" = opacidade, etc....
    */
    carregarMTL(mtlString) 
    {
        let linhas = mtlString.split('\n');

        // o material atual é o material que está sendo carregado com suas informações
        let materialAtual = null;

        for (let i = 0; i < linhas.length; i++) 
        {
            let linha = linhas[i].trim();

            if (linha.length === 0)
            { 
                continue;
            }

            // Declara um novo material
            if (linha.indexOf('newmtl') === 0) {
                const itensLinha = linha.split(/\s+/);

                materialAtual = itensLinha[1];
                this.materiais[ materialAtual ] = { 
                                                    nome   : materialAtual, 
                                                    Kd     : [1, 1, 1], 
                                                    map_Kd : null 
                                                };

            // Se o current for null              
            } else if (materialAtual !== null) {
                
                // Se tiver transparencia
                if (linha.startsWith('d')) 
                {
                    this.materiais[ materialAtual ].opacity = parseFloat(linha.split(/\s+/)[1]);
                    this._isTransparente = true; // Diz pra Engine que este objeto tem transparencia
                }
                
                // Determina qual a cor do materal
                if (linha.indexOf('Kd') === 0) {
                    const itensLinha = linha.split(/\s+/);

                    this.materiais[ materialAtual ].Kd = [
                        parseFloat( itensLinha[1] ),
                        parseFloat( itensLinha[2] ),
                        parseFloat( itensLinha[3] )
                    ];
                
                // Determina qual a imagem(imagem de textura) que o material usa
                } else if (linha.indexOf('map_Kd') === 0) {
                    const itensLinha   = linha.split(/\s+/);
                    const textureFile  = itensLinha[1];
                    
                    const gl           = this.getRenderer().gl;
                    const textureWebGL = carregarTextura(gl, textureFile);

                    this.materiais[ materialAtual ].map_Kd = textureWebGL;
                }
            }
        }

        console.log(this.materiais);
    }

    /**
    * Função auxiliar que serve para interpretar os comandos de um arquivo OBJ
    * como "o" = objeto, "f" = faces, etc.... 
    */
    _interpretarInstrucaoOBJ( comando=String(), partesLinha=[] )
    {
        // Se for um Vertice
        if (comando === 'v') {
            const v = [ 
                        parseFloat(partesLinha[1]), 
                        parseFloat(partesLinha[2]), 
                        parseFloat(partesLinha[3]) 
                      ];

            this.vertices.push(v);

        // Se for uma Textura de Vertice
        } else if (comando === 'vt') {
            const vt = [ 
                         parseFloat(partesLinha[1]), 
                         parseFloat(partesLinha[2]) 
                       ];

            this.uvs.push(vt);

        // Se for uma Normal do Vertice
        } else if (comando === 'vn') {
            const vn = [ 
                         parseFloat(partesLinha[1]), 
                         parseFloat(partesLinha[2]), 
                         parseFloat(partesLinha[3]) 
                       ];

            this.normals.push(vn);

        // Se for uma Face
        } else if (comando === 'f') {

            // Se nao tem objeto ativo
            if (this.objetoAtivo === null) 
            {
                this.objetoAtivo = 'default';
            }

            // Se nao tem material ativo
            if (this.materialAtivo === null) 
            {
                this.materialAtivo = 'defaultMat';
            }

            // Agrupa por objeto + material
            const grupoObjeto = String( this.objetoAtivo ) + '__' + String( this.materialAtivo );

            if ( !this.objetos[ grupoObjeto ] ) 
            {
                this.objetos[ grupoObjeto ] = [];
            }

            const face = [];
            for (let j = 1; j < partesLinha.length; j++)
            {
                const itemLinha = partesLinha[j].split('/');

                face.push({
                    vi : parseInt(itemLinha[0], 10) - 1,
                    ti : itemLinha[1] ? parseInt(itemLinha[1], 10) - 1 : -1,
                    ni : itemLinha[2] ? parseInt(itemLinha[2], 10) - 1 : -1
                });
            }
            
            this.objetos[ grupoObjeto ].push({
                face     : face,
                material : this.materialAtivo
            });

        // Diz qual material esta sendo usado
        } else if (comando === 'usemtl') {
            this.materialAtivo = partesLinha[1];

        // Definicao de um sub-objeto
        } else if (comando === 'o') {
            this.objetoAtivo = partesLinha[1];
        }
    }

    /**
    * Função que carrega um arquivo .OBJ
    */
    carregarOBJ(objString) 
    {
        const linhas = objString.split('\n');

        for (let i = 0; i < linhas.length; i++)
        {
            let linha = linhas[i].trim();
            if( linha.length === 0 || linha.charAt(0) === '#' )
            {
                continue;
            }

            // (1) - Divide a linha em palavras separadas(uma lista de palavras)
            // (2) - Extrai apenas o comando(que é sempre o primeiro elemento da lista de palavras acima)
            const partes = linha.split(/\s+/);
            const comando = partes[0];

            // (3) - Interpreta o comando atual
            this._interpretarInstrucaoOBJ( comando, partes );
        }

        const objectKeys = Object.keys(this.objetos);

        // Obtem os nomes dos objetos
        this.nomesObjetos = objectKeys;

        let keyToIndex  = {};
        let indiceAtual = 0;

        for (let i = 0; i < objectKeys.length; i++) 
        {
            const nome  = objectKeys[i];
            const faces = this.objetos[nome];

            for (let j = 0; j < faces.length; j++) 
            {
                const face          = faces[j];
                const indicesFaces  = [];

                for (let k = 0; k < face.face.length; k++) 
                {
                    const v = face.face[k];
                    const key = v.vi + '/' + v.ti + '/' + v.ni;    // Concatena os valores que vem no .OBJ para usar como chave

                    // Se o indice da chave nao foi cadastrado, salva ele, com posição, cor
                    if ( keyToIndex[key] === undefined ) 
                    {
                        keyToIndex[key] = indiceAtual++;

                        this.cores.push( ...(this.materiais[face.material].Kd || [1, 1, 1]), 1);

                        const posicao = this.vertices[v.vi] || [0, 0, 0];
                        this.positions.push(posicao[0], posicao[1], posicao[2]);

                        if (v.ti >= 0) {
                            const uv = this.uvs[v.ti];
                            this.uvArray = this.uvArray || [];
                            this.uvArray.push(uv[0], uv[1]);
                        } else {
                            this.uvArray = this.uvArray || [];
                            this.uvArray.push(0, 0);
                        }
                    }

                    indicesFaces.push(keyToIndex[key]);
                }

                for (let k = 1; k < indicesFaces.length - 1; k++) 
                {
                    this.indices.push(indicesFaces[0], indicesFaces[k], indicesFaces[k + 1]);
                }
            }
        }

        /**
        * Mapeia os indices para cada objeto a ser desenhado,
        * Organiza os buffers de posições, cores, UVs e indices.
        */
        keyToIndex = {};
        indiceAtual = 0;

        this.indices = []; // reseta para montar os índices gerais

        this.objetosInfo = {}; // objeto para guardar offset/count por objeto
        this.iluminationInfo = {} // Iluminação por objeto dentro desse OBJ, por padrão será iniciado com valores padrão

        let globalIndexCount = 0; // para contar índice total gerado

        for (let i = 0; i < objectKeys.length; i++) 
        {
            const nomeObjeto    = objectKeys[i];
            const faces         = this.objetos[nomeObjeto];
            const startIndex    = globalIndexCount;  // índice inicial no buffer geral

            let localIndexCount = 0;               // conta índices desse objeto só

            /**
            * Define a iluminação do objeto como sendo a iluminação padrão
            */
            this.iluminationInfo[nomeObjeto] = {
                brilhoObjeto         : 0,
                ambientObjeto        : 0,
                diffuseObjeto        : 0,
                specularObjeto       : 0,
                corLuzObjeto         : [0, 0, 0], //RGB
                intensidadeLuzObjeto : 0
            };

            for (let j = 0; j < faces.length; j++) 
            {
                const face         = faces[j];
                const indicesFaces = [];

                for (let k = 0; k < face.face.length; k++) 
                {
                    const v = face.face[k];
                    const key = v.vi + '/' + v.ti + '/' + v.ni;   // Concatena os valores que vem no .OBJ para usar como chave

                    if ( keyToIndex[key] === undefined ) 
                    {
                        keyToIndex[key] = indiceAtual++;

                        this.cores.push(...(this.materiais[face.material].Kd || [1, 1, 1]), 1);

                        const posicao = this.vertices[v.vi] || [0, 0, 0];
                        this.positions.push(posicao[0], posicao[1], posicao[2]);

                        if (v.ti >= 0) {
                            const uv = this.uvs[v.ti];
                            this.uvArray = this.uvArray || [];
                            this.uvArray.push(uv[0], uv[1]);
                        } else {
                            this.uvArray = this.uvArray || [];
                            this.uvArray.push(0, 0);
                        }
                    }

                    indicesFaces.push(keyToIndex[key]);
                }

                // triangula a face (assumindo que face.face.length >= 3)
                for (let k = 1; k < indicesFaces.length - 1; k++) 
                {
                    this.indices.push(indicesFaces[0], indicesFaces[k], indicesFaces[k + 1]);
                    localIndexCount += 3;
                    globalIndexCount += 3;
                }
            }

            // Armazena o offset em bytes (3 índices * 2 bytes por índice cada) e a contagem de índices
            this.objetosInfo[nomeObjeto] = {
                offset: startIndex * 2, // offset em bytes, pois drawElements espera offset em bytes
                count: localIndexCount
            };
        }

        console.log(this.uvArray);
    }

    getPositions() 
    {
        return this.positions;
    }

    getColors() 
    {
        return this.cores;
    }

    getIndices() 
    {
        return this.indices;
    }

    getUVs() 
    {
        return this.uvArray || [];
    }

    getInformacoesPrograma() 
    {
        const renderer           = this.getRenderer();
        const gl                 = renderer.gl;
        const programUsado       = this.getProgram();

        return {
            atributosObjeto: {
                posicao    : gl.getAttribLocation(programUsado, baseShaders.vertexExtraInfo.variavelPosicaoCubo),
                cor        : gl.getAttribLocation(programUsado, baseShaders.vertexExtraInfo.variavelCorCubo),
                uv         : gl.getAttribLocation(programUsado, baseShaders.vertexExtraInfo.variavelUV),

                // Iluminação
                brilho     : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelBrilho),
                ambient    : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelAmbient),
                diffuse    : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelDiffuse),
                specular   : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelSpecular),
                corLuz     : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelCorLuz),
                intensidadeLuz : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelIntensidadeLuz)
                //posicaoLuz     : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelPosicaoLuz),

            },
            atributosVisualizacaoObjeto: {
                matrixVisualizacao: gl.getUniformLocation(programUsado, baseShaders.vertexExtraInfo.variavelMatrixVisualizacao),
                modeloObjetoVisual: gl.getUniformLocation(programUsado, baseShaders.vertexExtraInfo.variavelModeloObjeto)
            },
            uniformsCustomizados: {
                usarTextura: gl.getUniformLocation(programUsado, "uUsarTextura"),
                opacidade  : gl.getUniformLocation(programUsado, "uOpacidade"),
                sampler    : gl.getUniformLocation(programUsado, "uSampler")
            }
        };
    }

    createBuffers() 
    {
        const gl = this.getRenderer().gl;

        if ( this.bufferPosicao == null ) 
        {
            this.bufferPosicao = createBuffer(gl, this.getPositions(), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        if ( this.bufferCor == null )
        {
            this.bufferCor     = createBuffer(gl, this.getColors(),    gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }
        
        if ( this.bufferIndices == null )
        { 
            this.bufferIndices = createBuffer(gl, this.getIndices(),   gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        if( this.bufferUV == null )
        {
            this.bufferUV = createBuffer(gl, this.getUVs(), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        // Diz que ja criou todos os buffers para não chamar novamente
        this.allBuffersCriated = true;
    }

    /**
    * @override
    * @implementation
    */
    isTransparente()
    {
        return this.transparencia < 1 || this._isTransparente == true;
    }

    /**
    * Define a iluminação de uma parte do modelo
    */
    atualizarIluminacaoParte(gl, informacoesPrograma, iluminacaoParte={} )
    {
        /**
        * Obtem o ambiente atualizado como a soma dos valores do objeto com os globais da cena
        */
        const ambientParte     = iluminacaoParte.ambientObjeto  + this.renderer.ambient;
        const diffuseParte     = iluminacaoParte.diffuseObjeto  + this.renderer.diffuse;
        const specularParte    = iluminacaoParte.specularObjeto + this.renderer.specular;
        const brilhoParte      = iluminacaoParte.brilhoObjeto   + this.renderer.brilho;
        const intensidadeParte = iluminacaoParte.intensidadeLuzObjeto + this.renderer.intensidadeLuz;

        let corLuzParte     = [0, 0, 0];
        corLuzParte[0]      = iluminacaoParte.corLuzObjeto[0] + this.renderer.corAmbient[0];
        corLuzParte[1]      = iluminacaoParte.corLuzObjeto[1] + this.renderer.corAmbient[1];
        corLuzParte[2]      = iluminacaoParte.corLuzObjeto[2] + this.renderer.corAmbient[2];

        /**
        * Aplica os valores 
        */
        const brilhoShader          = informacoesPrograma.atributosObjeto.brilho;
        const ambientShader         = informacoesPrograma.atributosObjeto.ambient;
        const diffuseShader         = informacoesPrograma.atributosObjeto.diffuse;
        const specularShader        = informacoesPrograma.atributosObjeto.specular;
        const corLuzShader          = informacoesPrograma.atributosObjeto.corLuz;
        const intensidadeLuzShader  = informacoesPrograma.atributosObjeto.intensidadeLuz;

        // Atualiza as configurações gerais 
        gl.uniform1f(brilhoShader,   brilhoParte);
        gl.uniform1f(ambientShader,  ambientParte);
        gl.uniform1f(diffuseShader,  diffuseParte);
        gl.uniform1f(specularShader, specularParte);
        gl.uniform3fv(corLuzShader,   new Float32Array(corLuzParte) );
        gl.uniform1f(intensidadeLuzShader, intensidadeParte);
    }

    /**
    * Define a iluminação do objeto como um todo 
    * @override
    */
    setIntireIlumination( iluminationDefinition={} )
    {
        this.brilhoObjeto   = iluminationDefinition.brilhoObjeto;
        this.ambientObjeto  = iluminationDefinition.ambientObjeto;
        this.diffuseObjeto  = iluminationDefinition.diffuseObjeto;
        this.specularObjeto = iluminationDefinition.specularObjeto;
        this.intensidadeLuzObjeto = iluminationDefinition.intensidadeLuzObjeto;

        // Pega a cor da luz
        this.corLuzObjeto    = [0, 0, 0];
        this.corLuzObjeto[0] = (iluminationDefinition.corLuzObjeto[0] || 0) + this.renderer.corAmbient[0];
        this.corLuzObjeto[1] = (iluminationDefinition.corLuzObjeto[1] || 0) + this.renderer.corAmbient[1];
        this.corLuzObjeto[2] = (iluminationDefinition.corLuzObjeto[2] || 0) + this.renderer.corAmbient[2];

        // Se todos os filhos(subojetos) usam iluminação individual
        if( this.childrenIndividualLights == true )
        {
            for( let i = 0 ; i < this.nomesObjetos.length ; i++ )
            {
                const nomeObjeto = this.nomesObjetos[i];

                this.iluminationInfo[ nomeObjeto ] = {
                    brilhoObjeto          : iluminationDefinition.brilhoObjeto,
                    ambientObjeto         : iluminationDefinition.ambientObjeto,
                    diffuseObjeto         : iluminationDefinition.diffuseObjeto,
                    specularObjeto        : iluminationDefinition.specularObjeto,
                    corLuzObjeto          : this.corLuzObjeto,
                    intensidadeLuzObjeto  : iluminationDefinition.intensidadeLuzObjeto   
                }

            }
        }
    }

    desenhar() 
    {
        const renderer            = this.getRenderer();
        const gl                  = renderer.gl;
        const programUsado        = this.getProgram();
        const isTransparente      = this.isTransparente();
        const indices             = this.getIndices();
        const informacoesPrograma = this.getInformacoesPrograma();

        // Atributos visuais 
        const meshConfig = this.meshConfig;
        const position   = meshConfig.position;
        const rotation   = meshConfig.rotation;
        const scale      = meshConfig.scale;

        let modeloObjetoVisual = CriarMatrix4x4();

        modeloObjetoVisual     = DefinirTranslacao(modeloObjetoVisual, [position.x, position.y, position.z]);

        modeloObjetoVisual     = RotacionarX(modeloObjetoVisual, rotation.x);
        modeloObjetoVisual     = RotacionarY(modeloObjetoVisual, rotation.y);
        modeloObjetoVisual     = RotacionarZ(modeloObjetoVisual, rotation.z);

        modeloObjetoVisual     = DefinirEscala(modeloObjetoVisual, [scale.x, scale.y, scale.z]);

        if( this.allBuffersCriated == false )
        {
            this.createBuffers();
        }

        gl.useProgram(programUsado);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.posicao, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.posicao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferCor);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.cor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.cor);

        if (this.bufferUV && informacoesPrograma.atributosObjeto.uv !== -1) 
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferUV);
            gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.uv, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.uv);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);

        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.matrixVisualizacao, false, renderer.getMatrixVisualizacao());
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, modeloObjetoVisual);

        /**
        * Desenha cada objeto dentro deste OBJ 
        */
        for ( let i = 0 ; i < this.nomesObjetos.length ; i++ ) 
        {
            const nomeObjeto  = this.nomesObjetos[i];
            const info        = this.objetosInfo[nomeObjeto];
            const material    = this.materiais[this.objetos[nomeObjeto][0].material];
            const usarTextura = material != null && material.map_Kd != null;
            const opacidade   = material.opacity || 1.0;

            // Se esse objeto usa iluminação por cada sub-objeto
            if( this.childrenIndividualLights == true )
            {
                const iluminacaoParte = this.iluminationInfo[ nomeObjeto ];
                this.atualizarIluminacaoParte( gl, informacoesPrograma, iluminacaoParte );
            }

            gl.uniform1i(informacoesPrograma.uniformsCustomizados.usarTextura, usarTextura ? 1 : 0);
            gl.uniform1f(informacoesPrograma.uniformsCustomizados.opacidade, opacidade);

            // Se tiver opacidade, ativa blending
            if( opacidade < 1 )
            {
                gl.depthMask(false);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }else {
                gl.disable(gl.BLEND);
            }

            if (usarTextura) 
            {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, material.map_Kd);
                gl.uniform1i(informacoesPrograma.uniformsCustomizados.sampler, 0);
            }

            // Se este objeto usa iluminação por partes, ele não aplica a global(EM TODO), pois as partes ja controlam isso
            if( this.childrenIndividualLights == false )
            {
                this.aplicarIluminacao( gl, informacoesPrograma );
            }

            gl.drawElements(gl.TRIANGLES, info.count, gl.UNSIGNED_SHORT, info.offset);

            //break; //Interrompe o loop pois todos os dados ja foram enviados

            // Se foi usado transparencia, desliga a excessão, e volta ao padrão
            if( opacidade < 1 )
            {
                gl.depthMask(true);
                gl.disable(gl.BLEND);
            }
        }

        
    }

    criar() 
    {
        this.desenhar();
    }
}
