/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import AbstractObjectBase from "../../core/AbstractObjectBase";
import ObjectPosition     from "../../interfaces/main_engine/ObjectPosition";
import DistanciaEixos     from "../../interfaces/main_engine/DistanciaEixos";
import { float, Ponteiro }       from "../../types/types-cpp-like";

/**
* Calcula a distancia entre dois objetos:
* 
* @param objA - Object 1
* @param objB - Object 2
* @param consideraEscala - Se vai levar em conta a escala X, Y e Z dos objetos ou não
* @param usaValorAbsoluto - Se vai usar o Math.abs ou não
* @returns {DistanciaEixos}
*/
export default function getDistance( objA:Ponteiro<AbstractObjectBase>, 
                                     objB:Ponteiro<AbstractObjectBase>, 
                                     consideraEscala:boolean=true, 
                                     usaValorAbsoluto:boolean=true 
): DistanciaEixos {

    //Se os ponteiros não forem nulos
    if( objA != null && objB != null )
    {
      /**
       * Informações do objeto 1
       * Coordenadas e escala
       */
      const object1_position : ObjectPosition  = objA.getRepresentacaoMesh().position,
            X_object1        : float           = object1_position.x,
            Y_object1        : float           = object1_position.y,
            Z_object1        : float           = object1_position.z;

      const object1_scale    : ObjectPosition  = objA.getRepresentacaoMesh().scale,
            scaleX_object1   : float           = object1_scale.x,
            scaleY_object1   : float           = object1_scale.y,
            scaleZ_object1   : float           = object1_scale.z;


      /**
       * Informações do objeto 2 
       * Coordenadas e escala
       */
      const object2_position : ObjectPosition  = objB.getRepresentacaoMesh().position,
            X_object2        : float           = object2_position.x,
            Y_object2        : float           = object2_position.y,
            Z_object2        : float           = object2_position.z;

      const object2_scale    : ObjectPosition  = objB.getRepresentacaoMesh().scale,
            scaleX_object2   : float           = object2_scale.x,
            scaleY_object2   : float           = object2_scale.y,
            scaleZ_object2   : float           = object2_scale.z;

      /**
       * Calculando a distancia para cada eixo 
       */
      const distX : float = (X_object1 + (consideraEscala ? scaleX_object1 : 0) ) - (X_object2 + (consideraEscala ? scaleX_object2 : 0) );
      const distY : float = (Y_object1 + (consideraEscala ? scaleY_object1 : 0) ) - (Y_object2 + (consideraEscala ? scaleY_object2 : 0) );
      const distZ : float = (Z_object1 + (consideraEscala ? scaleZ_object1 : 0) ) - (Z_object2 + (consideraEscala ? scaleZ_object2 : 0) );

      /**
       * Retorna a distancia dos tres eixos: X, Y e Z 
       */
      return { 
            x: usaValorAbsoluto ? Math.abs(distX) : distX,
            y: usaValorAbsoluto ? Math.abs(distY) : distY,
            z: usaValorAbsoluto ? Math.abs(distZ) : distZ

      }

    }else{
      throw Error("OBJETOS NÂO PODEM SER PONTEIROS NULOS");
    }
}