import { float } from "../../types/types-cpp-like";

/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export default interface MapDefinition
{
    id:string; // ID do mapa
    nome:string; // Nome do mapa
    renderizado:boolean; // Se o mapa já foi jogado ou não(renderizado pelo meu mini renderizador)
    largura:float; // A lagura mais alta( do espaço ocupado pelos objetos )
    altura:float;  // A altura mais alta( do espaço ocupado pelos objetos )
}