import ObjectPosition from "./ObjectPosition";
import ObjectRotation from "./ObjectRotation";
import ObjectScale    from "./ObjectScale";

/**
* Apenas uma interface abstrata que representa um mesh
*/
export default interface MeshRepresentation{
    position : ObjectPosition,
    rotation : ObjectRotation,
    scale    : ObjectScale
}