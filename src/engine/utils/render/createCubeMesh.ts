import * as THREE from 'three';
import ObjectBase from '../../core/ObjectBase';
import ObjectProps from '../../interfaces/ObjectProps';

export default function createCubeMesh( objProps:ObjectProps ): THREE.Mesh{
     // Criar um cubo
     const geometry = new THREE.BoxGeometry();
     
     const materialToCreate:THREE.MeshStandardMaterial | null | undefined = objProps.material;

     const material = !materialToCreate ? new THREE.MeshBasicMaterial({ color: 0x00ff00 }) : materialToCreate;
     const cube = new THREE.Mesh(geometry, material);

     return cube;
}