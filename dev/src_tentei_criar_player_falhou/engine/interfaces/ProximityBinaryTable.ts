import ObjectBase from "../core/ObjectBase";
import { BinaryMap } from "../types/BinaryMap";

export default interface ProximityBinaryTable{
    byName    : Record<string, Record<string, boolean> >, // byName[nomeObjetoAlvo] =  outra sub-tabela de objetos colidindo com ele
    byID      : Record<string, Record<string, boolean> >, // byName[idObjetoAlvo] =  outra sub-tabela  de objetos colidindo com ele
    byClasses : Record<string, Record<string, boolean> >  // byClasses[classeObjetoAlvo] =  outra sub-tabela  de objetos colidindo com ele
}