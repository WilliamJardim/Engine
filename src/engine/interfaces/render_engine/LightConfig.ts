/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import Position3D from "../main_engine/Position3D";

export default interface LightConfig{
    position    : Position3D;
    raio        : number;
    brilho      : number;
    ambient     : number;
    diffuse     : number;
    specular    : number;
    cor         : Array<number>;
    intensidade : number  
}