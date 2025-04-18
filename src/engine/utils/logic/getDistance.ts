import DistanciaEixos from "../interfaces/DistanciaEixos";

/**
* Calcula a distancia entre dois objetos:
* 
* @param objA - Object 1
* @param objB - Object 2
* @param consideraEscala - Se vai levar em conta a escala X, Y e Z dos objetos ou não
* @param usaValorAbsoluto - Se vai usar o Math.abs ou não
* @returns {DistanciaEixos}
*/
export default function getDistance( objA:any, objB:any, consideraEscala:boolean=true, usaValorAbsoluto:boolean=true ): DistanciaEixos {

    /**
    * Informações do objeto 1
    * Coordenadas e escala
    */
    const object1_position : any        = objA.getMesh().position,
          X_object1        : number     = object1_position.x,
          Y_object1        : number     = object1_position.y,
          Z_object1        : number     = object1_position.z;

    const object1_scale    : any        = objA.getMesh().scale,
          scaleX_object1   : number     = object1_scale.x,
          scaleY_object1   : number     = object1_scale.y,
          scaleZ_object1   : number     = object1_scale.z;


    /**
    * Informações do objeto 2 
    * Coordenadas e escala
    */
    const object2_position : any        = objB.getMesh().position,
          X_object2        : number     = object2_position.x,
          Y_object2        : number     = object2_position.y,
          Z_object2        : number     = object2_position.z;

    const object2_scale    : any        = objB.getMesh().scale,
          scaleX_object2   : number     = object2_scale.x,
          scaleY_object2   : number     = object2_scale.y,
          scaleZ_object2   : number     = object2_scale.z;

    /**
    * Calculando a distancia para cada eixo 
    */
    const distX:number = (X_object1 + (consideraEscala ? scaleX_object1 : 0) ) - (X_object2 + (consideraEscala ? scaleX_object2 : 0) );
    const distY:number = (Y_object1 + (consideraEscala ? scaleY_object1 : 0) ) - (Y_object2 + (consideraEscala ? scaleY_object2 : 0) );
    const distZ:number = (Z_object1 + (consideraEscala ? scaleZ_object1 : 0) ) - (Z_object2 + (consideraEscala ? scaleZ_object2 : 0) );

    /**
    * Retorna a distancia dos tres eixos: X, Y e Z 
    */
    return { 
        x: usaValorAbsoluto ? Math.abs(distX) : distX,
        y: usaValorAbsoluto ? Math.abs(distY) : distY,
        z: usaValorAbsoluto ? Math.abs(distZ) : distZ

    } as DistanciaEixos
    
}