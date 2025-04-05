import * as THREE from 'three';
import ObjectBase from '../core/ObjectBase';
import ObjectProps from '../interfaces/ObjectProps';

export default function createCube( objProps:ObjectProps 
): ObjectBase{
     // Criar um cubo
     const geometry = new THREE.BoxGeometry();
     
     const materialToCreate:THREE.MeshStandardMaterial | null | undefined = objProps.material;

     const material = !materialToCreate ? new THREE.MeshBasicMaterial({ color: 0x00ff00 }) : materialToCreate;
     const cube = new THREE.Mesh(geometry, material);

     //Se tem escala
     if( objProps.scale ){
          cube.scale.x = objProps.scale.x;
          cube.scale.y = objProps.scale.y;
          cube.scale.z = objProps.scale.z;
     }

     if( objProps.position ){
          cube.position.x = objProps.position.x!;
          cube.position.y = objProps.position.y!;
          cube.position.z = objProps.position.z!;
     }

     return new ObjectBase(cube, objProps);
}