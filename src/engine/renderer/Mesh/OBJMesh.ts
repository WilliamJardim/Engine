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
import { createBuffer, carregarTextura } from '../utils/funcoesBase.js';
import { baseShaders } from '../Shaders/Base.js';
import { 
    CriarMatrix4x4,
    MultiplicarMatrix4x4PorVetor4,
    DefinirTranslacao,
    DefinirEscala,
    RotacionarX,
    RotacionarY,
    RotacionarZ
} from '../utils/math.js';
import { Renderer } from "../Renderer/Renderer.js";
import { float, Ponteiro } from "../../types/types-cpp-like.js";
import Mapa from "../../utils/dicionarios/Mapa.js";

/**
* PORTABILIDADE PRA C++:
* 
* Classe baseada no VisualMesh. Tem todos os atributos e métodos que VisualMesh tem.
* Porém implementa os métodos abstratos do VisualMesh que devem implementados por cada objeto
*
* Define "informacoesPrograma" na função getInformacoesPrograma(), utilizando informações fornecidas pelo "renderer".
* Faz uso do "renderer" umas 23 vezes, exatamente com a mesma finalidade que o VisualMesh usa,
* apenas pra obter informações pra criar o "informacoesPrograma", iluminação, e obter outras coisas que o "renderer" fornece
*
* Ele usa o "informacoesPrograma" umas 25 vezes ao todo. 
* É algo chave: ele precisa do informacoesPrograma para poder se comunicar com o shaders, obter informações sobre as variaveis dos shaders, e outras coisas muito importantes.
* 
* A classe OBJMesh também cria vários novos atributos e métodos propios. Os métodos manipulam, retornam ou acessam os propios atributos, ou atributos do "renderer"
*
* O código usa bastante Vetores e Mapas( Tabelas Hash ) dinamicos.
* Também é possivel fazer isso em C++
*
* Não é nada muito diferente do VisualMesh
* Também é 100% portável para C++
*/

export class OBJMesh extends VisualMesh 
{
    public _isTransparente    : boolean;
    public mtlString          : string;
    public objString          : string;
    public vertices           : Array<Array<float>>;
    
    public bufferUV           : Ponteiro<WebGLBuffer>;
    public uvs                : Array<Array<float>>;
    public uvArray            : Array<float>;

    public normals            : Array<Array<float>>;
    public positions          : Array<float>;
    public indices            : Array<float>;
    public cores              : Array<float>;
    public allBuffersCriated  : boolean;

    public materiais          : Mapa<string, any>;
    public materialAtivo      : any;

    public objetos            : Mapa<string, any>;
    public objetoAtivo        : any;
    public nomesObjetos       : Array<string>;

    public objetosInfo                   : Mapa<string, any>;
    public verticesObjetos               : Mapa<string, any>;
    public verticesObjetosOnlyNomeParte  : Mapa<string, any>; 
    public verticesComecaObjetos         : Mapa<string, any>;

    public iluminationInfo               : Mapa<string, any>;
    public iluminationAcumuladaInfo      : Mapa<string, any>;

    constructor(renderer:Renderer, propriedadesMesh:any) 
    {
        super(renderer, propriedadesMesh);

        this.tipo              = 'OBJ';
        this._isTransparente   = false;
        
        // Diz se o objeto é uma superficie plana ou não
        this.isPlano       = false;

        this.mtlString         = propriedadesMesh.mtlString;
        this.objString         = propriedadesMesh.objString; 

        this.vertices          = new Array();
        this.uvs               = new Array();
        this.uvArray           = new Array<float>();
        this.normals           = new Array();
        this.positions         = new Array();
        this.indices           = new Array();
        this.cores             = new Array();

        this.bufferPosicao     = null;
        this.bufferCor         = null;
        this.bufferIndices     = null;
        this.bufferUV          = null;
        this.allBuffersCriated = false;

        this.materiais         = new Mapa<string, any>();
        this.materialAtivo     = null;

        this.objetos                       = new Mapa<string, any>();
        this.nomesObjetos                  = new Array(); 
        this.objetoAtivo                   = null;
        this.objetosInfo                   = new Mapa<string, any>();
        this.verticesObjetos               = new Mapa<string, any>();   // Vertices por partes
        this.verticesObjetosOnlyNomeParte  = new Mapa<string, any>();   // Vertices por partes (somente o nome da parte sem usar material na chave)
        this.verticesComecaObjetos         = new Mapa<string, any>();   // Length que começa os vertices de cada objeto no vetor geral vertices

        this.childrenIndividualLights = propriedadesMesh.childrenIndividualLights;   // Se cada parte vai usar iluminação

        this.useAccumulatedLights     = propriedadesMesh.useAccumulatedLights;     // Se cada parte vai receber uma acumulação de luzes ao seu redor
        this.staticAccumulatedLights  = propriedadesMesh.staticAccumulatedLights;  // Se ativado, a acumulação das luzes ao redor das partes só vai ocorrer uma unica vez
        this._jaAcumulouLuzes         = false;                                     // Caso "staticAccumulatedLights" seja true, essa variavel de controle "_jaAcumulouLuzes" vai ser usada para interromper o loop de atualização das luzes

        this.iluminationInfo          = new Mapa<string, any>();  // A iluminação de cada objeto individualmente(usada quanto childrenIndividualLights for true)
        this.iluminationAcumuladaInfo = new Mapa<string, any>();  // A iluminação acumulada de cada objeto individualmente(usada quanto childrenIndividualLights for true)

        // Variaveis de renderização
        this.modeloObjetoVisual = CriarMatrix4x4();

        this.setProgram( renderer.getOBJProgram() );

        // (1) - Ler o arquivo MTL que contém os materiais e links para as texturas usadas
        this.carregarMTL( this.mtlString );

        // (2) - Ler o arquivo OBJ que contem a malha em si: os vertices, polignos, faces, etc...
        this.carregarOBJ( this.objString );

        // (3) - Criar o OBJ na memoria com seus buffers, etc...
        this.criar();
    }

