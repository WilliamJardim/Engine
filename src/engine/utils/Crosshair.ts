import * as THREE from 'three';
import Crosshair from '../interfaces/Crosshair';

export default function createCrosshair(): Crosshair{
    const crosshairSize = 0.02; // Tamanho do cursor no mundo
    const geometry = new THREE.PlaneGeometry(crosshairSize, crosshairSize);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        side: THREE.DoubleSide,
        transparent: false
    });
    const crosshair = new THREE.Mesh(geometry, material);
  
    return crosshair;
};

//Atualiza a posição do Crosshair
export function UpdateCrosshair( scene: THREE.Scene, 
                                 camera: THREE.PerspectiveCamera,
                                 crosshair: Crosshair
): void{
    crosshair.position.copy(camera.position);
    crosshair.quaternion.copy(camera.quaternion);
    crosshair.translateZ(-1); // Mantém o crosshair sempre 2 unidades à frente da câmera
}