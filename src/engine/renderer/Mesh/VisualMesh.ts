/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

import Position3D from "../../interfaces/Position3D";
import { float, Ponteiro } from "../../types/types-cpp-like";
import InformacoesPrograma from "../interfaces/InformacoesPrograma";
import VisualMeshConfig from "../interfaces/VisualMeshConfig";
import { Renderer } from "../Renderer/Renderer";

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
    public programUsado   : Ponteiro<WebGLProgram>;
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
    public transparencia             : number;
    public alwaysUpdateLights        : boolean;
    public childrenIndividualLights  : boolean;
    public useAccumulatedLights      : boolean;
    public staticAccumulatedLights   : boolean;
    public _jaAcumulouLuzes          : boolean;

    public brilhoObjeto   : number;
    public ambientObjeto  : number;
    public diffuseObjeto  : number;
    public specularObjeto : number;
    public corLuz         : Array<float>;
    public corLuzObjeto   : Array<float>;
    public ambient        : number;
    public diffuse        : number;
    public specular       : number;
    public brilho         : number;
    public intensidadeLuz : number;

    public intensidadeLuzObjeto      : number;
    public brilhoLocalAcumulado      : number;
    public ambientLocalAcumulado     : number;
    public diffuseLocalAcumulado     : number;
    public specularLocalAcumulado    : number;
    public corLocalAcumulado         : Array<float>;
    public intensidadeLocalAcumulado : number;
    public useColors                 : boolean;

    public bufferPosicao      : Ponteiro<WebGLBuffer>;
    public bufferCor          : Ponteiro<WebGLBuffer>;
    public bufferIndices      : Ponteiro<WebGLBuffer>;
    public modeloObjetoVisual : Ponteiro<Float32Array>;

    constructor( renderer:Renderer, meshConfig:VisualMeshConfig )
    {
        this.renderer   = renderer;
        this.meshConfig = meshConfig;

        this.programUsado = null; // Vai ser um ponteiro, eu vou definir em cada tipo de Mesh

        // Os shaders da renderização dele
        this.vertexScript   = '';
        
        this.fragmentScript = ''; 

        // Diz se o objeto é uma superficie plana ou não
        this.isPlano       = false;

        // Atributos visuais
        this.nome          = meshConfig.nome || "SemNome";
        this.id            = this.nome + String(new Date().getTime());
        this.classe        = meshConfig.classe || "Geral";
        this.tipo          = meshConfig.tipo || 'Nenhum';
        this.position      = meshConfig.position;
        this.scale         = meshConfig.scale;
        this.rotation      = meshConfig.rotation;
        this.invisivel     = meshConfig.invisivel || false; 
        this.transparencia = meshConfig.transparencia;

        // Luzes do objeto
        this.alwaysUpdateLights       = meshConfig.alwaysUpdateLights || true;         // Se a todo momento vai atualizar luzes ou não
        // NOTA: Cada objeto pode atualizar a iluminação apenas levando em conta suas configuracoes fixas e do ambiente, OU TAMBEM PODE LEVAR EM CONTA CADA PONTO DE LUZ PELO CENARIO

        this.childrenIndividualLights = meshConfig.childrenIndividualLights || true;   // Usado por alguns objetos da minha engine, como o OBJ
        this.useAccumulatedLights     = meshConfig.useAccumulatedLights     || true;   // Se esse objeto vai receber uma acumulação de luzes ao seu redor (posso desativar se eu achar pesado)
        this.staticAccumulatedLights  = meshConfig.staticAccumulatedLights  || false;  // Se ativado, a acumulação das luzes ao redor do objeto só vai ocorrer uma unica vez
        
        this._jaAcumulouLuzes         = false;  // Caso "staticAccumulatedLights" seja true, essa variavel de controle "_jaAcumulouLuzes" vai ser usada para interromper o loop de atualização das luzes

        this.brilhoObjeto                = meshConfig.brilho   || 0;
        this.ambientObjeto               = meshConfig.ambient  || 0; // Um acrescimento a luz ambiente
        this.diffuseObjeto               = meshConfig.diffuse  || 0;
        this.specularObjeto              = meshConfig.specular || 0;

        this.corLuz                      = [0, 0, 0];
        this.ambient                     = 0;
        this.diffuse                     = 0;
        this.specular                    = 0;
        this.brilho                      = 0;
        this.intensidadeLuz              = 0;

        this.corLuzObjeto                = meshConfig.corLuzObjeto || [0, 0, 0];
        this.intensidadeLuzObjeto        = meshConfig.intensidadeLuzObjeto || 0;

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
        this.bufferIndices      = null;

        this.modeloObjetoVisual = null;

        
    }

    // Copia os valores do renderer que o objeto acompanha
    copiarValoresRenderer()
    {   
        const renderer = this.renderer;

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

    getInformacoesPrograma(): InformacoesPrograma
    {
        // APENAS UM TEMPLATE PRA INDICAR QUE TIPO DE RETORNO O getInformacoesPrograma de um objeto retorna
        return {
            atributosObjeto: {
                posicao: 0,
                cor: 0,
                uv : 0,
                brilho: new WebGLUniformLocation(),
                ambient: new WebGLUniformLocation(),
                diffuse: new WebGLUniformLocation(),
                specular: new WebGLUniformLocation(),
                corLuz: new WebGLUniformLocation(),
                intensidadeLuz: new WebGLUniformLocation()
            },
            atributosVisualizacaoObjeto: {
                matrixVisualizacao: new WebGLUniformLocation(),
                modeloObjetoVisual: new WebGLUniformLocation()
            },
            uniformsCustomizados: {
                usarTextura: new WebGLUniformLocation(),
                opacidade: new WebGLUniformLocation(),
                sampler: new WebGLUniformLocation()
            }
        };
    }

    // ATIVAR EM TODOS: renderizador.getObjetos().forEach((o)=>{ o.enableStaticAccumulatedLights() })

    // Ativa as luzes acumuladas estaticas
    enableStaticAccumulatedLights()
    {
        this.staticAccumulatedLights = true;
        this._jaAcumulouLuzes        = false; 
    }

    // Desativa as luzes acumuladas estaticas
    disableStaticAccumulatedLights()
    {
        this.staticAccumulatedLights = false;
    }

    /**
    * Código base para aplicar iluminação, usado em todos os objetos
    * 
    * Pra isso implementar em C++ eu teria 3 opções:
    *    (1) Declarar ele só no final(pois ele depende da Cena com todos os métodos dela)
    *    
    *    (2) Ou então, ele tambem poderia ser virtual, e eu implemento em cada objeto(vai ter que duplicar código)
    * 
    *    (3) Ou então, eu poderia criar uma outra classe VisualMesh que vai herdar o ObjectBase, no final das definições raizes, e ai como todos os objetos herdam o VisualMesh, iria seguir o fluxo normal(visto que nesse ponto Cena, ObjectBase e outras classes raiz vão estar totalmente definidas)
    *        Mais pode ser um pouco mais complicado por causa de conversões de objetos que podem ser necessarias ser feitas
    */
    atualizarIluminacao(gl:WebGL2RenderingContext, informacoesPrograma:any )
    {
        const renderer  : Renderer     = this.renderer;
        const luzesCena : Array<any>   = renderer.getLuzes();

        /**
        * Calcula o recebimento de todas as luzes que afeta esse objeto 
        */
        this.brilhoLocalAcumulado          = 0;
        this.ambientLocalAcumulado         = 0;
        this.diffuseLocalAcumulado         = 0;
        this.specularLocalAcumulado        = 0;
        this.corLocalAcumulado             = [0,0,0];
        this.intensidadeLocalAcumulado     = 0;

        // Se esse recurso está ativado
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
                /**
                * Calcula o recebimento de todas as luzes que afeta esse objeto 
                */
                this.brilhoLocalAcumulado          = 0;
                this.ambientLocalAcumulado         = 0;
                this.diffuseLocalAcumulado         = 0;
                this.specularLocalAcumulado        = 0;
                this.corLocalAcumulado             = [0,0,0];
                this.intensidadeLocalAcumulado     = 0;

                for( let i = 0 ; i < luzesCena.length ; i++ )
                {
                    const luz                = luzesCena[i];
                    const posicaoObjetoArray = [this.position.x, this.position.y, this.position.z];

                    const interferenciaLuz  = luz.calcularInterferencia( posicaoObjetoArray );

                    /**
                    * Calcula o como essa luz, dada sua força, influencia a iluminação do objeto atual(do primeiro laço FOR)
                    */
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
                    this.brilhoLocalAcumulado         += influenciaBrilho;
                    this.ambientLocalAcumulado        += influenciaAmbient;
                    this.diffuseLocalAcumulado        += influenciaDiffuse;
                    this.specularLocalAcumulado       += influenciaSpecular;
                    this.intensidadeLocalAcumulado    += influenciaIntensidade;

                    // As luzes mais proximas terão tambem mais influencia na cor
                    this.corLocalAcumulado[0]         += influenciaVermelho;
                    this.corLocalAcumulado[1]         += influenciaVerde;
                    this.corLocalAcumulado[2]         += influenciaAzul;
                }
            }
        }

        /**
        * Obtem o ambiente atualizado como a soma dos valores do objeto com os globais da cena
        */
        this.ambient         = this.ambientObjeto        + this.renderer.ambient         + this.ambientLocalAcumulado;
        this.diffuse         = this.diffuseObjeto        + this.renderer.diffuse         + this.diffuseLocalAcumulado;
        this.specular        = this.specularObjeto       + this.renderer.specular        + this.specularLocalAcumulado;
        this.brilho          = this.brilhoObjeto         + this.renderer.brilho          + this.brilhoLocalAcumulado;
        this.intensidadeLuz  = this.intensidadeLuzObjeto + this.renderer.intensidadeLuz  + this.intensidadeLocalAcumulado;

        // Pega a cor da luz
        this.corLuz    = [0, 0, 0];
        this.corLuz[0] = this.corLuzObjeto[0] + this.renderer.corAmbient[0] + this.corLocalAcumulado[0];
        this.corLuz[1] = this.corLuzObjeto[1] + this.renderer.corAmbient[1] + this.corLocalAcumulado[1];
        this.corLuz[2] = this.corLuzObjeto[2] + this.renderer.corAmbient[2] + this.corLocalAcumulado[2];

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
        gl.uniform1f(brilhoShader,   this.brilho);
        gl.uniform1f(ambientShader,  this.ambient);
        gl.uniform1f(diffuseShader,  this.diffuse);
        gl.uniform1f(specularShader, this.specular);
        gl.uniform3fv(corLuzShader,  new Float32Array(this.corLuz) );
        gl.uniform1f(intensidadeLuzShader, this.intensidadeLuz);

        // Marca que as luzes de todas as partes ja foram atualizadas pela primeira vez
        this._jaAcumulouLuzes = true;
    }
    
    /**
    * Define a iluminação do objeto como um todo 
    */
    setIntireIlumination( iluminationDefinition:any={} )
    {
        this.brilhoObjeto   = iluminationDefinition.brilhoObjeto;
        this.ambientObjeto  = iluminationDefinition.ambientObjeto;
        this.diffuseObjeto  = iluminationDefinition.diffuseObjeto;
        this.specularObjeto = iluminationDefinition.specularObjeto;
        this.intensidadeLuzObjeto = iluminationDefinition.intensidadeLuzObjeto;

        // Pega a cor da luz
        this.corLuz    = [0, 0, 0];
        this.corLuz[0] = (iluminationDefinition.corLuzObjeto[0] || 0) + this.renderer.corAmbient[0];
        this.corLuz[1] = (iluminationDefinition.corLuzObjeto[1] || 0) + this.renderer.corAmbient[1];
        this.corLuz[2] = (iluminationDefinition.corLuzObjeto[2] || 0) + this.renderer.corAmbient[2];
    }

    /*
    atualizarIluminacao(gl, informacoesPrograma )
    {
        // Configurações gerais da luz no objeto
        const brilho         = informacoesPrograma.atributosObjeto.brilho;
        const ambient        = informacoesPrograma.atributosObjeto.ambient;
        const diffuse        = informacoesPrograma.atributosObjeto.diffuse;
        const specular       = informacoesPrograma.atributosObjeto.specular;

        // Posição e detalhes das luzes
        const posicaoLuz     = informacoesPrograma.atributosObjeto.posicaoLuz; // um ARRAY
        const corLuz         = informacoesPrograma.atributosObjeto.corLuz; // um ARRAY
        const intensidadeLuz = informacoesPrograma.atributosObjeto.intensidadeLuz; // um ARRAY

        // Atualiza as configurações gerais 
        gl.uniform1f(brilho,   this.brilho);
        gl.uniform1f(ambient,  this.ambient);
        gl.uniform1f(diffuse,  this.diffuse);
        gl.uniform1f(specular, this.specular);

        // Obtem as luzes que objeto está recebendo
        const luzesCena = this.getLuzesConvertidas();

        // Atualiza as luzes no shaders do objeto
        gl.uniform3fv(posicaoLuz,     luzesCena.posicoes );
        gl.uniform3fv(corLuz,         luzesCena.cores );
        gl.uniform3fv(intensidadeLuz, luzesCena.intensidades);
    }*/

    /**
    * Código base para aplicar iluminação, usado em todos os objetos
    */
    aplicarIluminacao( gl:WebGL2RenderingContext, informacoesPrograma:any )
    {
        // Se o objeto sempre for atualizar luzes
        if( this.alwaysUpdateLights == true )
        {
            this.atualizarIluminacao(gl, informacoesPrograma);
        }
    }

    getRotation()
    {
        return this.rotation;
    }

    /**
    * Soma uma rotação ao redor de cada eixo: X, Y, Z, respectivamente.
    */
    addRotationAround(rotation:Position3D)
    {
        this.rotation.x += rotation.x;
        this.rotation.y += rotation.y;
        this.rotation.z += rotation.z;
    }

    addRotationAroundX(rotationX:number)
    {
        this.rotation.x += rotationX;
    }

    addRotationAroundY(rotationY:number)
    {
        this.rotation.y += rotationY;
    }

    addRotationAroundZ(rotationZ:number)
    {
        this.rotation.z += rotationZ;
    }

    /**
    * Define uma rotação ao redor de cada eixo: X, Y, Z, respectivamente.
    */
    setRotationAround(rotation:Position3D)
    {
        this.rotation.x = rotation.x;
        this.rotation.y = rotation.y;
        this.rotation.z = rotation.z;
    }

    setRotationAroundX(rotationX:number)
    {
        this.rotation.x = rotationX;
    }

    setRotationAroundY(rotationY:number)
    {
        this.rotation.y = rotationY;
    }

    setRotationAroundZ(rotationZ:number)
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
    addRotationTowards(rotation:Position3D)
    {
        this.rotation.x += (rotation.z * -1);
        this.rotation.y += rotation.y;
        this.rotation.z += (rotation.x * -1);
    }

    addRotationTowardsX(rotationX:number)
    {
        this.rotation.z += (rotationX * -1);
    }

    addRotationTowardsY(rotationY:number)
    {
        this.rotation.y += rotationY;
    }

    addRotationTowardsZ(rotationZ:number)
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
    setRotationTowards(rotation:Position3D)
    {
        this.rotation.x = (rotation.z * -1);
        this.rotation.y = rotation.y;
        this.rotation.z = (rotation.x * -1);
    }

    setRotationTowardsX(rotationX:number)
    {
        this.rotation.z = (rotationX * -1);
    }

    setRotationTowardsY(rotationY:number)
    {
        this.rotation.y = rotationY;
    }

    setRotationTowardsZ(rotationZ:number)
    {
        this.rotation.x = (rotationZ * -1);
    }


    getPosition()
    {
        return this.position;
    }

    addPosition(position:Position3D)
    {
        this.position.x += position.x;
        this.position.y += position.y;
        this.position.z += position.z;
    }

    addPositionX(positionX:number)
    {
        this.position.x += positionX;
    }

    addPositionY(positionY:number)
    {
        this.position.y += positionY;
    }

    addPositionZ(positionZ:number)
    {
        this.position.z += positionZ;
    }


    setPosition(position:Position3D)
    {
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }

    setPositionX(positionX:number)
    {
        this.position.x = positionX;
    }

    setPositionY(positionY:number)
    {
        this.position.y = positionY;
    }

    setPositionZ(positionZ:number)
    {
        this.position.z = positionZ;
    }


    getScale()
    {
        return this.scale;
    }

    addScale(scale:Position3D)
    {
        this.scale.x += scale.x;
        this.scale.y += scale.y;
        this.scale.z += scale.z;
    }

    addScaleX(scaleX:number)
    {
        this.scale.x += scaleX;
    }

    addScaleY(scaleY:number)
    {
        this.scale.y += scaleY;
    }

    addScaleZ(scaleZ:number)
    {
        this.scale.z += scaleZ;
    }


    setScale(scale:Position3D)
    {
        this.scale.x = scale.x;
        this.scale.y = scale.y;
        this.scale.z = scale.z;
    }

    setScaleX(scaleX:number)
    {
        this.scale.x = scaleX;
    }

    setScaleY(scaleY:number)
    {
        this.scale.y = scaleY;
    }

    setScaleZ(scaleZ:number)
    {
        this.scale.z = scaleZ;
    }


    isTransparente()
    {
        return this.transparencia < 1;
    }

    isOpaco()
    {
        return this.transparencia >= 1;
    }

    getTransparencia()
    {
        return this.transparencia;
    }

    setTransparencia( nivelOpacidade:number )
    {
        this.transparencia = nivelOpacidade;
    }

    setInvisibilidade( novaInvisibilidade:boolean=false )
    {
        this.invisivel = novaInvisibilidade;
    }

    ocultar()
    {
        this.invisivel = true;
    }

    aparecer()
    {
        this.invisivel = false;
    }

    isInvisivel()
    {
        return this.invisivel == true;
    }

    isVisivel()
    {
        return this.invisivel == false;
    }

    /**
    * Obtem a instancia do renderizador
    */
    getRenderer()
    {
        return this.renderer;
    }

    /**
    * Obtem os atributos desse objeto 
    */
    getAtributos()
    {
        return this.meshConfig;
    }

    /**
    * Função que desenha o objeto 
    * Se implementa ela em cada objeto
    */
    desenhar( frameDelta:number )
    {
        
    }

    /**
    * Se implementa ela em cada objeto
    * Cria os buffers que vão ser usados na renderização
    */
    createBuffers()
    {
        
    }

    // Muda o valor do ponteiro "this.programUsado"
    setProgram( programUsar:WebGLProgram )
    {
        this.programUsado = programUsar;
    }

    getProgram(): Ponteiro<WebGLProgram>
    {
        return this.programUsado;
    }

    getVertex()
    {
        return this.vertexScript;
    }

    getFragment()
    {
        return this.fragmentScript;
    }
}