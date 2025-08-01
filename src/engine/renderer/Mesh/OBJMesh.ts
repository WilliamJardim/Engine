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
import { createBuffer, carregarTextura } from '../../utils/render_engine/funcoesBase.js';
import { baseShaders } from '../Shaders/Base.js';
import { 
    CriarMatrix4x4,
    MultiplicarMatrix4x4PorVetor4,
    DefinirTranslacao,
    DefinirEscala,
    RotacionarX,
    RotacionarY,
    RotacionarZ
} from '../../utils/render_engine/math.js';
import { Renderer } from "../Renderer/Renderer.js";
import { float, int, Ponteiro } from "../../types/types-cpp-like.js";
import Mapa from "../../utils/dicionarios/Mapa.js";
import OBJMeshConfig from "../../interfaces/render_engine/OBJMeshConfig.js";
import InformacoesPrograma from "../../interfaces/render_engine/InformacoesPrograma.js";
import IluminacaoTotalParte from "../../interfaces/render_engine/IluminacaoTotalParte.js";
import IluminacaoGeralOBJMesh from "../../interfaces/render_engine/IluminacaoGeralParte.js";
import { Matrix } from "../../types/matrix.js";
import ContagemIndicesParteOBJ from "../../interfaces/render_engine/ContagemIndicesParteOBJ";
import FaceObjeto, { VerticesFace } from "../../interfaces/render_engine/FaceObjeto.js";
import VisualMeshConfig from "../../interfaces/render_engine/VisualMeshConfig.js";
import Position3D from "../../interfaces/main_engine/Position3D.js";
import IluminacaoGeralParte from "../../interfaces/render_engine/IluminacaoGeralParte.js";
import VerticesParteOBJ from "../../interfaces/render_engine/VerticesParteOBJ.js";

