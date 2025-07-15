/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import Position3D from "../main_engine/Position3D";

export default interface PlanoOnduladoMeshConfig{
    nome                      : string;
    classe                    : string;
    tipo                      : string;
    position                  : Position3D;
    scale                     : Position3D;
    rotation                  : Position3D;
    invisivel                 : boolean;
    transparencia             : number;

    // Iluminação
    alwaysUpdateLights        : boolean;
    childrenIndividualLights  : boolean;
    useAccumulatedLights      : boolean;
    staticAccumulatedLights   : boolean;

    brilho              : number;
    ambient             : number;
    diffuse             : number;
    specular            : number;

    corLuzObjeto         : Array<number>;
    intensidadeLuzObjeto : number;

    // Parametros especificos do Mesh/PlanoOnduladoMesh.ts
    usarOndulacao        : boolean;
    usarOndulacaoSimples : boolean;
}