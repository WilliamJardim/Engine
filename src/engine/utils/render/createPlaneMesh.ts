import * as THREE from 'three';
import ObjectBase from '../../core/ObjectBase';
import ObjectProps from '../../interfaces/ObjectProps';

export default function createPlaneMesh( objProps:ObjectProps ): THREE.Mesh{
     // Criar um cubo
     const geometry = new THREE.PlaneGeometry();
     
     const materialToCreate:THREE.MeshStandardMaterial | null | undefined = objProps.material;

     const material = !materialToCreate ? new THREE.MeshBasicMaterial({ color: 0x00ff00 }) : materialToCreate;
     const plane = new THREE.Mesh(geometry, material);

     //Se tem posição
     if( objProps.position ){
         plane.position.x = objProps.position.x || 0;
         plane.position.y = objProps.position.y || 0;
         plane.position.z = objProps.position.z || 0;
     }
     //Se tem rotação
     if( objProps.rotation ){
         plane.rotation.x = objProps.rotation.x || 0;
         plane.rotation.y = objProps.rotation.y || 0;
         plane.rotation.z = objProps.rotation.z || 0;
     }
     //Se tem escala
     if( typeof objProps.scale == 'object' && objProps.scale ){
         plane.scale.x = objProps.scale.x || 0;
         plane.scale.y = objProps.scale.y || 0;
         plane.scale.z = objProps.scale.z || 0;
     }

     return plane;
}