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

import { VisualMesh } from "./VisualMesh";
import { createBuffer, carregarTextura } from '../utils/funcoesBase.js';
import { baseShaders } from '../Shaders/Base.js';
import { 
   isDentroRaio
} from '../utils/math.js';

import { float } from "../../types/types-cpp-like.js";

// renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 0.5, raio: 0.1 , cor: [255,0,0]} )
export class Light
{
    public renderer:any;
    public meshConfig:any;
    public tipo:string;
    public position:any;
    public raio:any;
    public brilho:any;
    public ambient:any;
    public diffuse:any;
    public specular:any;
    public cor:any;
    public intensidade:any;

    constructor(renderer:any, propriedadesMesh:any) 
    {
        this.renderer   = renderer;
        this.meshConfig = propriedadesMesh;

        this.tipo = "Light";
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
    calcularForcaLuz( posicaoObjeto:Array<float> )
    {       
        const posicaoLuz = this.position;
        const alcanceLuz = this.raio;

        const xInteresseObjeto = posicaoObjeto[0];
        const yInteresseObjeto = posicaoObjeto[1];
        const zInteresseObjeto = posicaoObjeto[2];

        // A distanca entre o objeto e a luz
        const dx = posicaoLuz.x - xInteresseObjeto;
        const dy = posicaoLuz.y - yInteresseObjeto;
        const dz = posicaoLuz.z - zInteresseObjeto;

        const distancia2 = Math.sqrt( dx*dx + dy*dy + dz*dz ) / alcanceLuz;

        return distancia2;
    }

    /**
    * Calcula o como essa luz, dada sua força, influencia a iluminação do objeto
    */
    calcularInfluenciaBrilho( forcaLuz:number ) : number
    {
        return this.brilho / forcaLuz;
    }

    calcularInfluenciaAmbient( forcaLuz:number ) : number
    {
        return this.ambient / forcaLuz;
    }

    calcularInfluenciaDiffuse( forcaLuz:number ) : number
    {
        return this.diffuse / forcaLuz
    }

    calcularInfluenciaSpecular( forcaLuz:number ) : number
    {
        return this.specular / forcaLuz;
    }

    calcularInfluenciaIntensidade( forcaLuz:number ) : number
    {   
        return this.intensidade / forcaLuz;
    }

    calcularInfluenciaCores( forcaLuz:number ) : Array<float>
    {
        const vermelho  =  this.cor[0] / forcaLuz;
        const verde     =  this.cor[1] / forcaLuz;
        const azul      =  this.cor[2] / forcaLuz;

        return [ vermelho, verde, azul ];
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
        const forcaLuz               =  this.calcularForcaLuz( posicaoObjeto );
        const influenciaBrilho       =  this.calcularInfluenciaBrilho( forcaLuz );
        const influenciaAmbient      =  this.calcularInfluenciaAmbient( forcaLuz );
        const influenciaDiffuse      =  this.calcularInfluenciaDiffuse( forcaLuz );
        const influenciaSpecular     =  this.calcularInfluenciaSpecular( forcaLuz );
        const influenciaIntensidade  =  this.calcularInfluenciaIntensidade( forcaLuz );

        // Cores
        const influenciaCores        =  this.calcularInfluenciaCores( forcaLuz );
        const influenciaVermelho     =  influenciaCores[0];
        const influenciaVerde        =  influenciaCores[1];
        const influenciaAzul         =  influenciaCores[2];

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