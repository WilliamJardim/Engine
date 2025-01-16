import * as THREE from 'three';
import ObjectBase from '../core/ObjectBase';
import ObjectProps from '../interfaces/ObjectProps';

export default function createCube( materialToCreate: THREE.MeshStandardMaterial | null,
                                    objProps:ObjectProps 
): ObjectBase{
     // Criar um cubo
     const geometry = new THREE.BoxGeometry();
     const material = !materialToCreate ? new THREE.MeshBasicMaterial({ color: 0x00ff00 }) : materialToCreate;
     const cube = new THREE.Mesh(geometry, material);

     return new ObjectBase(cube);
}