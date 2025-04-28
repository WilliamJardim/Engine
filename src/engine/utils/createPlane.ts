import ObjectBase from "../core/ObjectBase";
import ObjectProps from "../interfaces/ObjectProps";

export default function createPlane( objProps:ObjectProps ): ObjectBase{
    const propsObjeto = {...objProps} as ObjectProps;

    //Diz que é um cubo
    propsObjeto.type = 'Plane';

    return new ObjectBase( propsObjeto );
}