/**
* PORTABILIDADE PRA C++:
* 
* Classe baseada no VisualMesh. Tem todos os atributos e métodos que VisualMesh tem.
* Porém implementa os métodos abstratos do VisualMesh que devem implementados por cada objeto
*
* Faz uso do "renderer" umas 11 vezes, exatamente com a mesma finalidade que o VisualMesh usa,
* apenas pra obter informações pra criar a iluminação, e obter outras coisas que o "renderer" fornece
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
    public mtlString          : string;
    public objString          : string;
    
    // ATRIBUTOS MOTIVOS PARA O VisualMesh, para melhor generalização de código
        //public _isTransparente    : boolean;
        //public vertices           : Array<Array<float>>;
        //public bufferUV           : Ponteiro<WebGLBuffer>;
        //public uvs                : Array<Array<float>>;
        //public uvArray            : Array<float>;
        //public normals            : Array<Array<float>>;
        //public positions          : Array<float>;
        //public indices            : Array<float>;
        //public cores              : Array<float>;
        //public allBuffersCriated  : boolean;
        //public materiais          : Mapa<string, any>;
        //public materialAtivo      : any;
        //public objetos            : Mapa<string, any>;
        //public objetoAtivo        : any;
        //public nomesObjetos       : Array<string>;
        //public objetosInfo                   : Mapa<string, any>;
        //public iluminationInfo               : Mapa<string, any>;
        //public iluminationAcumuladaInfo      : Mapa<string, any>;
        // Mais variaveis para a acumulação de luzes
        //public brilhoParte       : number;
        //public ambientParte      : number;
        //public diffuseParte      : number;
        //public specularParte     : number;
        //public corLuzParte       : Array<float>;
        //public intensidadeParte  : number;

    public verticesObjetos               : Mapa<string, Matrix<float> >;   // Vertices por partes
    public verticesObjetosOnlyNomeParte  : Mapa<string, Matrix<float> >;   // Vertices por partes (somente o nome da parte sem usar material na chave)
    public verticesComecaObjetos         : Mapa<string, Matrix<float> >;   // Length que começa os vertices de cada objeto no vetor geral vertices(o vetor declarado no VisualMesh)
    public qtdePartes                    : int; // Quantas partes esse OBJMesh possui

    constructor(renderer:Renderer, propriedadesMesh:VisualMeshConfig)
    {
        super(renderer, propriedadesMesh);

        this.tipo              = "OBJ";

        // Quantas partes esse OBJMesh possui
        this.qtdePartes        = 0; // Vai ser calculado depois

        // Diz se o objeto é uma superficie plana ou não
        this.isPlano           = false;
        this.usaTexturas       = true; // Obrigatório para que tenha textura
        this.usaUV             = true; // Obrigatório para que tenha textura no modelo 3d

        this.mtlString         = propriedadesMesh.mtlString;
        this.objString         = propriedadesMesh.objString; 

        // ATRIBUTOS MOTIVOS PARA O VisualMesh, para melhor generalização de código
            //this._isTransparente   = false;
            //this.vertices          = new Array();
            //this.uvs               = new Array();
            //this.uvArray           = new Array<float>();
            //this.normals           = new Array();
            //this.positions         = new Array();
            //this.indices           = new Array();
            //this.cores             = new Array();
            //this.bufferPosicao     = null;
            //this.bufferCor         = null;
            //this.bufferIndices     = null;
            //this.bufferUV          = null;
            //this.allBuffersCriated = false;
            //this.materiais         = new Mapa<string, any>();
            //this.materialAtivo     = null;
            //this.objetos                       = new Mapa<string, any>();
            //this.nomesObjetos                  = new Array(); 
            //this.objetoAtivo                   = null;
            //this.objetosInfo                   = new Mapa<string, any>();

            //this.childrenIndividualLights = propriedadesMesh.childrenIndividualLights;   // Se cada parte vai usar iluminação
            //this.useAccumulatedLights     = propriedadesMesh.useAccumulatedLights;       // Se cada parte vai receber uma acumulação de luzes ao seu redor
            //this.staticAccumulatedLights  = propriedadesMesh.staticAccumulatedLights;    // Se ativado, a acumulação das luzes ao redor das partes só vai ocorrer uma unica vez
            //this._jaAcumulouLuzes         = false;                                       // Caso "staticAccumulatedLights" seja true, essa variavel de controle "_jaAcumulouLuzes" vai ser usada para interromper o loop de atualização das luzes

            // Mais variaveis para a acumulação de luzes
            //this.brilhoParte       = 0;
            //this.ambientParte      = 0;
            //this.diffuseParte      = 0;
            //this.specularParte     = 0;
            //this.corLuzParte       = [0, 0, 0];
            //this.intensidadeParte  = 0;

            //this.iluminationInfo          = new Mapa<string, any>();  // A iluminação de cada objeto individualmente(usada quanto childrenIndividualLights for true)
            //this.iluminationAcumuladaInfo = new Mapa<string, any>();  // A iluminação acumulada de cada objeto individualmente(usada quanto childrenIndividualLights for true)

        this.verticesObjetos               = new Mapa<string, Matrix<float> >();   // Vertices por partes
        this.verticesObjetosOnlyNomeParte  = new Mapa<string, Matrix<float> >();   // Vertices por partes (somente o nome da parte sem usar material na chave)
        this.verticesComecaObjetos         = new Mapa<string, Matrix<float> >();   // Length que começa os vertices de cada objeto no vetor geral vertices(o vetor declarado no VisualMesh)

        // Variaveis de renderização
        this.modeloObjetoVisual = CriarMatrix4x4();

        //this.setProgram( renderer.getOBJProgram() );

        // (1) - Ler o arquivo MTL que contém os materiais e links para as texturas usadas
        this.carregarMTL( this.mtlString );

        // (2) - Ler o arquivo OBJ que contem a malha em si: os vertices, polignos, faces, etc...
        this.carregarOBJ( this.objString );

        // (3) - Criar o OBJ na memoria com seus buffers, etc...
        this.criar();
    }

    // Ativa a iluminação individual de cada parte individual do OBJ
    enableChildrenIndividualLights() : void
    {   
        this.childrenIndividualLights = true;
    }

    // Desativa a iluminação individual de cada parte individual do OBJ
    disableChildrenIndividualLights() : void
    {
        this.childrenIndividualLights = false;
    }

    // Ativa a acumulação de luzes em cada parte individual do OBJ
    enableAccumulatedLights() : void
    {
        this.useAccumulatedLights = true;
    }

    // Disativa a acumulação de luzes em cada parte individual do OBJ
    disableAccumulatedLights() : void
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
    carregarMTL(mtlString:String) : void
    {
        let linhas         : Array<string>   = mtlString.split("\n");
        let qtdeLinhas     : int             = linhas.length;
        
        // o material atual é o material que está sendo carregado com suas informações
        let materialAtual : string = "NENHUM_MATERIAL";

        for( let i:int = 0; i < qtdeLinhas; i++ ) 
        {
            let linha          : string    = linhas[i].trim();
            let consideraLinha : boolean   = true; // Se a linha atual vai ser lida ou não(por padrão sim, exceto pelas regras de excesão)

            // Se for uma linha em branco, ignora
            if( linha.length == 0 )
            { 
                consideraLinha = false;
            }

            // Se for um comentário, ignora
            if( linha[0] == "#" )
            {
                consideraLinha = false;
            }

            // Se a linha é valida para ser interpretada, segue
            if( consideraLinha == true )
            {
                // Declara um novo material
                if( linha.indexOf("newmtl") == 0 ){
                    const itensLinha : Array<string> = linha.split(/\s+/);

                    materialAtual = itensLinha[1];
                    this.materiais[ materialAtual ] = { 
                                                        nome   : materialAtual, 
                                                        Kd     : [1, 1, 1], 
                                                        map_Kd : null 
                                                    };

                // Se o current for null              
                }else if( materialAtual != "NENHUM_MATERIAL" ){
                    
                    // Se tiver transparencia
                    if( linha.startsWith("d") ) 
                    {
                        this.materiais[ materialAtual ].opacity = parseFloat(linha.split(/\s+/)[1]);
                        this._isTransparente = true; // Diz pra Engine que este objeto tem transparencia
                    }
                    
                    // Determina qual a cor do materal
                    if( linha.indexOf("Kd") == 0 ){
                        const itensLinha = linha.split(/\s+/);

                        this.materiais[ materialAtual ]["Kd"] = [
                            parseFloat( itensLinha[1] ),
                            parseFloat( itensLinha[2] ),
                            parseFloat( itensLinha[3] )
                        ];
                    
                    // Determina qual a imagem(imagem de textura) que o material usa
                    }else if( linha.indexOf("map_Kd") == 0 ){
                        const itensLinha   = linha.split(/\s+/);
                        const textureFile  = itensLinha[1];
                        const textureWebGL = this.getRenderer().carregarTextura(textureFile);

                        this.materiais[ materialAtual ].map_Kd = textureWebGL;
                    }
                }
            }
        }
    }

    /**
    * Função auxiliar que serve para interpretar os comandos de um arquivo OBJ
    * como "o" = objeto, "f" = faces, etc.... 
    */
    _interpretarInstrucaoOBJ( comando=String(), partesLinha:Array<string>=[] ): void
    {
        // Se nao tem objeto ativo
        if( this.objetoAtivo == "NENHUM_OBJETO" ) 
        {
            this.objetoAtivo = "objetoPadrao";
        }

        // Se nao tem material ativo
        if( this.materialAtivo == "NENHUM_MATERIAL" ) 
        {
            this.materialAtivo = "materialPadrao";
        }

        // Agrupa por objeto + material
        const grupoObjeto = String( this.objetoAtivo ) + "__" + String( this.materialAtivo );

        // Se for um Vertice
        if( comando === "v" ){
            const verticeAtual : Array<float> = [ 
                                                parseFloat(partesLinha[1]), 
                                                parseFloat(partesLinha[2]), 
                                                parseFloat(partesLinha[3]) 
                                              ];

            this.vertices.push( verticeAtual );

            // Identifica esses vertices como sendo do objeto atual
            this.verticesObjetos[ grupoObjeto ].push( verticeAtual );
            this.verticesObjetosOnlyNomeParte[ this.objetoAtivo ].push( verticeAtual );


        // Se for uma Textura de Vertice
        }else if( comando === "vt" ){
            const verticeTextura_Atual : Array<float> = [ 
                                                          parseFloat(partesLinha[1]), 
                                                          parseFloat(partesLinha[2]) 
                                                       ];

            this.uvs.push( verticeTextura_Atual );

        // Se for uma Normal do Vertice
        }else if( comando === "vn" ){
            const verticeNormal_Atual : Array<float> = [ 
                                                        parseFloat(partesLinha[1]), 
                                                        parseFloat(partesLinha[2]), 
                                                        parseFloat(partesLinha[3]) 
                                                       ];

            this.normals.push( verticeNormal_Atual );

        // Se for uma Face
        }else if( comando === "f" ){

            if( this.objetos[ grupoObjeto ] == null ) 
            {
                this.objetos[ grupoObjeto ] = new Array();
            }

            const dadosFace : Array<VerticesFace>  = new Array();

            for( let j:int = 1; j < partesLinha.length; j++ )
            {
                const linhaEmPartes:Array<string> = partesLinha[j].split("/");

                dadosFace.push({
                    indiceVertice : parseInt(linhaEmPartes[0], 10) - 1,                            // Indice do vértice
                    indiceTextura : linhaEmPartes[1] ? parseInt(linhaEmPartes[1], 10) - 1 : -1,    // Indice da textura
                    indiceNormal  : linhaEmPartes[2] ? parseInt(linhaEmPartes[2], 10) - 1 : -1     // Indice da normal
                });
            }
            
            this.objetos[ grupoObjeto ].push({
                dadosFace    : dadosFace,
                nomeMaterial : this.materialAtivo
            });

        // Diz qual material esta sendo usado
        }else if( comando === "usemtl" ){
            this.materialAtivo = partesLinha[1];

        // Definicao de um sub-objeto
        }else if( comando === "o" ){
            this.objetoAtivo = partesLinha[1];

            // Se nao tem objeto ativo
            if( this.objetoAtivo == "NENHUM_OBJETO" ) 
            {
                this.objetoAtivo = "objetoPadrao";
            }

            // Se nao tem material ativo
            if( this.materialAtivo == "NENHUM_MATERIAL" ) 
            {
                this.materialAtivo = "materialPadrao";
            }

            // Agrupa por objeto + material
            const grupoObjeto = String( this.objetoAtivo ) + "__" + String( this.materialAtivo );

            //Cadastra o objeto atual no dicionario de vertices objetos
            this.verticesObjetos[ grupoObjeto ]                    = new Array<float>();
            this.verticesObjetosOnlyNomeParte[ this.objetoAtivo ]  = new Array<float>();

            // Marca que os vertices desse OBJETO(denominado grupoObjeto) começa no indice numero tal do vetor de vertices global do modelo
            this.verticesComecaObjetos[ grupoObjeto ] = this.vertices.length;

        }
    }

    /**
    * Função que carrega um arquivo .OBJ
    */
    carregarOBJ(objString:string) 
    {
        let linhas         : Array<string>  = objString.split("\n");
        let qtdeLinhas     : int            = linhas.length;
        
        for( let i:int = 0; i < qtdeLinhas; i++ )
        {
            let linha          : string    = linhas[i].trim();
            let consideraLinha : boolean   = true; // Se a linha atual vai ser lida ou não(por padrão sim, exceto pelas regras de excesão)

            // Se for uma linha em branco, ignora
            if( linha.length == 0 )
            {
                consideraLinha = false;
            }

            // Se for um comentário, ignora
            if( linha[0] == "#" )
            {
                consideraLinha = false;
            }

            // Se a linha é valida para ser interpretada, segue
            if( consideraLinha == true )
            {
                // (1) - Divide a linha em palavras separadas(uma lista de palavras)
                // (2) - Extrai apenas o comando(que é sempre o primeiro elemento da lista de palavras acima)
                const partes  : Array<string>  = linha.split(/\s+/);
                const comando : string         = partes[0];

                // (3) - Interpreta o comando atual
                this._interpretarInstrucaoOBJ( comando, partes );
            }
        }

        const nomesPartes : Array<string> = Object.keys( this.objetos );
        const qtdePartes  : int           = nomesPartes.length;

        // Obtem os nomes dos objetos
        this.nomesObjetos = nomesPartes;
        this.qtdePartes   = qtdePartes;

        let mapaIndicesVertices  : Mapa<string, int>  = new Mapa<string, int>();
        let indiceAtual          : int = 0;

        for( let i:int = 0; i < qtdePartes; i++ ) 
        {
            const nomeParte      : string              = nomesPartes[ i ];
            const facesParte     : Array<FaceObjeto>   = this.objetos[ nomeParte ];
            const qtdeFacesParte : int                 = facesParte.length;

            for( let j:int = 0; j < qtdeFacesParte; j++ ) 
            {
                const faceAtual              : FaceObjeto           = facesParte[j];
                const dadosFaceAtual         : Array<VerticesFace>  = faceAtual.dadosFace;
                const qtdeVerticesFaceAtual  : int                  = dadosFaceAtual.length;
                const indicesFaces           : Array<float>         = new Array();

                for( let k:int = 0; k < qtdeVerticesFaceAtual; k++ ) 
                {
                    const verticeAtual   : VerticesFace  = faceAtual.dadosFace[k];
                    const keyVertice     : string        = String(verticeAtual.indiceVertice) + "/" + String(verticeAtual.indiceTextura) + "/" + String(verticeAtual.indiceNormal);    // Concatena os valores que vem no .OBJ para usar como chave

                    // Se o indice da chave nao foi cadastrado, salva ele, com posição, cor
                    if( mapaIndicesVertices[ keyVertice ] === undefined ) 
                    {
                        const kdMaterial : Array<float>  = this.materiais[faceAtual.nomeMaterial]["Kd"] || [1, 1, 1];
                        const posicao    : Array<float>  = this.vertices[verticeAtual.indiceVertice]    || [0, 0, 0];

                        // Define o indice
                        mapaIndicesVertices[ keyVertice ] = indiceAtual++;

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
                        if( verticeAtual.indiceTextura >= 0 ){
                            const uv = this.uvs[verticeAtual.indiceTextura];
                            this.uvArray = this.uvArray;
                            this.uvArray.push(uv[0]);
                            this.uvArray.push(uv[1]);

                        }else{
                            this.uvArray = this.uvArray;
                            this.uvArray.push(0);
                            this.uvArray.push(0);
                        }
                    }

                    indicesFaces.push( mapaIndicesVertices[ keyVertice ] );
                }

                for( let k:int = 1; k < indicesFaces.length - 1; k++ ) 
                {
                    this.indices.push( indicesFaces[0]     );
                    this.indices.push( indicesFaces[k]     );
                    this.indices.push( indicesFaces[k + 1] );
                }
            }
        }

        /**
        * Mapeia os indices para cada objeto a ser desenhado,
        * Organiza os buffers de posições, cores, UVs e indices.
        */
        mapaIndicesVertices = new Mapa<string, int>();
        indiceAtual = 0;

        this.indices = []; // reseta para montar os índices gerais

        this.objetosInfo       = new Mapa<string, ContagemIndicesParteOBJ>();              // objeto para guardar offset/count dos indices de cada parte do objeto
        this.iluminationInfo   = new Mapa<string, IluminacaoGeralOBJMesh>();   // Iluminação por objeto dentro desse OBJ, por padrão será iniciado com valores padrão
        this.iluminationTotal  = new Mapa<string, IluminacaoTotalParte>();     // A iluminação total de cada objeto individualmente(ou seja, que a soma da iluminação do propio objeto em si, com a iluminação global do meu mini renderizador, e com a iluminação local acumulada de todas as luzes proximas ao objeto, e com isso temos o que chamei de iluminação total da parte/objeto)

        let qtdeIndicesGlobais = 0; // para contar índice total gerado

        for( let i:int = 0; i < qtdePartes; i++ ) 
        {
            const nomeParte      : string               = nomesPartes[ i ];
            const facesParte     : Array<FaceObjeto>    = this.objetos[ nomeParte ];
            const qtdeFacesParte : int                  = facesParte.length;
            const indiceInicial  : int                  = qtdeIndicesGlobais;  // índice inicial no buffer geral

            let qtdeIndicesParte : int = 0;  // conta índices desse objeto só

            /**
            * Define a iluminação do objeto como sendo a iluminação padrão
            */
            this.iluminationInfo[ nomeParte ] = {
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
            this.iluminationAcumuladaInfo[ nomeParte ] = {
                brilhoLocalAcumulado      : 0,
                ambientLocalAcumulado     : 0,
                diffuseLocalAcumulado     : 0,
                specularLocalAcumulado    : 0,
                corLocalAcumulado         : [0, 0, 0], //RGB
                intensidadeLocalAcumulado : 0
            };  

            /**
            * Define a iluminação total do objeto( vai sempre a soma de iluminationAcumuladaInfo do objeto com a iluminação global do meu mini renderizador e com a iluminação definida no objeto em si )
            */
            this.iluminationTotal[ nomeParte ] = {
                brilhoObjeto         : 0,
                ambientObjeto        : 0,
                diffuseObjeto        : 0,
                specularObjeto       : 0,
                corLuzObjeto         : [0, 0, 0], //RGB
                intensidadeLuzObjeto : 0
            };

            for( let j:int = 0; j < qtdeFacesParte; j++ ) 
            {
                const faceAtual              : FaceObjeto           = facesParte[j];
                const dadosFaceAtual         : Array<VerticesFace>  = faceAtual.dadosFace;
                const qtdeVerticesFaceAtual  : int                  = dadosFaceAtual.length;
                const indicesFaces           : Array<float>         = new Array();

                for( let k:int = 0; k < qtdeVerticesFaceAtual; k++ ) 
                {
                    const verticeAtual   : VerticesFace   = faceAtual.dadosFace[k];
                    const keyVertice     : string         = String(verticeAtual.indiceVertice) + "/" + String(verticeAtual.indiceTextura) + "/" + String(verticeAtual.indiceNormal);   // Concatena os valores que vem no .OBJ para usar como chave

                    if( mapaIndicesVertices[ keyVertice ] === undefined ) 
                    {
                        const kdMaterial : Array<float>  = this.materiais[faceAtual.nomeMaterial]["Kd"]  || [1, 1, 1];
                        const posicao    : Array<float>  = this.vertices[verticeAtual.indiceVertice]     || [0, 0, 0];

                        // Define o indice
                        mapaIndicesVertices[ keyVertice ] = indiceAtual++;

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
                        if( verticeAtual.indiceTextura >= 0 ){
                            const uv = this.uvs[verticeAtual.indiceTextura];
                            this.uvArray = this.uvArray;
                            this.uvArray.push(uv[0]);
                            this.uvArray.push(uv[1]);

                        }else{
                            this.uvArray = this.uvArray;
                            this.uvArray.push(0);
                            this.uvArray.push(0);
                        }
                    }

                    indicesFaces.push( mapaIndicesVertices[ keyVertice ] );
                }

                // triangula a face atual (assumindo que faceAtual.dadosFace.length >= 3)
                for( let k:int = 1; k < indicesFaces.length - 1; k++ ) 
                {
                    this.indices.push( indicesFaces[0]       );
                    this.indices.push( indicesFaces[k]       );
                    this.indices.push( indicesFaces[k + 1]   );

                    qtdeIndicesParte   += 3;
                    qtdeIndicesGlobais += 3;
                }
            }

            // Armazena o offset em bytes (3 índices * 2 bytes por índice cada) e a contagem de índices
            this.objetosInfo[ nomeParte ] = {
                indiceInicialParte      : indiceInicial * 2, // indica onde os indices da parte atual começam dentro do buffer de indices(global), pois drawElements espera offset em bytes
                quantidadeIndicesParte  : qtdeIndicesParte
            };
        }
    }

    getPositions() : Array<float>
    {
        return this.positions;
    }

    getColors() : Array<float>
    {
        return this.cores;
    }

    getIndices() : Array<float>
    {
        return this.indices;
    }

    getUVs() : Array<float>
    {
        return this.uvArray || [];
    }

    /**
    * @override
    * @implementation
    */
    isTransparente() : boolean
    {
        return this.transparencia < 1 || this._isTransparente == true;
    }

    /**
    * Define a iluminação do objeto como um todo 
    * @override
    */
    setIntireIlumination( iluminationDefinition:IluminacaoGeralParte ) : void
    {
        this.brilhoObjeto          = iluminationDefinition.brilhoObjeto;
        this.ambientObjeto         = iluminationDefinition.ambientObjeto;
        this.diffuseObjeto         = iluminationDefinition.diffuseObjeto;
        this.specularObjeto        = iluminationDefinition.specularObjeto;
        this.intensidadeLuzObjeto  = iluminationDefinition.intensidadeLuzObjeto;

        // Pega a cor da luz
        this.corLuzObjeto    = [0, 0, 0];
        this.corLuzObjeto[0] = (iluminationDefinition.corLuzObjeto[0] || 0) + this.renderer.corAmbient[0];
        this.corLuzObjeto[1] = (iluminationDefinition.corLuzObjeto[1] || 0) + this.renderer.corAmbient[1];
        this.corLuzObjeto[2] = (iluminationDefinition.corLuzObjeto[2] || 0) + this.renderer.corAmbient[2];

        // Se todos os filhos(subojetos) usam iluminação individual
        if( this.childrenIndividualLights == true )
        {
            for( let i:int = 0 ; i < this.nomesObjetos.length ; i++ )
            {
                const nomeParte : string = this.nomesObjetos[i];

                this.iluminationInfo[ nomeParte ] = {
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
    getObjetos() : Mapa<string, Array<FaceObjeto>>
    {
        return this.objetos;
    }

    getPartes() : Mapa<string, Array<FaceObjeto>>
    {
        return this.objetos;
    }

    getNomesObjetos() : Array<string>
    {
        return this.nomesObjetos;
    }

    getNomesPartes() : Array<string>
    {
        return this.nomesObjetos;
    }

    getParteByIndex( index:int = 0 ) : Ponteiro<Array<FaceObjeto>>
    {
        return this.objetos[ this.nomesObjetos[ index ] ];
    }

    getParteByName( nomeParte:string ) : Ponteiro<Array<FaceObjeto>>
    {
        return this.objetos[ nomeParte ];
    }

    /**
    * Obtem um objeto/parte que contenha nomeParte em seu nome, ou algum outro critério
    */
    queryPartes( criterio="nome", 
                 operador="like", 
                 valorPesquisar="" 

    ) : Array<Array<FaceObjeto>> 
    {
        const partes      = []; // Com referencia(Array de ponteiros)
        const nomesPartes = []; // Se precisar 

        for( let i:int = 0 ; i < this.nomesObjetos.length ; i++ )
        {
            const nomeParte        : string              = this.nomesObjetos[i];
            const referenciaParte  : Array<FaceObjeto>   = this.objetos[ nomeParte ];

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

                for( let j:int = 0 ; j < referenciaParte.length ; j++ )
                {
                    const pedacoParte  : FaceObjeto  = referenciaParte[j];
                    const nomeMaterial : string      = pedacoParte.nomeMaterial;

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
    calcularCentroideParte( nomeParte:string ): Array<float>
    {
        let qtdeVerticesParte : int            = 0;
        let verticesParte     : Matrix<float>  = new Array<Array<float>>;  // Matrix<float>

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
                const apenasNomeObjetoSemMaterial = nomeParte.split("__")[0];
                verticesParte = this.verticesObjetosOnlyNomeParte[ apenasNomeObjetoSemMaterial ];
                qtdeVerticesParte = verticesParte.length;
            }
        }

        let totalVertices = qtdeVerticesParte;
        let xSomado       = 0;
        let ySomado       = 0;
        let zSomado       = 0; 
    
        for ( let i:int = 0 ; i < totalVertices ; i++ ) 
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
    calcularCentroideGlobalParte( nomeParte:string ): Array<float>
    {
        const matrixModeloObjetoVisual : Ponteiro<Float32Array<ArrayBufferLike>>  = this.modeloObjetoVisual;
        const centroLocalParte         : Array<float>                             = this.calcularCentroideParte( nomeParte );

        const centroLocalParte4        : Array<float> = [ 
                                                            centroLocalParte[0], 
                                                            centroLocalParte[1], 
                                                            centroLocalParte[2], 
                                                            1 // o 1 é constante para posições
                                                        ]; 

        const posicaoGlobalParte       : Array<float> = MultiplicarMatrix4x4PorVetor4( matrixModeloObjetoVisual!, centroLocalParte4 );

        return posicaoGlobalParte;
    }

    /**
    * Traz todos os vertices que estão dentro de um range de coordenadas
    */
    queryVerticesCoordenadas( minXYZ=Array(), maxXYZ=Array(), expansion=1, trazerNomeParte=true )
    {
        // Min Max X
        const minX : float  = minXYZ[0] * expansion;
        const maxX : float  = maxXYZ[0] * expansion;

        // Min Max Y
        const minY : float  = minXYZ[1] * expansion;
        const maxY : float  = maxXYZ[1] * expansion;

        // Min Max Z
        const minZ : float  = minXYZ[2] * expansion;
        const maxZ : float  = maxXYZ[2] * expansion;


        // detalhes dos vertices
        const verticesInfo : Array<VerticesParteOBJ> = [];

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
        const totalVertices : int  = this.vertices.length;

        for( let i:int = 0 ; i < totalVertices ; i++ )
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
                    for( let j:int = 0 ; j < this.nomesObjetos.length ; j++ )
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
    queryPartesCoordenadas( minXYZ=Array(), maxXYZ=Array(), expansion=1 ) : Array<Array<any>>
    {
        // Min Max X
        const minX : float  = minXYZ[0] * expansion;
        const maxX : float  = maxXYZ[0] * expansion;

        // Min Max Y
        const minY : float  = minXYZ[1] * expansion;
        const maxY : float  = maxXYZ[1] * expansion;

        // Min Max Z
        const minZ : float  = minXYZ[2] * expansion;
        const maxZ : float  = maxXYZ[2] * expansion;

        const partes : Matrix<any> = []; // Array de ponteiros

        // Para cada uma das partes
        for( let i:int = 0 ; i < this.nomesObjetos.length ; i++ )
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

                for( let j:int = 0 ; j < totalVerticesParte ; j++ )
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
    deformarVerticePorProximidade(xAlvo:float, yAlvo:float, zAlvo:float, raio:float, intensidade:float) : void
    {
        const vertices : Array<float>  = this.getPositions();

        for (let i:int = 0; i < vertices.length; i += 3) 
        {
            const dx   : float  = vertices[i]     - xAlvo;
            const dy   : float  = vertices[i + 1] - yAlvo;
            const dz   : float  = vertices[i + 2] - zAlvo;
            const dist : float  = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < raio && dist > 0.00001) 
            {
                const fator : float  = Math.cos((dist / raio) * Math.PI) * intensidade;

                vertices[i]     += (dx / dist) * fator;
                vertices[i + 1] += (dy / dist) * fator;
                vertices[i + 2] += (dz / dist) * fator;
            }
        }

        // Atualiza os vertices desse objeto
        this.renderer.atualizarVerticesPosicao( this, vertices );
    }

    atualizarDesenho() : void
    {
        // Atributos visuais 
        const meshConfig : VisualMeshConfig  = this.meshConfig;
        const position   : Position3D        = meshConfig.position;
        const rotation   : Position3D        = meshConfig.rotation;
        const scale      : Position3D        = meshConfig.scale;

        // Copia os valores do renderer que o objeto acompanha
        this.copiarValoresRenderer();

        this.modeloObjetoVisual = CriarMatrix4x4();

        this.modeloObjetoVisual     = DefinirTranslacao(this.modeloObjetoVisual, [position.x, position.y, position.z]);

        this.modeloObjetoVisual     = RotacionarX(this.modeloObjetoVisual, rotation.x);
        this.modeloObjetoVisual     = RotacionarY(this.modeloObjetoVisual, rotation.y);
        this.modeloObjetoVisual     = RotacionarZ(this.modeloObjetoVisual, rotation.z);

        this.modeloObjetoVisual     = DefinirEscala(this.modeloObjetoVisual, [scale.x, scale.y, scale.z]);

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

        //debugger
    }

    criar() : void
    {
        this.atualizarDesenho();
    }
}
