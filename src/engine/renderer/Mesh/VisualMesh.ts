/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

import Position3D from "../../interfaces/main_engine/Position3D";
import { float, Ponteiro } from "../../types/types-cpp-like";
import InformacoesPrograma from "../../interfaces/render_engine/InformacoesPrograma";
import VisualMeshConfig from "../../interfaces/render_engine/VisualMeshConfig";
import { Renderer } from "../Renderer/Renderer";
import Mapa from "../../utils/dicionarios/Mapa";
import { createBuffer } from "../../utils/render_engine/funcoesBase";
import IluminacaoGeral from "../../interfaces/render_engine/IluminacaoGeral";
import IluminacaoTotalParte from "../../interfaces/render_engine/IluminacaoTotalParte";
import IluminacaoAcumuladaParte from "../../interfaces/render_engine/IluminacaoAcumuladaParte";
import IluminacaoGeralParte from "../../interfaces/render_engine/IluminacaoGeralParte";
import { Matrix } from "../../types/matrix";
import ContagemIndicesParteOBJ from "../../interfaces/render_engine/ContagemIndicesParteOBJ";
import Material from "../../interfaces/render_engine/Material";
import FaceObjeto from "../../interfaces/render_engine/FaceObjeto";
import RenderizadorCena from "../RenderizadorCena";

/**
* PORTABILIDADE PRA C++:
*
* Essa é uma classe base, muito similar as que eu criei em C++
* Usa ponteiros, cria atributos basicos própios,  
*
* Usa o ponteiro "renderer", uma referencia ao renderizador umas 26 vezes ao todo 
* com o intuito de acessar os atributos do "renderer" como ler as luzes, objetos, etc....
* Um uso de referencia muito simples via ponteiros, com apenas a exigencia do "renderer" existir e não ser nulo
*
* Tambem usa 17 vezes o "informacoesPrograma", que também é outra variavel que precisa existir, que será definida(ou obtida) nos objetos que herdarem a classe, e que vão enviar "informacoesPrograma" ao chamarem alguns dos métodos
* Tambem não é nada extraordinário
* 
* Os outros métodos só modificam ou retornam atributos desse propio objeto VisualMesh, alguns fazendo uso das "informacoesPrograma" e dados que vem do "renderer"
* Tambem não é nada extraordinário
* 
* Alguns métodos são abstratos e serão implementados nas classes que herdarem o VisualMesh, quando explicitamente dito em comentário.
*
* Tambem é 100% portável para C++, deis de que "informacoesPrograma" e "renderer" estejam acessiveis.
*/

export class VisualMesh
{
    public renderer       : Renderer;
    public meshConfig     : VisualMeshConfig;
    
    public _isTransparente : boolean;

    public vertexScript   : string;
    public fragmentScript : string;
    public isPlano        : boolean;
    public nome           : string;
    public id             : string;
    public classe         : string;
    public tipo           : string;

    public position       : Position3D;
    public scale          : Position3D;
    public rotation       : Position3D;

    public invisivel                 : boolean;
    public transparencia             : float;
    public alwaysUpdateLights        : boolean;
    public childrenIndividualLights  : boolean;
    public useAccumulatedLights      : boolean;
    public staticAccumulatedLights   : boolean;
    public _jaAcumulouLuzes          : boolean;

    public brilhoObjeto   : float;
    public ambientObjeto  : float;
    public diffuseObjeto  : float;
    public specularObjeto : float;
    public corLuz         : Array<float>;
    public corLuzObjeto   : Array<float>;
    public ambient        : float;
    public diffuse        : float;
    public specular       : float;
    public brilho         : float;
    public intensidadeLuz : float;

    public intensidadeLuzObjeto      : float;
    public brilhoLocalAcumulado      : float;
    public ambientLocalAcumulado     : float;
    public diffuseLocalAcumulado     : float;
    public specularLocalAcumulado    : float;
    public corLocalAcumulado         : Array<float>;
    public intensidadeLocalAcumulado : float;
    public useColors                 : boolean;

    public bufferPosicao      : Ponteiro<WebGLBuffer>;
    public bufferCor          : Ponteiro<WebGLBuffer>;
    public bufferUV           : Ponteiro<WebGLBuffer>;
    
    public bufferIndices      : Ponteiro<WebGLBuffer>;
    public modeloObjetoVisual : Ponteiro<Float32Array>;

