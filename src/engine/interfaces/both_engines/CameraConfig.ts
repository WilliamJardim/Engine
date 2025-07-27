/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { float } from "../../types/types-cpp-like";
import Position3D from "../main_engine/Position3D";

export default interface ConfigCamera
{
    nome                 : string;
    miraCamera           : Position3D;
    posicaoCamera        : Position3D;
    sensibilidade        : float;
    limiteMiraCimaBaixo  : float
    passosAndar          : float;
}