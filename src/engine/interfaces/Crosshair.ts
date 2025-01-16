import * as THREE from 'three';
import { GameCamera } from '../core/GameCamera';

export default interface Crosshair extends THREE.Mesh{
    target?: THREE.Object3D,
    raycaster?: THREE.Raycaster,
    intersects?: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]
    scene?: THREE.Scene,
    camera?: GameCamera,
    mousePosition?: THREE.Vector2
}