    public vertices           : Matrix<float>;
    public usaUV              : boolean;
    public uvs                : Matrix<float>;
    public uvArray            : Array<float>;

    // Normais, Posições, indices, cores e se criou todos os buffers
    public normals            : Matrix<float>;
    public positions          : Array<float>;
    public indices            : Array<float>;
    public cores              : Array<float>;
    public allBuffersCriated  : boolean;

    public usaCollingFace     : boolean;

    // Para aplicação de texturas
    public usaTexturas        : boolean;      
    public texturaUV          : Ponteiro<WebGLTexture>;
    public texturasFaces      : Array<WebGLTexture>;

    // Usado em instancias de objetos OBJMesh
    public materiais          : Mapa<string, Material>;
    public materialAtivo      : string;
    public objetos            : Mapa<string, Array<FaceObjeto> >;
    public objetoAtivo        : string;
    public nomesObjetos       : Array<string>;
    public objetosInfo        : Mapa<string, ContagemIndicesParteOBJ>;

    // Iluminaçao geral do objeto
    public iluminacaoGeral : IluminacaoGeral;

    // Iluminação de cada parte, usado em instancias de objetos OBJMesh
    public iluminationInfo               : Mapa<string, IluminacaoGeralParte>;
    public iluminationAcumuladaInfo      : Mapa<string, IluminacaoAcumuladaParte>;
    public iluminationTotal              : Mapa<string, IluminacaoTotalParte>;
    public brilhoParte       : float;
    public ambientParte      : float;
    public diffuseParte      : float;
    public specularParte     : float;
    public corLuzParte       : Array<float>;
    public intensidadeParte  : float;

