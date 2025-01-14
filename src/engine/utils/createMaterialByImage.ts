import * as THREE from 'three';

// Função para carregar textura e criar um objeto 3D (cubo ou plano)
export default function createMaterialByImage(texturePath: string): THREE.MeshStandardMaterial {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(texturePath);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2); // Repetir a textura 2x em cada eixo

  // Criar o material com a textura carregada
  const material = new THREE.MeshStandardMaterial({ map: texture });

  return material;
}