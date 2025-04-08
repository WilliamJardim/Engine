import * as THREE from 'three';
import ObjectPosition from "./ObjectPosition";
import ObjectRotation from "./ObjectRotation";
import ObjectScale from "./ObjectScale";
import ObjectEvents from './ObjectEvents';
import ProximityBounds from '../utils/interfaces/ProximityBounds';

export default interface ObjectProps{
    //Aceita acessar indicies
    [key: string]: any;

    material?: THREE.MeshStandardMaterial | null,
    name?:string,
    classes?:string[],
    isNPC?: boolean,
    havePhysics?: boolean,
    weight?: number,
    position?: ObjectPosition,
    rotation?: ObjectRotation,
    scale?: ObjectScale,
    collide?: boolean,
    collisionEvents?: boolean, //Se vai receber eventos de colisão mesmo que ele não colida fisicamente
    traverse?: boolean, //Se o objeto pode simplismente passar atravez de outros objetos(ignora a fisica)
    ignoreCollisions?: Array<string>,
    proximityConfig?:ProximityBounds|number,
    invisible?: boolean,
    opacity?: number,
    events?: ObjectEvents[]
}