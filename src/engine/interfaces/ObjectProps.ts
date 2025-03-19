import * as THREE from 'three';
import ObjectPosition from "./ObjectPosition";
import ObjectRotation from "./ObjectRotation";
import ObjectScale from "./ObjectScale";
import ObjectEvents from './ObjectEvents';

export default interface ObjectProps{
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
    ignoreCollisions?: Array<string>,
    invisible?: boolean,
    opacity?: number,
    events?: ObjectEvents[]
}