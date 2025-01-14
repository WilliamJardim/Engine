import * as THREE from 'three';

export default function createCube( materialToCreate: THREE.MeshStandardMaterial | null ): THREE.Mesh{
     // Criar um cubo
     const geometry = new THREE.BoxGeometry();
     const material = !materialToCreate ? new THREE.MeshBasicMaterial({ color: 0x00ff00 }) : materialToCreate;
     const cube = new THREE.Mesh(geometry, material);

     return cube;
}