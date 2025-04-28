import * as THREE from 'three';

// Função para carregar textura e criar um objeto 3D (cubo ou plano)
export default function createTexturedObject(
  texturePath: string,                         // Caminho da textura
  geometry: THREE.BufferGeometry               // Geometria do objeto
): THREE.Mesh {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(texturePath);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2); // Repetir a textura 2x em cada eixo

  // Criar o material com a textura carregada
  const material = new THREE.MeshStandardMaterial({ map: texture });

  // Criar o objeto 3D com a geometria e o material
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}