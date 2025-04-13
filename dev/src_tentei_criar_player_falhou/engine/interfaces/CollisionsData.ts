import ObjectBase from "../core/ObjectBase";

export default interface CollisionsData{
    objectNames: string[];
    objectIDs: string[];
    objectClasses: string[];
    objects: ObjectBase[];
}