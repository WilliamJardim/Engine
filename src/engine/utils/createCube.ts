import ObjectBase from "../core/ObjectBase";
import MeshRepresentation from "../interfaces/MeshRepresentation";
import ObjectPosition from "../interfaces/ObjectPosition";
import ObjectProps from "../interfaces/ObjectProps";
import ObjectRotation from "../interfaces/ObjectRotation";
import ObjectScale from "../interfaces/ObjectScale";

export default function createCube( objProps:ObjectProps ): ObjectBase{
    const propsObjeto = {...objProps} as ObjectProps;

    const meshRepresentation:MeshRepresentation = {
        position : objProps.position             || {} as ObjectPosition,
        scale    : objProps.scale as ObjectScale || {} as ObjectScale,
        rotation : objProps.rotation             || {} as ObjectRotation
    }

    //Diz que é um cubo
    propsObjeto.type = 'Cube';

    return new ObjectBase( meshRepresentation, propsObjeto );
}