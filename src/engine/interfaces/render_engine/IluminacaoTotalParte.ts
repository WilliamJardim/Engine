/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { float, Ponteiro } from "../../types/types-cpp-like";

export default interface IluminacaoTotalParte
{
    ambientTotal         : float;
    diffuseTotal         : float;
    specularTotal        : float;
    brilhoTotal          : float;
    intensidadeTotal     : float;
    corLuzTotal          : Array<float>;
} 