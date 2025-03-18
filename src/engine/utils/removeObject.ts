import * as THREE from 'three';
import ObjectBase from "../core/ObjectBase";
import Scene from "../core/Scene";

/**
* Apaga um objeto da cena
* @param {ObjectBase} objeto 
* @param {Scene} scene 
*/
export default function removeObject(objeto:ObjectBase, scene:Scene) {
    if (!objeto || !scene) return;
  
    // Função recursiva para remover materiais e geometrias
    const disposeRecursivo = (obj:THREE.Mesh) => {
      if (obj.isMesh) 
      {
        if (obj.geometry){
            obj.geometry.dispose();
        }

        if (Array.isArray(obj.material)) {
          obj.material.forEach(function(material:any){
            material.dispose()
          });

        } else if (obj.material) {
          obj.material.dispose();
        }
      }

      if (obj.children.length > 0) {
        obj.children.forEach(function(child:any){
            disposeRecursivo(child)
        });
      }
    };
  
    disposeRecursivo( objeto.getMesh() );
    scene.scene.remove( objeto.getMesh() );
  }
  