//Importações
import * as THREE from 'three';
import createTexturedObject from './utils/createTexturedObject';
import createMaterialByImage from './utils/createMaterialByImage';
import createCube from './utils/createCube';

export function EngineMain( scene: THREE.Scene ): void
{
    
    //Cria um cubo simples para testar
    scene.add(
        createCube( 
            createMaterialByImage('/textures/1piso.png') 
        )
    );

}