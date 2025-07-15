/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import AbstractObjectBase  from "../../core/AbstractObjectBase";
import ObjectBase          from "../../core/ObjectBase";
import Mapa                from "../../utils/dicionarios/Mapa";
import { Ponteiro }        from "../../types/types-cpp-like";

export default interface CollisionTable
{
    byName    : Mapa<string, Array<Ponteiro<AbstractObjectBase>>>, // byName[nomeObjetoAlvo] = lista de objetos colidindo com ele
    byID      : Mapa<string, Array<Ponteiro<AbstractObjectBase>>>, // byName[idObjetoAlvo] = lista de objetos colidindo com ele
    byClasses : Mapa<string, Array<Ponteiro<AbstractObjectBase>>>  // byClasses[classeObjetoAlvo] = lista de objetos colidindo com ele
}