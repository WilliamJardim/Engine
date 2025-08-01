import Position3D from "../interfaces/main_engine/Position3D";
import LightConfig from "../interfaces/main_engine/LightConfig";
import { float } from "../types/types-cpp-like";
import PropriedadesLuz from "../interfaces/render_engine/PropridadesLuz";

/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export class LightInstance
{
    public tipo            : string;
    public propriedadesLuz : LightConfig;
    public position        : Position3D;
    public raio            : float;
    public brilho          : float;
    public ambient         : float;
    public diffuse         : float;
    public specular        : float;
    public cor             : Array<float>;
    public intensidade     : float;
    
    public name:string;
    public id:string;

    constructor( propriedadesLuz:LightConfig )
    {
        this.tipo = "Light";
        this.propriedadesLuz = propriedadesLuz;

        this.name        = propriedadesLuz.name || "luz";
        this.id          = (this.name) + String(new Date().getTime());
        this.position    = propriedadesLuz.position;
        this.raio        = propriedadesLuz.raio;
        this.brilho      = propriedadesLuz.brilho;
        this.ambient     = propriedadesLuz.ambient;
        this.diffuse     = propriedadesLuz.diffuse ;
        this.specular    = propriedadesLuz.specular;
        this.cor         = propriedadesLuz.cor;
        this.intensidade = propriedadesLuz.intensidade;
    }

    // Converte o objeto para um objeto mais simples, pra poder usar no meu mini renderizador webgl
    getPropriedadesLuz(): PropriedadesLuz
    {
        const tipo        : string        = this.tipo;
        const name        : string        = this.name;
        const id          : string        = this.id;
        const position    : Position3D    = this.position;
        const raio        : float         = this.raio;
        const brilho      : float         = this.brilho;
        const ambient     : float         = this.ambient;
        const diffuse     : float         = this.diffuse;
        const specular    : float         = this.specular;
        const cor         : Array<float>  = this.cor;
        const intensidade : float         = this.intensidade;

        return {
            tipo        : tipo,
            name        : name,
            id          : id,
            position    : position,
            raio        : raio,
            brilho      : brilho,
            ambient     : ambient,
            diffuse     : diffuse,
            specular    : specular,
            cor         : cor,
            intensidade : intensidade
        }
    }
}