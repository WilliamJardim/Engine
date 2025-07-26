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

export default interface VerticesParteOBJ
{
    vertice       : Array<float>;    // Os valores X, Y e Z do vertice
    indiceVertice : float;           // O indice do vertice no array de vertices,
    nomeParte     : string;          // O nome da parte do modelo a qual este vertice pertence
}