/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { float } from "../../types/types-cpp-like";
import Position3D from "../main_engine/Position3D";

export default interface VisualMeshConfig{
    nome                      : string;
    classe                    : string;
    tipo                      : string;
    position                  : Position3D;
    scale                     : Position3D;
    rotation                  : Position3D;
    renderizavel              : boolean;
    invisivel                 : boolean;
    transparencia             : float;

    // Iluminação
    alwaysUpdateLights        : boolean;
    childrenIndividualLights  : boolean;
    useAccumulatedLights      : boolean;
    staticAccumulatedLights   : boolean;

    brilho              : float;
    ambient             : float;
    diffuse             : float;
    specular            : float;

    corLuzObjeto         : Array<float>;
    intensidadeLuzObjeto : float;
   
    // Parametros especificos para o Mesh/OBJMesh.ts
    mtlString            : string;
    objString            : string;

    // Parametros especificos do Mesh/PlanoOnduladoMesh.ts
    usarOndulacao        : boolean;
    usarOndulacaoSimples : boolean;

    // Parametros do Mesh/TexturedFacesCuboMesh.ts
    useColors            : boolean;
    texturasFaces        : Array<WebGLTexture>;

    // Parametros do Mesh/TexturedUVCubeMesh.ts
    texturaUV            : WebGLTexture;
}