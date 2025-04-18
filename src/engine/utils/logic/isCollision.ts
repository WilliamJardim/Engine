import * as THREE from 'three';
import ObjectBase from "../../core/ObjectBase";
import ProximityBounds from '../interfaces/ProximityBounds';

/**
* Verifica se dois objetos estão colidindo:
* 
* @param objA - Object 1
* @param objB - Object 2 
* @returns {boolean} - Se está colidindo ou não
*/
export default function isCollision(objA:any, objB:any, limites: ProximityBounds|number = 0): boolean{
 
    const getLimite = (eixo: 'x' | 'y' | 'z'): number => {
       //Se o limites for um numero, todos os eixos tem o mesmo valor
       if (typeof limites === 'number'){
            return limites;
       }

       const valor = limites[eixo];
       return typeof valor === 'number' ? valor : 0;
    };

    // Bounding boxes de ambos os objetos
    const posA   : THREE.Vector3  = objA.getPosition();
    const scaleA : THREE.Vector3  = objA.getScale();

    const posB   : THREE.Vector3  = objB.getPosition();
    const scaleB : THREE.Vector3  = objB.getScale();

    // Zona do objeto atual
    const minA = { 
                   x: posA.x - (scaleA.x / 2) - getLimite('x'),
                   y: posA.y - (scaleA.y / 2) - getLimite('y'),
                   z: posA.z - (scaleA.z / 2) - getLimite('z')
                 };

    const maxA = { 
                   x: posA.x + (scaleA.x / 2) + getLimite('x'), 
                   y: posA.y + (scaleA.y / 2) + getLimite('y'),
                   z: posA.z + (scaleA.z / 2) + getLimite('z'), 
                 };

    // Zona do objeto colisor, cujo objeto atual esta intersectando
    const minB = { 
                   x: posB.x - scaleB.x / 2, 
                   y: posB.y - scaleB.y / 2,
                   z: posB.z - scaleB.z / 2
                 };

    const maxB = { 
                   x: posB.x + scaleB.x / 2,
                   y: posB.y + scaleB.y / 2, 
                   z: posB.z + scaleB.z / 2
                 };

    const sobreposicaoX:number = Math.min(maxA.x, maxB.x) - Math.max(minA.x, minB.x);
    const sobreposicaoY:number = Math.min(maxA.y, maxB.y) - Math.max(minA.y, minB.y);
    const sobreposicaoZ:number = Math.min(maxA.z, maxB.z) - Math.max(minA.z, minB.z);

    // Se houver sobreposição em algum dos eixos então houve colisão
    if (sobreposicaoX > 0 && sobreposicaoY > 0 && sobreposicaoZ > 0) 
    {
      return true;
    }

    return false;
}