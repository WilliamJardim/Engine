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

// Função de rastreamento dos objetos que o cursor está apontando
export function TrackCrosshair( scene: THREE.Scene, 
                                camera: THREE.PerspectiveCamera,
                                crosshair: Crosshair,
                                raycaster: THREE.Raycaster,
                                mousePosition: THREE.Vector2 ){

    raycaster.setFromCamera(mousePosition, camera);
  
    //Copia algumas coisas uteis
    crosshair.raycaster = raycaster;
    crosshair.scene = scene;
    crosshair.camera = camera;
    crosshair.mousePosition = mousePosition;

    // Verificar interseções com objetos na cena
    const intersects = raycaster.intersectObjects(scene.children, true); // true para verificar filhos
  
    // Ignorar o crosshair
    const validIntersections = intersects.filter(intersect => intersect.object.uuid !== crosshair.uuid);

    if (validIntersections.length > 0) {
      const target = validIntersections[0].object;
      //Armazena o target
      crosshair.target = target;
    }
  };