/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { float } from "../../../types/types-cpp-like";
import Mapa from "../../../utils/dicionarios/Mapa";
import ObjectPosition from "../ObjectPosition";
import ObjectScale from "../ObjectScale";
import ItemInformacoes from "./inventario/ItemInformacoes";

/**
* Atributos na hora de criar uma instancia de jogador 
*/
export default interface PlayerProps
{
    nome            : string;
    objectType      : string; // Por padrão o jogador vai ser um cubo, mais pode ser um modelo OBJ tambem
    rotation        : ObjectPosition;
    position        : ObjectPosition;
    scale           : ObjectScale;
    scaleReduce     : ObjectScale;
    vidaMaxima      : float;
    vida            : float;
    estaminaMaxima  : float;
    estamina        : float;
    inventario      : Mapa<string, ItemInformacoes>,
    enable_advanced_frame_tracking: boolean;
    opacity         : float;
    isInvisible     : boolean;
}