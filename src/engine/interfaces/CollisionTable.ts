/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectBase from "../core/ObjectBase";

export default interface CollisionTable{
    byName    : Record<string, Array<ObjectBase>>, // byName[nomeObjetoAlvo] = lista de objetos colidindo com ele
    byID      : Record<string, Array<ObjectBase>>, // byName[idObjetoAlvo] = lista de objetos colidindo com ele
    byClasses : Record<string, Array<ObjectBase>>  // byClasses[classeObjetoAlvo] = lista de objetos colidindo com ele
}