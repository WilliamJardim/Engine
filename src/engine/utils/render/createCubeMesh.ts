import * as THREE from 'three';
import ObjectBase from '../../core/ObjectBase';
import ObjectProps from '../../interfaces/ObjectProps';

export default function createCubeMesh( objProps:ObjectProps ): THREE.Mesh{
     // Criar um cubo
     const geometry = new THREE.BoxGeometry();
     
     const materialToCreate:THREE.MeshStandardMaterial | null | undefined = objProps.material;

     const material = !materialToCreate ? new THREE.MeshBasicMaterial({ color: 0x00ff00 }) : materialToCreate;
     const cube = new THREE.Mesh(geometry, material);

     //Se tem posição
     if( objProps.position ){
         cube.position.x = objProps.position.x || 0;
         cube.position.y = objProps.position.y || 0;
         cube.position.z = objProps.position.z || 0;
     }
     //Se tem rotação
     if( objProps.rotation ){
         cube.rotation.x = objProps.rotation.x || 0;
         cube.rotation.y = objProps.rotation.y || 0;
         cube.rotation.z = objProps.rotation.z || 0;
     }
     //Se tem escala
     if( typeof objProps.scale == 'object' && objProps.scale ){
         cube.scale.x = objProps.scale.x || 0;
         cube.scale.y = objProps.scale.y || 0;
         cube.scale.z = objProps.scale.z || 0;
     }

     return cube;
}