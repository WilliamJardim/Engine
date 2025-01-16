//Importações
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import createTexturedObject from './utils/createTexturedObject';
import createMaterialByImage from './utils/createMaterialByImage';
import createCube from './utils/createCube';
import { GameCamera } from './GameCamera';
import ObjectBase from './ObjectBase';

/** Função que vai ser executada quanto a Engine for iniciada */
export function EngineMain( scene: THREE.Scene, 
                            renderer: THREE.WebGLRenderer,
                            canvasRef: React.RefObject<HTMLDivElement>,
                            camera: GameCamera, 
                            cameraControls: PointerLockControls 
): void{
    
    // Cria um cubo simples para testar
    const cubo = createCube( 
        //The material
        createMaterialByImage('/textures/1piso.png'),

        //The attributes
        {
            name: 'MyCube',
            isNPC: false,
            havePhysics: true,
            invisible: false,
            opacity: 1,
            collide: true,
            weight: 40,
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: {
                x: 0,
                y: 0,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            }
        }
    );

    // Adiciona o cubo na cena
    scene.add(
        cubo.getMesh()
    );

    const light = new THREE.AmbientLight(0xffffff, 1); // Luz ambiente
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direcional
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

}


/** Loop que vai ser executado ANTES da função de atualização */
export function EngineBeforeLoop( scene: THREE.Scene, 
                                  renderer: THREE.WebGLRenderer,
                                  canvasRef: React.RefObject<HTMLDivElement>,
                                  camera: GameCamera, 
                                  cameraControls: PointerLockControls 
): void{

}

/** Loop que vai ser executado a todo momento depois que a função de atualização rodar */
export function EngineLoop( scene: THREE.Scene, 
                            renderer: THREE.WebGLRenderer,
                            canvasRef: React.RefObject<HTMLDivElement>,
                            camera: GameCamera, 
                            cameraControls: PointerLockControls 
): void{

}