    // Ativa a iluminação individual de cada parte individual do OBJ
    enableChildrenIndividualLights()
    {   
        this.childrenIndividualLights = true;
    }

    // Desativa a iluminação individual de cada parte individual do OBJ
    disableChildrenIndividualLights()
    {
        this.childrenIndividualLights = false;
    }

    // Ativa a acumulação de luzes em cada parte individual do OBJ
    enableAccumulatedLights()
    {
        this.useAccumulatedLights = true;
    }

    // Disativa a acumulação de luzes em cada parte individual do OBJ
    disableAccumulatedLights()
    {
        this.useAccumulatedLights = false;
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
    carregarMTL(mtlString:String) 
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

                    this.materiais[ materialAtual ]["Kd"] = [
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
    }

    /**
    * Função auxiliar que serve para interpretar os comandos de um arquivo OBJ
    * como "o" = objeto, "f" = faces, etc.... 
    */
    _interpretarInstrucaoOBJ( comando=String(), partesLinha:Array<any>=[] )
    {
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

        
        // Se for um Vertice
        if (comando === 'v') {
            const v : Array<float> = [ 
                                        parseFloat(partesLinha[1]), 
                                        parseFloat(partesLinha[2]), 
                                        parseFloat(partesLinha[3]) 
                                    ];

            this.vertices.push(v);

            // Identifica esses vertices como sendo do objeto atual
            this.verticesObjetos[ grupoObjeto ].push( v );
            this.verticesObjetosOnlyNomeParte[ this.objetoAtivo ].push( v );


        // Se for uma Textura de Vertice
        } else if (comando === 'vt') {
            const vt : Array<float> = [ 
                                        parseFloat(partesLinha[1]), 
                                        parseFloat(partesLinha[2]) 
                                    ];

            this.uvs.push(vt);

        // Se for uma Normal do Vertice
        } else if (comando === 'vn') {
            const vn : Array<float> = [ 
                                        parseFloat(partesLinha[1]), 
                                        parseFloat(partesLinha[2]), 
                                        parseFloat(partesLinha[3]) 
                                    ];

            this.normals.push(vn);

        // Se for uma Face
        } else if (comando === 'f') {

            if ( !this.objetos[ grupoObjeto ] ) 
            {
                this.objetos[ grupoObjeto ] = [];
            }

            const face : Array<any> = [];
            for (let j = 1; j < partesLinha.length; j++)
            {
                const itemLinha:string = partesLinha[j].split('/');

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

            //Cadastra o objeto atual no dicionario de vertices objetos
            this.verticesObjetos[ grupoObjeto ]                    = [];
            this.verticesObjetosOnlyNomeParte[ this.objetoAtivo ]  = [];

            // Marca que os vertices desse OBJETO(denominado grupoObjeto) começa no indice numero tal do vetor de vertices global do modelo
            this.verticesComecaObjetos[ grupoObjeto ] = this.vertices.length;

        }
    }

    /**
    * Função que carrega um arquivo .OBJ
    */
    carregarOBJ(objString:string) 
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

        let keyToIndex  = new Mapa<string, any>();
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
                    const v   = face.face[k];
                    const key = v.vi + '/' + v.ti + '/' + v.ni;    // Concatena os valores que vem no .OBJ para usar como chave

                    // Se o indice da chave nao foi cadastrado, salva ele, com posição, cor
                    if ( keyToIndex[key] === undefined ) 
                    {
                        const kdMaterial = this.materiais[face.material]["Kd"] || [1, 1, 1];
                        const posicao    = this.vertices[v.vi] || [0, 0, 0];

                        // Define o indice
                        keyToIndex[key] = indiceAtual++;

                        // Adiciona a cor do material
                        this.cores.push( kdMaterial[0] );
                        this.cores.push( kdMaterial[1] );
                        this.cores.push( kdMaterial[2] );
                        this.cores.push(1);

                        // Adiciona a posição
                        this.positions.push(posicao[0]);
                        this.positions.push(posicao[1]);
                        this.positions.push(posicao[2]);

                        // Adiciona a UV
                        if (v.ti >= 0) {
                            const uv = this.uvs[v.ti];
                            this.uvArray = this.uvArray || [];
                            this.uvArray.push(uv[0]);
                            this.uvArray.push(uv[1]);

                        } else {
                            this.uvArray = this.uvArray || [];
                            this.uvArray.push(0);
                            this.uvArray.push(0);
                        }
                    }

                    indicesFaces.push(keyToIndex[key]);
                }

                for (let k = 1; k < indicesFaces.length - 1; k++) 
                {
                    this.indices.push(indicesFaces[0]);
                    this.indices.push(indicesFaces[k]);
                    this.indices.push(indicesFaces[k + 1]);
                }
            }
        }

        /**
        * Mapeia os indices para cada objeto a ser desenhado,
        * Organiza os buffers de posições, cores, UVs e indices.
        */
        keyToIndex = new Mapa<string, any>();
        indiceAtual = 0;

        this.indices = []; // reseta para montar os índices gerais

        this.objetosInfo = new Mapa<string, any>();     // objeto para guardar offset/count por objeto
        this.iluminationInfo = new Mapa<string, any>(); // Iluminação por objeto dentro desse OBJ, por padrão será iniciado com valores padrão

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

            /**
            * Define a iluminação acumulada do objeto(usada para receber iluminação dinamica de pontos de luz)
            */
            this.iluminationAcumuladaInfo[nomeObjeto] = {
                brilhoLocalAcumulado      : 0,
                ambientLocalAcumulado     : 0,
                diffuseLocalAcumulado     : 0,
                specularLocalAcumulado    : 0,
                corLocalAcumulado         : [0, 0, 0], //RGB
                intensidadeLocalAcumulado : 0
            };  

            for (let j = 0; j < faces.length; j++) 
            {
                const face         = faces[j];
                const indicesFaces = [];

                for (let k = 0; k < face.face.length; k++) 
                {
                    const v   = face.face[k];
                    const key = v.vi + '/' + v.ti + '/' + v.ni;   // Concatena os valores que vem no .OBJ para usar como chave

                    if ( keyToIndex[key] === undefined ) 
                    {
                        const kdMaterial = this.materiais[face.material]["Kd"]  || [1, 1, 1];
                        const posicao    = this.vertices[v.vi]                  || [0, 0, 0];

                        // Define o indice
                        keyToIndex[key] = indiceAtual++;

                        // Define a cor do material
                        this.cores.push( kdMaterial[0]  );
                        this.cores.push( kdMaterial[1]  );
                        this.cores.push( kdMaterial[2]  );
                        this.cores.push(1);

                        // Define a posição
                        this.positions.push(posicao[0]);
                        this.positions.push(posicao[1]);
                        this.positions.push(posicao[2]);

                        // Define a UV
                        if (v.ti >= 0) {
                            const uv = this.uvs[v.ti];
                            this.uvArray = this.uvArray || [];
                            this.uvArray.push(uv[0]);
                            this.uvArray.push(uv[1]);

                        } else {
                            this.uvArray = this.uvArray || [];
                            this.uvArray.push(0);
                            this.uvArray.push(0);
                        }
                    }

                    indicesFaces.push(keyToIndex[key]);
                }

                // triangula a face (assumindo que face.face.length >= 3)
                for (let k = 1; k < indicesFaces.length - 1; k++) 
                {
                    this.indices.push(indicesFaces[0]);
                    this.indices.push(indicesFaces[k]);
                    this.indices.push(indicesFaces[k + 1]);

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
                posicao    : gl.getAttribLocation(programUsado!, baseShaders.vertexExtraInfo.variavelPosicaoCubo),
                cor        : gl.getAttribLocation(programUsado!, baseShaders.vertexExtraInfo.variavelCorCubo),
                uv         : gl.getAttribLocation(programUsado!, baseShaders.vertexExtraInfo.variavelUV),

                // Iluminação
                brilho     : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelBrilho),
                ambient    : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelAmbient),
                diffuse    : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelDiffuse),
                specular   : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelSpecular),
                corLuz     : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelCorLuz),
                intensidadeLuz : gl.getUniformLocation(programUsado!, baseShaders.fragmentExtraInfo.variavelIntensidadeLuz)
                //posicaoLuz     : gl.getUniformLocation(programUsado, baseShaders.fragmentExtraInfo.variavelPosicaoLuz),

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
    atualizarIluminacaoParte(gl:WebGL2RenderingContext, informacoesPrograma:any, iluminacaoParte:any={}, iluminacaoAcumuladaParte:any={} )
    {
        // OBS: AQUI NESSE PONTO, A ILUMINAÇÂO DAS PARTES JA FOI CALCULADA NO LOOP PRINCIPAL, ANTES DE CHAMAR ESSA FUNÇÂO
        // OBS: Se this.useAccumulatedLights for false, aqui nada muda, as variaveis de acumulação só vão estar sempre zeradas

        /**
        * Obtem o ambiente atualizado como a soma dos valores do objeto com os globais da cena
        */
        const ambientParte     = iluminacaoParte.ambientObjeto         + this.renderer.ambient                + iluminacaoAcumuladaParte.ambientLocalAcumulado;
        const diffuseParte     = iluminacaoParte.diffuseObjeto         + this.renderer.diffuse                + iluminacaoAcumuladaParte.diffuseLocalAcumulado;
        const specularParte    = iluminacaoParte.specularObjeto        + this.renderer.specular               + iluminacaoAcumuladaParte.specularLocalAcumulado;
        const brilhoParte      = iluminacaoParte.brilhoObjeto          + this.renderer.brilho                 + iluminacaoAcumuladaParte.brilhoLocalAcumulado;
        const intensidadeParte = iluminacaoParte.intensidadeLuzObjeto  + this.renderer.intensidadeLuz         + iluminacaoAcumuladaParte.intensidadeLocalAcumulado;

        let corLuzParte     = [0, 0, 0];
        corLuzParte[0]      = iluminacaoParte.corLuzObjeto[0] + this.renderer.corAmbient[0] + iluminacaoAcumuladaParte.corLocalAcumulado[0];
        corLuzParte[1]      = iluminacaoParte.corLuzObjeto[1] + this.renderer.corAmbient[1] + iluminacaoAcumuladaParte.corLocalAcumulado[1];
        corLuzParte[2]      = iluminacaoParte.corLuzObjeto[2] + this.renderer.corAmbient[2] + iluminacaoAcumuladaParte.corLocalAcumulado[2];

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

        // Marca que as luzes de todas as partes ja foram atualizadas pela primeira vez
        this._jaAcumulouLuzes = true;
    }

    /**
    * Define a iluminação do objeto como um todo 
    * @override
    */
    setIntireIlumination( iluminationDefinition:any={} )
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

    /**
    * Abaixo criei métodos para permitir obter, pesquisar, e manipular partes do modelo, individualmente, ou em grupo
    */
    getObjetos()
    {
        return this.objetos;
    }

    getPartes()
    {
        return this.objetos;
    }

    getNomesObjetos()
    {
        return this.nomesObjetos;
    }

    getNomesPartes()
    {
        return this.nomesObjetos;
    }

    getParteByIndex( index=0 )
    {
        return this.objetos[ this.nomesObjetos[ index ] ];
    }

    getParteByName( nomeParte:string )
    {
        return this.objetos[ nomeParte ];
    }

    /**
    * Obtem um objeto/parte que contenha nomeParte em seu nome, ou algum outro critério
    */
    queryPartes( criterio="nome", 
                 operador="like", 
                 valorPesquisar="" 
    ){
        const partes      = []; // Com referencia(Array de ponteiros)
        const nomesPartes = []; // Se precisar 

        for( let i = 0 ; i < this.nomesObjetos.length ; i++ )
        {
            const nomeParte        = this.nomesObjetos[i];
            const referenciaParte  = this.objetos[ nomeParte ];

            // Pesquisar por nome das partes/objetos
            if( criterio == "nome" )
            {
                let encontrouNome = false;
                if( operador == "like"  ){ encontrouNome = String(nomeParte).toLowerCase().indexOf( String( valorPesquisar ).toLowerCase() ) != -1 };
                if( operador == "equal" ){ encontrouNome = String(nomeParte).toLowerCase() == String( valorPesquisar ).toLowerCase() };

                if( encontrouNome == true )
                {   
                    partes.push( referenciaParte );
                    nomesPartes.push(nomeParte);
                }
            }

            if( criterio == "material" )
            {
                let parteTemMaterial = false;

                for( let j = 0 ; j < referenciaParte.length ; j++ )
                {
                    const pedacoParte  = referenciaParte[j];
                    const nomeMaterial = pedacoParte.material;

                    let encontrouNomeMaterial = false;
                    if( operador == "like"  ){ encontrouNomeMaterial = String(nomeMaterial).toLowerCase().indexOf( String( valorPesquisar ).toLowerCase() ) != -1 };
                    if( operador == "equal" ){ encontrouNomeMaterial = String(nomeMaterial).toLowerCase() == String( valorPesquisar ).toLowerCase() };

                    if( encontrouNomeMaterial == true )
                    {   
                        parteTemMaterial = true;
                        break;
                    }
                }

                if( parteTemMaterial == true )
                {
                    partes.push( referenciaParte );
                    nomesPartes.push(nomeParte);
                }
            }
        }

        return partes;
    }

    /**
    * Obtem todos so vertices de uma parte especifica, extraidos do vetor de vertices do OBJ
    */
    getVerticesParte( nomeParte:string )
    {
        return {
            inicio   : this.verticesComecaObjetos[nomeParte],
            vertices : this.verticesObjetos[ nomeParte ]
        };
    }

    /**
    * Calcula as posições X, Y e Z do centro de uma parte especifica desse OBJ
    * Pra isso, basta calcular a média de X, Y e Z
    * 
    * Passos que dei:
    *  (1) Somar X, Y e Z de todos os vertices, fazendo uma acumulação
    *  (2) Dividir pela quantidade de vertices
    */
    calcularCentroideParte( nomeParte:string )
    {
        let qtdeVerticesParte       = 0;
        let verticesParte           = new Array<Array<any>>;

        // Se for apenas um vertice
        if( this.nomesObjetos.length == 1 )
        {
            verticesParte = this.verticesObjetos[ Object.keys(this.verticesObjetos)[0] ];
            qtdeVerticesParte = verticesParte.length;

        }else{

            // se existe literalmente NOME__MATERIAL
            if( this.verticesObjetos[ nomeParte ] != null ) {
                verticesParte = this.verticesObjetos[ nomeParte ];
                qtdeVerticesParte = verticesParte.length;

            // Se não existe literamente NOME__GRUPO, então despreza o material e pega só o nome
            }else{
                const apenasNomeObjetoSemMaterial = nomeParte.split('__')[0];
                verticesParte = this.verticesObjetosOnlyNomeParte[ apenasNomeObjetoSemMaterial ];
                qtdeVerticesParte = verticesParte.length;
            }
        }

        let totalVertices = qtdeVerticesParte;
        let xSomado       = 0;
        let ySomado       = 0;
        let zSomado       = 0; 
    
        for ( let i = 0 ; i < totalVertices ; i++ ) 
        {
            const verticeAtual = verticesParte[i];

            xSomado += verticeAtual[0];
            ySomado += verticeAtual[1];
            zSomado += verticeAtual[2];
        }

        let xCentro = xSomado / totalVertices;
        let yCentro = ySomado / totalVertices;
        let zCentro = zSomado / totalVertices;

        return [xCentro, yCentro, zCentro];
    }

    /**
    * Obtem a posição global XYZ de uma parte especifica desse OBJ
    * 
    * FORMULA MATEMATICA:
    *    posicaoGlobalParte = matrixModeloObjetoVisual * posicaoLocalParte
    */
    calcularCentroideGlobalParte( nomeParte:string )
    {
        const matrixModeloObjetoVisual = this.modeloObjetoVisual;
        const centroLocalParte         = this.calcularCentroideParte( nomeParte );

        const centroLocalParte4        = [ 
                                           centroLocalParte[0], 
                                           centroLocalParte[1], 
                                           centroLocalParte[2], 
                                           1 
                                         ]; // o 1 é constante para posições
    
        const posicaoGlobalParte       = MultiplicarMatrix4x4PorVetor4( matrixModeloObjetoVisual!, centroLocalParte4 );

        return posicaoGlobalParte;
    }

    /**
    * Traz todos os vertices que estão dentro de um range de coordenadas
    */
    queryVerticesCoordenadas( minXYZ=Array(), maxXYZ=Array(), expansion=1, trazerNomeParte=true )
    {
        // Min Max X
        const minX = minXYZ[0] * expansion;
        const maxX = maxXYZ[0] * expansion;

        // Min Max Y
        const minY = minXYZ[1] * expansion;
        const maxY = maxXYZ[1] * expansion;

        // Min Max Z
        const minZ = minXYZ[2] * expansion;
        const maxZ = maxXYZ[2] * expansion;


        // detalhes dos vertices
        const verticesInfo = [];

        /**
        * Cada vértice ocupa 3 posições na memoria (X, Y, Z)
        * Exemplo:
        * índice 0 => vértice 0
        * índice 1 => vértice 1
        * índice 2 => vértice 2
        * 
        * Então, pra saber as coordenadas exatas do vertice, basta ler esse Array. Elas são as posições.
        * Portanto, cada vertice tem 3 elementos: X, Y e Z, como ja disse, e que são coodenadas. E são justamente as coordenadas que posicionam cada pedacinho do modelo a onde ele está sendo visto.
        *
        * É como se cada vértice fosse um prego com um endereço 3D (X, Y, Z).
        * Esses pregos dizem onde estão os cantos das superfícies do modelo.
        * O WebGL liga esses pregos formando faces e triângulos, criando o modelo visual. 
        */
        const totalVertices = this.vertices.length;

        for( let i = 0 ; i < totalVertices ; i++ )
        {
            const verticeAtual       = this.vertices[ i ];
            const indiceVertice      = i;
            const xVertice           = verticeAtual[ 0 ];
            const yVertice           = verticeAtual[ 1 ];
            const zVertice           = verticeAtual[ 2 ];

            // Se o vertice atual da parte atual estiver dentro da zona de busca
            if( 
                true    
                && ( xVertice >= minX && xVertice < maxX )
                && ( yVertice >= minY && yVertice < maxY )
                && ( zVertice >= minZ && yVertice < maxZ )
            ){
                let nomeParteVertice = "NENHUMA";

                if( trazerNomeParte == true )
                {
                    // Descobre o nome da parte associada ao tal vertice
                    // Para cada uma das partes
                    /*
                    for( let j = 0 ; j < this.nomesObjetos.length ; j++ )
                    {
                        const nomeParte       = this.nomesObjetos[j];
                        const referenciaParte = this.objetos[ nomeParte ];
                        const indiceComecaVerticesDaParte = this.verticesComecaObjetos[ nomeParte ];

                        if( this.verticesObjetos[ nomeParte ] != null )
                        {
                            // Se o vertice atual pertence a essa parte em questão
                            if( indiceVertice >= indiceComecaVerticesDaParte &&
                                this.vertices[ indiceComecaVerticesDaParte ][ 0 ] == xVertice &&
                                this.vertices[ indiceComecaVerticesDaParte ][ 1 ] == yVertice &&
                                this.vertices[ indiceComecaVerticesDaParte ][ 2 ] == zVertice
                            ){
                                nomeParteVertice = nomeParte;
                                break;
                            }
                        }
                    }
                    */
                }

                verticesInfo.push({
                    vertice       : verticeAtual,    // Os valores X, Y e Z do vertice
                    indiceVertice : indiceVertice,   // O indice do vertice no array de vertices,
                    nomeParte     : nomeParteVertice // O nome da parte do modelo a qual este vertice pertence
                });
            }   
        }

        return verticesInfo;
    }   

    /**
    * Traz todas as partes do modelo que estão dentro de um range de coordenadas
    * Pra isso, descobre em quais coordenadas locais do objeto essas partes estão, comparando as posições dos vertices, pra ver se essas posições dos vertices estão dentro da zona de busca
    * 
    * EXEMPLOS:
    * renderizador.getObjetos()[11].queryPartesCoordenadas( [0,-1,-1], [1,0,1], 1 )
    * renderizador.getObjetos()[11].queryPartesCoordenadas( [0,0,0], [1,1,1], 1 )
    * 
    */
    queryPartesCoordenadas( minXYZ=Array(), maxXYZ=Array(), expansion=1 )
    {
        // Min Max X
        const minX = minXYZ[0] * expansion;
        const maxX = maxXYZ[0] * expansion;

        // Min Max Y
        const minY = minXYZ[1] * expansion;
        const maxY = maxXYZ[1] * expansion;

        // Min Max Z
        const minZ = minXYZ[2] * expansion;
        const maxZ = maxXYZ[2] * expansion;


        const partes = []; // Array de ponteiros

        // Para cada uma das partes
        for( let i = 0 ; i < this.nomesObjetos.length ; i++ )
        {
            const nomeParte       = this.nomesObjetos[i];
            const referenciaParte = this.objetos[ nomeParte ];

            // Se a parte não tem seu vertice cadastrado, ignora
            if( this.verticesComecaObjetos[ nomeParte ] != null )
            {   
                
                /**
                * Cada vértice ocupa 3 posições na memoria (X, Y, Z)
                * Exemplo:
                * índice 0 => vértice 0
                * índice 1 => vértice 1
                * índice 2 => vértice 2
                * 
                * Então, pra saber as coordenadas exatas do vertice, basta ler esse Array. Elas são as posições.
                * Portanto, cada vertice tem 3 elementos: X, Y e Z, como ja disse, e que são coodenadas. E são justamente as coordenadas que posicionam cada pedacinho do modelo a onde ele está sendo visto.
                *
                * É como se cada vértice fosse um prego com um endereço 3D (X, Y, Z).
                * Esses pregos dizem onde estão os cantos das superfícies do modelo.
                * O WebGL liga esses pregos formando faces e triângulos, criando o modelo visual. 
                */

                /**
                * Abaixo eu pego o indice/numero que marca o inicio dos vertices da parte atual na memoria(dentro do array vertices geral do modelo)
                */
                const indiceComecaVerticesDaParte = this.verticesComecaObjetos[ nomeParte ];
                const verticesParte               = this.verticesObjetos[ nomeParte ];
                const totalVerticesParte          = verticesParte.length;

                const indiceInicialVerticesParte  = indiceComecaVerticesDaParte;
                const indiceFinalVerticesParte    = indiceComecaVerticesDaParte + totalVerticesParte;

                // Para cada vertice da parte
                let parteEstaNaZona   = false;

                for( let j = 0 ; j < totalVerticesParte ; j++ )
                {
                    const verticeAtual_Parte = verticesParte[ j ];
                    const xVertice           = verticeAtual_Parte[ 0 ];
                    const yVertice           = verticeAtual_Parte[ 1 ];
                    const zVertice           = verticeAtual_Parte[ 2 ];

                    // Se o vertice atual da parte atual estiver dentro da zona de busca
                    if(    
                        ( xVertice >= minX && xVertice < maxX )
                        && ( yVertice >= minY && yVertice < maxY )
                        && ( zVertice >= minZ && yVertice < maxZ )
                    ){
                        parteEstaNaZona = true;
                        break;
                    }   
                }

                if( parteEstaNaZona == true )
                {
                    partes.push( [referenciaParte, nomeParte] );
                }
            }

        }

        return partes;

        // TERMINAR

    }

    /**
    * Causa uma deformação em alguma parte do modelo, igual no CuboDeformavelMesh.js
    */
    deformarVerticePorProximidade(xAlvo:number, yAlvo:number, zAlvo:number, raio:number, intensidade:number) 
    {
        const vertices = this.getPositions();

        for (let i = 0; i < vertices.length; i += 3) 
        {
            const dx = vertices[i]     - xAlvo;
            const dy = vertices[i + 1] - yAlvo;
            const dz = vertices[i + 2] - zAlvo;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < raio && dist > 0.00001) 
            {
                const fator = Math.cos((dist / raio) * Math.PI) * intensidade;
                vertices[i]     += (dx / dist) * fator;
                vertices[i + 1] += (dy / dist) * fator;
                vertices[i + 2] += (dz / dist) * fator;
            }
        }

        const gl = this.getRenderer().gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
    }

    desenhar() 
    {
        const renderer            = this.getRenderer();
        const gl                  = renderer.gl;
        const programUsado        = this.getProgram();
        const isTransparente      = this.isTransparente();
        const indices             = this.getIndices();
        const informacoesPrograma = this.getInformacoesPrograma();
        const luzesCena            = renderer.getLuzes();

        // Atributos visuais 
        const meshConfig = this.meshConfig;
        const position   = meshConfig.position;
        const rotation   = meshConfig.rotation;
        const scale      = meshConfig.scale;

        // Copia os valores do renderer que o objeto acompanha
        this.copiarValoresRenderer();

        this.modeloObjetoVisual = CriarMatrix4x4();

        this.modeloObjetoVisual     = DefinirTranslacao(this.modeloObjetoVisual, [position.x, position.y, position.z]);

        this.modeloObjetoVisual     = RotacionarX(this.modeloObjetoVisual, rotation.x);
        this.modeloObjetoVisual     = RotacionarY(this.modeloObjetoVisual, rotation.y);
        this.modeloObjetoVisual     = RotacionarZ(this.modeloObjetoVisual, rotation.z);

        this.modeloObjetoVisual     = DefinirEscala(this.modeloObjetoVisual, [scale.x, scale.y, scale.z]);

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
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, this.modeloObjetoVisual);

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

            /**
            * Se esse objeto usa iluminação por cada sub-objeto
            * Ou seja, Calcula o recebimento de todas as luzes que afeta todas as partes desse objeto 
            * Nesse caso, eu programei um código por parte. Ou seja, cada parte vai executar esse código abaixo:
            */
            if( this.childrenIndividualLights == true && this.alwaysUpdateLights == true )
            {
                const iluminacaoParte           = this.iluminationInfo[ nomeObjeto ];
                const iluminacaoAcumuladaParte  = this.iluminationAcumuladaInfo[ nomeObjeto ];

                /**
                * Calcula a iluminação dessa parte atual ( se esse OBJ usa acumulação de luzes )
                */
                if( this.useAccumulatedLights == true )
                {

                    /** NOVA REGRA: 
                    *      Se ele usa acumulação estatica(que acumula apenas uma unica vez), então essa condição não vai permitir que o loop continue
                    *      EXCETO, se staticAccumulatedLights for false, que ai ele passa direto e não interrompe nada por que o recurso está desativado
                    */
                    if( 
                        (this.staticAccumulatedLights == false) ||                                 // Se não usa o recurso passa direto
                        (this.staticAccumulatedLights == true && this._jaAcumulouLuzes == false)   // se usa, e ja acumulou, então não faz mais

                    ){
                        const posicaoCentroParte        = this.calcularCentroideGlobalParte( nomeObjeto );

                        iluminacaoAcumuladaParte.brilhoLocalAcumulado          = 0;
                        iluminacaoAcumuladaParte.ambientLocalAcumulado         = 0;
                        iluminacaoAcumuladaParte.diffuseLocalAcumulado         = 0;
                        iluminacaoAcumuladaParte.specularLocalAcumulado        = 0;
                        iluminacaoAcumuladaParte.corLocalAcumulado             = [0,0,0];
                        iluminacaoAcumuladaParte.intensidadeLocalAcumulado     = 0;

                        /**
                        * Calcula o recebimento de todas as luzes que afeta essa parte 
                        */
                        for( let j = 0 ; j < luzesCena.length ; j++ )
                        {
                            // Calcula a força da luz em relação a posição do objeto atual(do primeiro laço FOR)
                            const luz               = luzesCena[j];
                            const interferenciaLuz  = luz.calcularInterferencia( posicaoCentroParte );

                            const forcaLuz               =  interferenciaLuz[0];
                            const influenciaBrilho       =  interferenciaLuz[1];
                            const influenciaAmbient      =  interferenciaLuz[2];
                            const influenciaDiffuse      =  interferenciaLuz[3];
                            const influenciaSpecular     =  interferenciaLuz[4];
                            const influenciaIntensidade  =  interferenciaLuz[5];

                            // Cores
                            const influenciaVermelho     =  interferenciaLuz[6];
                            const influenciaVerde        =  interferenciaLuz[7];
                            const influenciaAzul         =  interferenciaLuz[8];
                            
                            // Quanto mais perto estiver da luz, mais a luz vai afetar o objeto
                            iluminacaoAcumuladaParte.brilhoLocalAcumulado         += influenciaBrilho;
                            iluminacaoAcumuladaParte.ambientLocalAcumulado        += influenciaAmbient;
                            iluminacaoAcumuladaParte.diffuseLocalAcumulado        += influenciaDiffuse;
                            iluminacaoAcumuladaParte.specularLocalAcumulado       += influenciaSpecular;
                            iluminacaoAcumuladaParte.intensidadeLocalAcumulado    += influenciaIntensidade;

                            // As luzes mais proximas terão tambem mais influencia na cor
                            iluminacaoAcumuladaParte.corLocalAcumulado[0]         += influenciaVermelho;
                            iluminacaoAcumuladaParte.corLocalAcumulado[1]         += influenciaVerde;
                            iluminacaoAcumuladaParte.corLocalAcumulado[2]         += influenciaAzul;
                        }
                    }
                }

                // Depois de calcular, atualiza a iluminação
                this.atualizarIluminacaoParte( gl, 
                                               informacoesPrograma, 
                                               iluminacaoParte, 
                                               iluminacaoAcumuladaParte 
                                             );
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
            if( this.childrenIndividualLights == false && this.alwaysUpdateLights == true )
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
