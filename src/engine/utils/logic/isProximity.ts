import ObjectBase from "../../core/ObjectBase";
import DistanciaEixos from "../interfaces/DistanciaEixos";
import ProximityBounds from "../interfaces/ProximityBounds";
import getDistance from "./getDistance";

/**
* Verifica se dois objetos estão proximos dentro de uma faixa de coordenadas:
* 
* @param objA - Object 1
* @param objB - Object 2 
* @returns {boolean} - Se está colidindo ou não
*/
export default function isProximity(objA:any, objB:any, limites:ProximityBounds|number, consideraEscala:boolean=true, usaValorAbsoluto:boolean=true): boolean{
    
    const distanciaXYZ:DistanciaEixos = getDistance(objA, objB, consideraEscala, usaValorAbsoluto);

    /**
    * Sentido da proximidade 
    */
    let temX = false,
        temY = false,
        temZ = false;

    let apenasX = false,
        apenasY = false,
        apenasZ = false,
        qualquerDirecao = false;

    /**
    * Definir o sentido da verificação de proximidade
    */
    if( typeof limites == 'object' && (limites.x || limites.y || limites.z) )
    {
        if( limites.x ){
            temX = true;
        }
        if( limites.y ){
            temX = true;
        }
        if( limites.z ){
            temX = true;
        }

        if( (temX && (temY || temZ)) ||
            (temY && (temX || temZ)) ||
            (temZ && (temX || temY))
        ){
            qualquerDirecao = true;

        //SENAO
        }else{
            if(temX && (!temY && !temZ)){
                apenasX = true;
            }

            if(temY && (!temX || !temZ)){
                apenasY = true;
            }

            if(temZ && (!temX || !temY)){
                apenasZ = true;
            }
        }

    //Se não foi definido uma direção de verificação, ele considera todas
    }else{
        qualquerDirecao = true;
    }

    /**
    * Lógica de proximidade
    */
    if( qualquerDirecao ){

        if( typeof limites == 'number' && 
            distanciaXYZ.x <= limites &&
            distanciaXYZ.y <= limites &&
            distanciaXYZ.z <= limites
        ){
            return true;

        } else if( typeof limites == 'object' && 
            ( (limites.x && typeof limites.x == 'number' && distanciaXYZ.x <= limites.x) || true ) &&
            ( (limites.y && typeof limites.y == 'number' && distanciaXYZ.y <= limites.y) || true ) &&
            ( (limites.z && typeof limites.z == 'number' && distanciaXYZ.z <= limites.z) || true ) 
        ){  
            return true;
        }

    //Se forem direções especificas
    }else{
        //Se for ter proximidade apenas em X
        if( apenasX ){
            if( typeof limites == 'number' && 
                distanciaXYZ.x <= limites
            ){
                return true;
    
            }else if( typeof limites == 'object' && (limites.x && typeof limites.x == 'number' && distanciaXYZ.x <= limites.x) ){
                return true;
            }
        }

        //Se for ter proximidade apenas em Y
        if( apenasY ){
            if( typeof limites == 'number' && 
                distanciaXYZ.y <= limites
            ){
                return true;
    
            }else if( typeof limites == 'object' && (limites.y && typeof limites.y == 'number' && distanciaXYZ.y <= limites.y) ){
                return true;
            }
        }

        //Se for ter proximidade apenas em Z
        if( apenasZ ){
            if( typeof limites == 'number' && 
                distanciaXYZ.z <= limites
            ){
                return true;
    
            }else if( typeof limites == 'object' && (limites.z && typeof limites.z == 'number' && distanciaXYZ.z <= limites.z) ){
                return true;
            }
        }
    }

    return false;
}