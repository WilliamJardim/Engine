import * as THREE from 'three';

export default interface Crosshair extends THREE.Mesh{
    target?: THREE.Object3D,
    raycaster?: THREE.Raycaster,
    scene?: THREE.Scene,
    camera?: THREE.Camera,
    mousePosition?: THREE.Vector2
}