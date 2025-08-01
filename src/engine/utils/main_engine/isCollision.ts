/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectBase          from "../../core/ObjectBase";
import ProximityBounds     from '../../interfaces/main_engine/ProximityBounds';
import ObjectPosition      from '../../interfaces/main_engine/ObjectPosition';
import ObjectScale         from '../../interfaces/main_engine/ObjectScale';
import { float, Ponteiro }        from "../../types/types-cpp-like";
import AbstractObjectBase  from "../../core/AbstractObjectBase";
import Position3D from "../../interfaces/main_engine/Position3D";

/**
* Verifica se dois objetos estão colidindo:
* 
* @param objA - Object 1
* @param objB - Object 2 
* @returns {boolean} - Se está colidindo ou não
*/
export default function isCollision(objetoA             : Ponteiro<AbstractObjectBase>, 
                                    objetoB             : Ponteiro<AbstractObjectBase>, 
                                    limites             : ProximityBounds,
                                    usarLimitesEmAmbos  : boolean = false
): boolean{
 
    //Se os ponteiros não forem nulos
    if( objetoA != null && objetoB != null )
    {
      // Bounding boxes de ambos os objetos
      const posicaoObjetoA   : ObjectPosition  = objetoA.getPosition();
      const scaleObjetoA     : ObjectScale     = objetoA.getScale();

      const posicaoObjetoB   : ObjectPosition  = objetoB.getPosition();
      const scaleObjetoB     : ObjectScale     = objetoB.getScale();

      // Zona do objeto atual
      const minimoObjetoA : Position3D = { 
                              x: posicaoObjetoA.x - (scaleObjetoA.x / 2) - limites.x,
                              y: posicaoObjetoA.y - (scaleObjetoA.y / 2) - limites.y,
                              z: posicaoObjetoA.z - (scaleObjetoA.z / 2) - limites.z
                           };

      const maximoObjetoA : Position3D = { 
                              x: posicaoObjetoA.x + (scaleObjetoA.x / 2) + limites.x, 
                              y: posicaoObjetoA.y + (scaleObjetoA.y / 2) + limites.y,
                              z: posicaoObjetoA.z + (scaleObjetoA.z / 2) + limites.z, 
                           };

      // Zona do objeto colisor, cujo objeto atual esta intersectando
      const minimoObjetoB : Position3D = {
          x: 0,
          y: 0,
          z: 0
      };

      const maximoObjetoB : Position3D = { 
          x: 0,
          y: 0, 
          z: 0
      };

      // Define se vai ou não usar o limite no segundo objeto tambem
      if( usarLimitesEmAmbos == false )
      {
         // Se não usa, não aplica o limite
         minimoObjetoB.x = posicaoObjetoB.x - (scaleObjetoB.x / 2);
         minimoObjetoB.y = posicaoObjetoB.y - (scaleObjetoB.y / 2);
         minimoObjetoB.z = posicaoObjetoB.z - (scaleObjetoB.z / 2);

         maximoObjetoB.x = posicaoObjetoB.x + (scaleObjetoB.x / 2);
         maximoObjetoB.y = posicaoObjetoB.y + (scaleObjetoB.y / 2);
         maximoObjetoB.z = posicaoObjetoB.z + (scaleObjetoB.z / 2);

      }else{
         // Se usa, Aplica o limite tanto no objeto A quanto no objeto B
         minimoObjetoB.x = posicaoObjetoB.x - (scaleObjetoB.x / 2) - limites.x;
         minimoObjetoB.y = posicaoObjetoB.y - (scaleObjetoB.y / 2) - limites.y;
         minimoObjetoB.z = posicaoObjetoB.z - (scaleObjetoB.z / 2) - limites.z;

         maximoObjetoB.x = posicaoObjetoB.x + (scaleObjetoB.x / 2) + limites.x;
         maximoObjetoB.y = posicaoObjetoB.y + (scaleObjetoB.y / 2) + limites.y;
         maximoObjetoB.z = posicaoObjetoB.z + (scaleObjetoB.z / 2) + limites.z;
      }

      const sobreposicaoX : float  = Math.min(maximoObjetoA.x, maximoObjetoB.x) - Math.max(minimoObjetoA.x, minimoObjetoB.x);
      const sobreposicaoY : float  = Math.min(maximoObjetoA.y, maximoObjetoB.y) - Math.max(minimoObjetoA.y, minimoObjetoB.y);
      const sobreposicaoZ : float  = Math.min(maximoObjetoA.z, maximoObjetoB.z) - Math.max(minimoObjetoA.z, minimoObjetoB.z);

      // Se houver sobreposição em algum dos eixos então houve colisão
      if( sobreposicaoX > 0 && sobreposicaoY > 0 && sobreposicaoZ > 0 ) 
      {
        return true;
      }
    }

    return false;
}