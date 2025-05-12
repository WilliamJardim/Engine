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