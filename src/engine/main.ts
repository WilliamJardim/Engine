//Importações
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import createTexturedObject from './utils/createTexturedObject';
import createMaterialByImage from './utils/createMaterialByImage';
import createCube from './utils/createCube';

/** Função que vai ser executada quanto a Engine for iniciada */
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


/** Loop que vai ser executado ANTES da função de atualização */
export function EngineBeforeLoop( scene: THREE.Scene, 
    camera: THREE.PerspectiveCamera, 
    cameraControls: PointerLockControls 
): void{

}

/** Loop que vai ser executado a todo momento depois que a função de atualização rodar */
export function EngineLoop( scene: THREE.Scene, 
                                    camera: THREE.PerspectiveCamera, 
                                    cameraControls: PointerLockControls 
): void{

}