    constructor( renderer:Renderer, propriedadesMesh:VisualMeshConfig )
    {
        this.renderer   = renderer;
        this.meshConfig = propriedadesMesh;

        // Os shaders da renderização dele
        this.vertexScript   = "";
        
        this.fragmentScript = ""; 

        // Diz se o objeto é uma superficie plana ou não
        this.isPlano       = false;

        this.vertices          = new Array();
        this.usaUV             = false;
        this.uvs               = new Array();
        this.uvArray           = new Array<float>();

        // Atributos visuais
        this.nome          = propriedadesMesh.nome   || "SemNome";
        this.id            = this.nome + String(new Date().getTime());
        this.classe        = propriedadesMesh.classe || "Geral";
        this.tipo          = propriedadesMesh.tipo   || "Nenhum";
        this._isTransparente = false;
        this.position      = propriedadesMesh.position;
        this.scale         = propriedadesMesh.scale;
        this.rotation      = propriedadesMesh.rotation;
        this.invisivel     = propriedadesMesh.invisivel || false; 
        this.transparencia = propriedadesMesh.transparencia;

        // Luzes do objeto
        this.alwaysUpdateLights       = propriedadesMesh.alwaysUpdateLights || true;         // Se a todo momento vai atualizar luzes ou não
        // NOTA: Cada objeto pode atualizar a iluminação apenas levando em conta suas configuracoes fixas e do ambiente, OU TAMBEM PODE LEVAR EM CONTA CADA PONTO DE LUZ PELO CENARIO

        this.childrenIndividualLights = propriedadesMesh.childrenIndividualLights || true;   // Usado por alguns objetos da minha engine, como o OBJ
        this.useAccumulatedLights     = propriedadesMesh.useAccumulatedLights     || true;   // Se esse objeto vai receber uma acumulação de luzes ao seu redor (posso desativar se eu achar pesado)
        this.staticAccumulatedLights  = propriedadesMesh.staticAccumulatedLights  || false;  // Se ativado, a acumulação das luzes ao redor do objeto só vai ocorrer uma unica vez
        
        this._jaAcumulouLuzes         = false;  // Caso "staticAccumulatedLights" seja true, essa variavel de controle "_jaAcumulouLuzes" vai ser usada para interromper o loop de atualização das luzes

        this.brilhoObjeto                = propriedadesMesh.brilho   || 0;
        this.ambientObjeto               = propriedadesMesh.ambient  || 0; // Um acrescimento a luz ambiente
        this.diffuseObjeto               = propriedadesMesh.diffuse  || 0;
        this.specularObjeto              = propriedadesMesh.specular || 0;

        this.corLuz                      = [0, 0, 0];
        this.ambient                     = 0;
        this.diffuse                     = 0;
        this.specular                    = 0;
        this.brilho                      = 0;
        this.intensidadeLuz              = 0;

        this.corLuzObjeto                = propriedadesMesh.corLuzObjeto || [0, 0, 0];
        this.intensidadeLuzObjeto        = propriedadesMesh.intensidadeLuzObjeto || 0;

        // Iluminação acumulada do objeto (soma de todas as luzes que afetam ele)
        this.brilhoLocalAcumulado          = 0;
        this.ambientLocalAcumulado         = 0;
        this.diffuseLocalAcumulado         = 0;
        this.specularLocalAcumulado        = 0;
        this.corLocalAcumulado             = [0,0,0];
        this.intensidadeLocalAcumulado     = 0;

        // Por padrão sempre vai usar cores
        this.useColors = true;

        this.bufferPosicao      = null;
        this.bufferCor          = null;
        this.bufferUV           = null;
        this.bufferIndices      = null; 
        this.allBuffersCriated  = false; // Diz que ele ainda não criou os buffers do objeto

        this.normals           = new Array();
        this.positions         = new Array();
        this.indices           = new Array();
        this.cores             = new Array();

        this.modeloObjetoVisual = null; 

        this.usaCollingFace     = false;

        this.usaTexturas        = false;
        this.texturaUV          = null;
        this.texturasFaces      = new Array<WebGLTexture>(); // Se ele usa texturas de faces

        // Usado em instancias de OBJMesh
        this.materiais         = new Mapa<string, Material>();
        this.materialAtivo     = "NENHUM_MATERIAL";

        this.objetos                       = new Mapa<string, Array<FaceObjeto> >();
        this.nomesObjetos                  = new Array(); 
        this.objetoAtivo                   = "NENHUM_OBJETO";
        this.objetosInfo                   = new Mapa<string, ContagemIndicesParteOBJ>(); // objeto para guardar offset/count dos indices de cada parte do objeto

        // Usado na iluminação de instancias de OBJMesh
        this.childrenIndividualLights = propriedadesMesh.childrenIndividualLights;   // Se cada parte vai usar iluminação
        this.useAccumulatedLights     = propriedadesMesh.useAccumulatedLights;       // Se cada parte vai receber uma acumulação de luzes ao seu redor
        this.staticAccumulatedLights  = propriedadesMesh.staticAccumulatedLights;    // Se ativado, a acumulação das luzes ao redor das partes só vai ocorrer uma unica vez
        this._jaAcumulouLuzes         = false;                                       // Caso "staticAccumulatedLights" seja true, essa variavel de controle "_jaAcumulouLuzes" vai ser usada para interromper o loop de atualização das luzes

        // Iluminação geral de um objeto
        this.iluminacaoGeral          = {
            ambient         : 0,
            diffuse         : 0,
            specular        : 0,
            brilho          : 0,
            intensidadeLuz  : 0,
            corLuz          : [0,0,0]
        };

        this.iluminationInfo          = new Mapa<string, IluminacaoGeralParte>();        // Iluminação por objeto dentro desse OBJ, por padrão será iniciado com valores padrão
        this.iluminationAcumuladaInfo = new Mapa<string, IluminacaoAcumuladaParte>();    // A iluminação acumulada de cada objeto individualmente(usada quanto childrenIndividualLights for true)
        this.iluminationTotal         = new Mapa<string, IluminacaoTotalParte>();        // A iluminação total de cada objeto individualmente(ou seja, que a soma da iluminação do propio objeto em si, com a iluminação global do meu mini renderizador, e com a iluminação local acumulada de todas as luzes proximas ao objeto, e com isso temos o que chamei de iluminação total da parte/objeto)

        // Mais variaveis para a acumulação de luzes
        this.brilhoParte       = 0;
        this.ambientParte      = 0;
        this.diffuseParte      = 0;
        this.specularParte     = 0;
        this.corLuzParte       = [0, 0, 0];
        this.intensidadeParte  = 0;
    }

    // Copia os valores do renderer que o objeto acompanha
    copiarValoresRenderer() : void
    {   
        const renderer : Renderer  = this.renderer;

        // Quando o valor é falso, ele pega do renderer(que tambem pode ser falso)
        if( this.childrenIndividualLights == false )
        {
            this.childrenIndividualLights = renderer.childrenIndividualLights;
        }

        if( this.useAccumulatedLights == false )
        {
            this.useAccumulatedLights = renderer.useAccumulatedLights;
        }

        if( this.staticAccumulatedLights == false )
        {
            this.staticAccumulatedLights = renderer.staticAccumulatedLights;
        }
    }

