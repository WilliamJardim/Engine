/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectPosition    from "./ObjectPosition";
import ObjectRotation    from "./ObjectRotation";
import ObjectScale       from "./ObjectScale";
import ObjectEvents      from './ObjectEvents';
import ProximityBounds   from './ProximityBounds';
import ObjectAttachment  from './ObjectAttachment';
import { Ponteiro }      from '../../types/types-cpp-like';

export default interface ObjectProps
{
    mass             : number; //A massa do objeto
    type             : string, //Se é cubo, plano, esfera, ou modelo personalizado
    obj              : string,  // Se for um objeto OBJ vai ter o caminho dele
    mtl              : string,  // Se for um objeto OBJ vai ter o caminho do mtl dele
    name             : string,
    classes          : Array<string>,
    havePhysics      : boolean,
    position         : ObjectPosition,
    rotation         : ObjectRotation,
    scale            : ObjectScale,
    scaleReduce      : ObjectScale,
    collide          : boolean,
    collisionEvents  : boolean, //Se vai receber eventos de colisão mesmo que ele não colida fisicamente
    podeAtravessar   : boolean, //Se o objeto pode simplismente passar atravez de outros objetos(ignora a fisica)
    ignoreCollisions : Array<string>,
    proximityConfig  : ProximityBounds,
    isInvisible      : boolean,

    // Iluminação do mini renderizador webgl
    childrenIndividualLights : boolean,
    useAccumulatedLights     : boolean,
    staticAccumulatedLights  : boolean,

    opacity          : number,
    events           : Array<ObjectEvents>,
    kick_rate        : number,

    enable_advanced_frame_tracking : boolean, //Se ativado, vai capturar os dados do objeto a cada frame. Por padrão é ativado

    onCreate         : Ponteiro<Function>;

    /**
    * Define quais objetos da cena vão estar grudados/anexados a este objeto
    * Uma lista de objetos que vão estar "grudados" no objeto atual. Pode ser um Array de strings ou de ObjectAttachment(s)
    * 
    * @prop {ObjectPosition} position - Posição do anexo em relação ao objeto atual
    * @prop {ObjectScale} scale - Nova escala do anexo
    * 
    * @example
    * attachments: [
            { 
                name: 'MyCube', 
                position: {z: 8},
                sameScale: false, 
                scale: {x: 9, y: 9, z: 9},
                scaleReduce: { x: -5, y: -5, z: -5 }
            },
            ...
        ]
    */
    attachments     : Array<ObjectAttachment>,
}