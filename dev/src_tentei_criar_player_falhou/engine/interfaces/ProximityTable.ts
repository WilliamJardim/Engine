import ObjectBase from "../core/ObjectBase";

export default interface CollisionTable{
    byName    : Record<string, Array<ObjectBase>>, // byName[nomeObjetoAlvo] = lista de objetos colidindo com ele
    byID      : Record<string, Array<ObjectBase>>, // byName[idObjetoAlvo] = lista de objetos colidindo com ele
    byClasses : Record<string, Array<ObjectBase>>  // byClasses[classeObjetoAlvo] = lista de objetos colidindo com ele
}