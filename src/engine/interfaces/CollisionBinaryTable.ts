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
import Mapa from "../utils/dicionarios/Mapa";

export default interface CollisionBinaryTable{
    byName    : Mapa<string, Mapa<string, boolean> >, // byName[nomeObjetoAlvo] = outra sub-tabela de nomes de objetos colidindo com ele
    byID      : Mapa<string, Mapa<string, boolean> >, // byName[idObjetoAlvo] = outra sub-tabela de nomes de objetos colidindo com ele
    byClasses : Mapa<string, Mapa<string, boolean> >  // byClasses[classeObjetoAlvo] = outra sub-tabela de nomes de objetos colidindo com ele
}