    // ATIVAR EM TODOS: renderizador.getObjetos().forEach((o)=>{ o.enableStaticAccumulatedLights() })

    // Ativa as luzes acumuladas estaticas
    enableStaticAccumulatedLights() : void
    {
        this.staticAccumulatedLights = true;
        this._jaAcumulouLuzes        = false; 
    }

    // Desativa as luzes acumuladas estaticas
    disableStaticAccumulatedLights() : void
    {
        this.staticAccumulatedLights = false;
    }
    
    /**
    * Define a iluminação do objeto como um todo 
    */
    setIntireIlumination( iluminationDefinition:IluminacaoGeralParte ) : void
    {
        this.brilhoObjeto          = iluminationDefinition.brilhoObjeto;
        this.ambientObjeto         = iluminationDefinition.ambientObjeto;
        this.diffuseObjeto         = iluminationDefinition.diffuseObjeto;
        this.specularObjeto        = iluminationDefinition.specularObjeto;
        this.intensidadeLuzObjeto  = iluminationDefinition.intensidadeLuzObjeto;

        // Pega a cor da luz
        this.corLuz    = [0, 0, 0];
        this.corLuz[0] = (iluminationDefinition.corLuzObjeto[0] || 0) + this.renderer.corAmbient[0];
        this.corLuz[1] = (iluminationDefinition.corLuzObjeto[1] || 0) + this.renderer.corAmbient[1];
        this.corLuz[2] = (iluminationDefinition.corLuzObjeto[2] || 0) + this.renderer.corAmbient[2];
    }

    getRotation() : Position3D
    {
        return this.rotation;
    }

    /**
    * Soma uma rotação ao redor de cada eixo: X, Y, Z, respectivamente.
    */
    addRotationAround(rotation:Position3D) : void
    {
        this.rotation.x += rotation.x;
        this.rotation.y += rotation.y;
        this.rotation.z += rotation.z;
    }

    addRotationAroundX(rotationX:float) : void
    {
        this.rotation.x += rotationX;
    }

    addRotationAroundY(rotationY:float) : void
    {
        this.rotation.y += rotationY;
    }

    addRotationAroundZ(rotationZ:float) : void
    {
        this.rotation.z += rotationZ;
    }

    /**
    * Define uma rotação ao redor de cada eixo: X, Y, Z, respectivamente.
    */
    setRotationAround(rotation:Position3D) : void
    {
        this.rotation.x = rotation.x;
        this.rotation.y = rotation.y;
        this.rotation.z = rotation.z;
    }

    setRotationAroundX(rotationX:float) : void
    {
        this.rotation.x = rotationX;
    }

    setRotationAroundY(rotationY:float) : void
    {
        this.rotation.y = rotationY;
    }

    setRotationAroundZ(rotationZ:float) : void
    {
        this.rotation.z = rotationZ;
    }


    /**
    * Soma uma rotação EM DIREÇÂO de cada eixo: X, Y, Z, respectivamente.
    * OU seja, em direção do eixo X,
    * 
    * Respeitando a direção de movimento da posição, ou seja, 
    * Ao mover em +X, ele anda pra direita, então por esse método ao rotacionar em direção a X, ele vai inclinar pra direita tambem
    */
    addRotationTowards(rotation:Position3D) : void
    {
        this.rotation.x += (rotation.z * -1);
        this.rotation.y += rotation.y;
        this.rotation.z += (rotation.x * -1);
    }

    addRotationTowardsX(rotationX:float) : void
    {
        this.rotation.z += (rotationX * -1);
    }

    addRotationTowardsY(rotationY:float) : void
    {
        this.rotation.y += rotationY;
    }

    addRotationTowardsZ(rotationZ:float) : void
    {
        this.rotation.x += (rotationZ * -1);
    }

    /**
    * Define uma rotação EM DIREÇÂO de cada eixo: X, Y, Z, respectivamente.
    * OU seja, em direção do eixo X,
    * 
    * Respeitando a direção de movimento da posição, ou seja, 
    * Ao mover em +X, ele anda pra direita, então por esse método ao rotacionar em direção a X, ele vai inclinar pra direita tambem
    */
    setRotationTowards(rotation:Position3D) : void
    {
        this.rotation.x = (rotation.z * -1);
        this.rotation.y = rotation.y;
        this.rotation.z = (rotation.x * -1);
    }

