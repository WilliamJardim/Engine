import * as THREE from 'three';

export default interface Crosshair extends THREE.Mesh{
    target?: THREE.Object3D,
    raycaster?: THREE.Raycaster,
    intersects?: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]
    scene?: THREE.Scene,
    camera?: THREE.Camera,
    mousePosition?: THREE.Vector2
}