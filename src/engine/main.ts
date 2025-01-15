//Importações
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import createTexturedObject from './utils/createTexturedObject';
import createMaterialByImage from './utils/createMaterialByImage';
import createCube from './utils/createCube';

export function EngineMain( scene: THREE.Scene, 
                            camera: THREE.PerspectiveCamera, 
                            cameraControls: PointerLockControls 
): void{
    
    //Cria um cubo simples para testar
    scene.add(
        createCube( 
            createMaterialByImage('/textures/1piso.png') 
        )
    );

}

/** Loop que vai ser executado a todo momento */
export default function EngineLoop( scene: THREE.Scene, 
                                    camera: THREE.PerspectiveCamera, 
                                    cameraControls: PointerLockControls 
): void{

}