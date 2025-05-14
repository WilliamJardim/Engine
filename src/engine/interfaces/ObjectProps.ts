/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import * as THREE from 'three';
import ObjectPosition from "./ObjectPosition";
import ObjectRotation from "./ObjectRotation";
import ObjectScale from "./ObjectScale";
import ObjectEvents from './ObjectEvents';
import ProximityBounds from '../utils/interfaces/ProximityBounds';
import ObjectAttachment from './ObjectAttachment';

export default interface ObjectProps{
    //Aceita acessar indicies
    [key: string]: any;

    material?: THREE.MeshStandardMaterial | null,
    type: string, //Se é cubo, plano, esfera, ou modelo personalizado
    name?:string,
    classes?:string[],
    isNPC?: boolean,
    havePhysics?: boolean,
    weight?: number,
    position?: ObjectPosition,
    rotation?: ObjectRotation,
    scale?: ObjectScale|number,
    collide?: boolean,
    collisionEvents?: boolean, //Se vai receber eventos de colisão mesmo que ele não colida fisicamente
    traverse?: boolean, //Se o objeto pode simplismente passar atravez de outros objetos(ignora a fisica)
    ignoreCollisions?: Array<string>,
    proximityConfig?:ProximityBounds|number,
    invisible?: boolean,
    opacity?: number,
    events?: ObjectEvents[],
    kick_rate?: number,

    onCreate?:Function|null;

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
    attachments?: Array<string|ObjectAttachment>,
}