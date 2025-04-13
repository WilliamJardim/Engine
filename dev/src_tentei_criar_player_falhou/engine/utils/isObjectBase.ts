import ObjectBase from "../core/ObjectBase";

export default function isObjectBase(objeto: any): objeto is ObjectBase {
    return typeof objeto.getMesh === 'function';
}