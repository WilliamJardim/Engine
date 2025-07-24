/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

/**
* Uma classe, Contem apenas atributos, métodos que usam esses propios atributos, recebem atributos externos como parametros, e retornam valores.
* 100% compativel com C++ 
*/

import { VisualMesh } from "./VisualMesh.js";
import { createBuffer, carregarTextura } from '../../utils/render_engine/funcoesBase.js';
import { baseShaders } from '../Shaders/Base.js';
import { 
   isDentroRaio
} from '../../utils/render_engine/math.js';

import { float } from "../../types/types-cpp-like.js";
import Position3D from "../../interfaces/main_engine/Position3D.js";
import { Renderer } from "../Renderer/Renderer.js";
import LightConfig from "../../interfaces/render_engine/LightConfig.js";

// renderizador.criarLuz( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 0.5, raio: 0.1 , cor: [255,0,0]} )

// DO MEU TESTE ANTIGO: renderizador.criarLuz( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 1, raio: 1 , cor: [5,0,0]} )

// OUTRO: renderizador.criarLuz( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 0.5, raio: 0.1 , cor: [255,0,0]} )

export class LightRenderizador
{
    public renderer    : Renderer;
    public meshConfig  : LightConfig;
    public tipo        : string;
    public position    : Position3D;
    public raio        : float;
    public brilho      : float;
    public ambient     : float;
    public diffuse     : float;
    public specular    : float;
    public cor         : Array<float>;
    public intensidade : float;

    constructor(renderer:Renderer, propriedadesMesh:LightConfig) 
    {
        this.renderer   = renderer;
        this.meshConfig = propriedadesMesh;

        this.tipo        = "Light";
        this.position    = propriedadesMesh.position;
        this.raio        = propriedadesMesh.raio        || 1; // Raio de alcance da luz
        this.brilho      = propriedadesMesh.brilho      || 16;
        this.ambient     = propriedadesMesh.ambient     || 0.2; 
        this.diffuse     = propriedadesMesh.diffuse     || 0.2;
        this.specular    = propriedadesMesh.specular    || 0.2;
        this.cor         = propriedadesMesh.cor         || [0, 0, 0];
        this.intensidade = propriedadesMesh.intensidade || 0;
    }

    /**
    * Calcula a força da luz em relação a distancia do objeto
    * Pra isso, eu passo a posição XYZ de interesse do objeto em questão
    * 
    * De modo que:
    *  - Objetos mais longe recebem menas influencia da luz
    *  - E objetos mais perto recebem mais influencia da luz
    */
    calcularForcaLuz( posicaoObjeto:Array<float> ) : float
    {       
        const posicaoLuz : Position3D   = this.position;
        const alcanceLuz : float        = this.raio;

        const xInteresseObjeto : float  = posicaoObjeto[0];
        const yInteresseObjeto : float  = posicaoObjeto[1];
        const zInteresseObjeto : float  = posicaoObjeto[2];

        // A distanca entre o objeto e a luz
        const dx : float  = posicaoLuz.x - xInteresseObjeto;
        const dy : float  = posicaoLuz.y - yInteresseObjeto;
        const dz : float  = posicaoLuz.z - zInteresseObjeto;

        const distancia2 : float  = Math.sqrt( dx*dx + dy*dy + dz*dz ) / alcanceLuz;

        return distancia2;
    }

    /**
    * Calcula o como essa luz, dada sua força, influencia a iluminação do objeto
    */
    calcularInfluenciaBrilho( forcaLuz:float ) : float
    {
        return this.brilho / forcaLuz;
    }

    calcularInfluenciaAmbient( forcaLuz:float ) : float
    {
        return this.ambient / forcaLuz;
    }

    calcularInfluenciaDiffuse( forcaLuz:float ) : float
    {
        return this.diffuse / forcaLuz
    }

    calcularInfluenciaSpecular( forcaLuz:float ) : float
    {
        return this.specular / forcaLuz;
    }

    calcularInfluenciaIntensidade( forcaLuz:float ) : float
    {   
        return this.intensidade / forcaLuz;
    }

    calcularInfluenciaCores( forcaLuz:float ) : Array<float>
    {
        const vermelho : float  = this.cor[0] / forcaLuz;
        const verde    : float  = this.cor[1] / forcaLuz;
        const azul     : float  = this.cor[2] / forcaLuz;

        return [ 
                 vermelho, 
                 verde, 
                 azul 
               ];
    }

    /**
    * Calcula o como essa luz, influencia a iluminação do objeto no brilho, diffuse, intensidade, cor, etc...  
    * Usando a função calcularForcaLuz, e as outras acima
    */
    calcularInterferencia( posicaoObjeto:Array<float> ): Array<float>
    {
        /**
        * Calcula o como essa luz, dada sua força, influencia a iluminação do objeto atual(do primeiro laço FOR)
        */
        const forcaLuz               : float     =  this.calcularForcaLuz( posicaoObjeto );
        const influenciaBrilho       : float     =  this.calcularInfluenciaBrilho( forcaLuz );
        const influenciaAmbient      : float     =  this.calcularInfluenciaAmbient( forcaLuz );
        const influenciaDiffuse      : float     =  this.calcularInfluenciaDiffuse( forcaLuz );
        const influenciaSpecular     : float     =  this.calcularInfluenciaSpecular( forcaLuz );
        const influenciaIntensidade  : float     =  this.calcularInfluenciaIntensidade( forcaLuz );

        // Cores
        const influenciaCores        : Array<float>  =  this.calcularInfluenciaCores( forcaLuz );
        const influenciaVermelho     : float         =  influenciaCores[0];
        const influenciaVerde        : float         =  influenciaCores[1];
        const influenciaAzul         : float         =  influenciaCores[2];

        return [ 
            forcaLuz,
            influenciaBrilho,
            influenciaAmbient,
            influenciaDiffuse,
            influenciaSpecular,
            influenciaIntensidade,

            // Cores
            influenciaVermelho,
            influenciaVerde,
            influenciaAzul
        ]
    }
}