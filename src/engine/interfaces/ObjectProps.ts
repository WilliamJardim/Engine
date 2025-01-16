import * as THREE from 'three';
import ObjectPosition from "./ObjectPosition";
import ObjectRotation from "./ObjectRotation";
import ObjectScale from "./ObjectScale";

export default interface ObjectProps{
    material?: THREE.MeshStandardMaterial | null,
    name?:string,
    isNPC?: boolean,
    havePhysics?: boolean,
    weight?: number,
    position?: ObjectPosition,
    rotation?: ObjectRotation,
    scale?: ObjectScale,
    collide?: boolean,
    invisible?: boolean,
    opacity?: number
}