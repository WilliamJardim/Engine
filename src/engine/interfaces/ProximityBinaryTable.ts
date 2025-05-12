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
import { BinaryMap } from "../types/BinaryMap";

export default interface ProximityBinaryTable{
    byName    : Record<string, Record<string, boolean> >, // byName[nomeObjetoAlvo] =  outra sub-tabela de objetos colidindo com ele
    byID      : Record<string, Record<string, boolean> >, // byName[idObjetoAlvo] =  outra sub-tabela  de objetos colidindo com ele
    byClasses : Record<string, Record<string, boolean> >  // byClasses[classeObjetoAlvo] =  outra sub-tabela  de objetos colidindo com ele
}