    setRotationTowardsX(rotationX:float) : void 
    {
        this.rotation.z = (rotationX * -1);
    }

    setRotationTowardsY(rotationY:float) : void
    {
        this.rotation.y = rotationY;
    }

    setRotationTowardsZ(rotationZ:float) : void
    {
        this.rotation.x = (rotationZ * -1);
    }


    getPosition() : Position3D
    {
        return this.position;
    }

    addPosition(position:Position3D) : void
    {
        this.position.x += position.x;
        this.position.y += position.y;
        this.position.z += position.z;
    }

    addPositionX(positionX:float) : void 
    {
        this.position.x += positionX;
    }

    addPositionY(positionY:float) : void
    {
        this.position.y += positionY;
    }

    addPositionZ(positionZ:float) : void
    {
        this.position.z += positionZ;
    }


    setPosition(position:Position3D) : void
    {
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }

    setPositionX(positionX:float) : void
    {
        this.position.x = positionX;
    }

    setPositionY(positionY:float) : void
    {
        this.position.y = positionY;
    }

    setPositionZ(positionZ:float) : void
    {
        this.position.z = positionZ;
    }


    getScale() : Position3D
    {
        return this.scale;
    }

    addScale(scale:Position3D) : void
    {
        this.scale.x += scale.x;
        this.scale.y += scale.y;
        this.scale.z += scale.z;
    }

    addScaleX(scaleX:float) : void
    {
        this.scale.x += scaleX;
    }

    addScaleY(scaleY:float) : void
    {
        this.scale.y += scaleY;
    }

    addScaleZ(scaleZ:float) : void
    {
        this.scale.z += scaleZ;
    }


    setScale(scale:Position3D) : void
    {
        this.scale.x = scale.x;
        this.scale.y = scale.y;
        this.scale.z = scale.z;
    }

    setScaleX(scaleX:float) : void
    {
        this.scale.x = scaleX;
    }

    setScaleY(scaleY:float) : void
    {
        this.scale.y = scaleY;
    }

    setScaleZ(scaleZ:float) : void
    {
        this.scale.z = scaleZ;
    }


    isTransparente() : boolean
    {
        return this.transparencia < 1;
    }

    isOpaco() : boolean
    {
        return this.transparencia >= 1;
    }

    getTransparencia() : float
    {
        return this.transparencia;
    }

    setTransparencia( nivelOpacidade:float ) : void
    {
        this.transparencia = nivelOpacidade;
    }

    setInvisibilidade( novaInvisibilidade:boolean=false ) : void
    {
        this.invisivel = novaInvisibilidade;
    }

    ocultar() : void
    {
        this.invisivel = true;
    }

    aparecer() : void
    {
        this.invisivel = false;
    }

    isInvisivel() : boolean
    {
        return this.invisivel == true;
    }

    isVisivel() : boolean
    {
        return this.invisivel == false;
    }

    /**
    * Obtem a instancia do renderizador
    */
    getRenderer() : Renderer
    {
        return this.renderer;
    }

    /**
    * Obtem os atributos desse objeto 
    */
    getAtributos() : VisualMeshConfig
    {
        return this.meshConfig;
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
    * Função que atualize as informações de desenho do objeto 
    * Se implementa ela em cada objeto
    */
    atualizarDesenho( frameDelta:float ) : void
    {
        
    }

    // Obtem o program usado por ele no meu mini renderizador webgl
    getProgram(): Ponteiro<WebGLProgram>
    {
        return this.renderer.getProgramObjetoDesenhar(this.tipo);
    }

    getVertex() : string
    {
        return this.vertexScript;
    }

    getFragment() : string
    {
        return this.fragmentScript;
    }

    /**
    * Declaração de funções que só serão implementadas dentro do OBJMesh 
    */
    calcularCentroideParte( nomeParte:string ): Array<float>
    {
        // ESTA IMPLEMENTADO NO OBJMesh
        return [];
    }

    calcularCentroideGlobalParte( nomeParte:string ): Array<float>
    {
        // ESTA IMPLEMENTADO NO OBJMesh
        return [];
    }
}