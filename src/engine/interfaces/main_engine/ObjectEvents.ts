import { Ponteiro } from "../../types/types-cpp-like";

/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export default interface ObjectEvents
{
    whenCollide    : Ponteiro<Function>,
    whenProximity  : Ponteiro<Function>,
    whenDestroy    : Ponteiro<Function>,
    whenFall       : Ponteiro<Function>,
    loop           : Ponteiro<Function>,
}

/**
* OBS: Todos são Function mais tambem são ponteiros, pois nem todas precisam existir,
* algumas podem ser nulas, e serem ignoradas na logica dos eventos da Engine 
*/