/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import AbstractObjectBase  from "../../core/AbstractObjectBase";
import ObjectBase          from "../../core/ObjectBase";
import DistanciaEixos      from "../../interfaces/main_engine/DistanciaEixos";
import ProximityBounds     from "../../interfaces/main_engine/ProximityBounds";
import getDistance         from "./getDistance";
import { bool, float, Ponteiro }        from "../../types/types-cpp-like";
import ObjectPosition from "../../interfaces/main_engine/ObjectPosition";
import ObjectScale from "../../interfaces/main_engine/ObjectScale";

/**
* Verifica se um objeto está localizado dentro do raio do eixo X, Y ou Z
* NOTA: Aqui coloquei X, mais o mesmo cálculo se aplica para Y e Z
*/
function objetoDentroRaioEixo( 
                               posicaoX_ObjetoA    : float, 
                               escalaX_ObjetoA     : float, 
                               posicaoX_ObjetoB    : float, 
                               escalaX_ObjetoB     : float, 
                               limiteX             : float,
                               usarLimitesEmAmbos  : bool   // Se tiver ativado, ele vai usar os limites tanto no objeto A quanto no objeto B
) : boolean
{
    const centroObjetoA : float  = posicaoX_ObjetoA;
    const centroObjetoB : float  = posicaoX_ObjetoB;

    const metadeEscalaObjetoA : float  = escalaX_ObjetoA / 2;
    const metadeEscalaObjetoB : float  = escalaX_ObjetoB / 2;
    const limiteExtraX        : float  = limiteX;

    let X_minimo_objetoA : float  = centroObjetoA - metadeEscalaObjetoA - limiteExtraX;
    let X_maximo_objetoA : float  = centroObjetoA + metadeEscalaObjetoA + limiteExtraX;

    let X_minimo_objetoB : float  = 0;
    let X_maximo_objetoB : float  = 0;

    // Define se vai ou não usar o limite no segundo objeto tambem
    if( usarLimitesEmAmbos == false ){
        //Se não usa, não aplica o limite
        X_minimo_objetoB = centroObjetoB - metadeEscalaObjetoB;
        X_maximo_objetoB - centroObjetoB + metadeEscalaObjetoB;
    }else{
        // Se usa limite em ambos, aplica no objeto B tambem
        X_minimo_objetoB = centroObjetoB - metadeEscalaObjetoB - limiteExtraX;
        X_maximo_objetoB - centroObjetoB + metadeEscalaObjetoB + limiteExtraX;
    }

    return X_maximo_objetoB >= X_minimo_objetoA == true && 
           X_minimo_objetoB <= X_maximo_objetoA == true;
}

/**
* Verifica se dois objetos estão proximos dentro de uma faixa de coordenadas:
* Leva em conta uma zona de proximidade imaginária entre os objetos
* 
* @param objA - Object 1
* @param objB - Object 2 
* @returns {boolean} - Se está colidindo ou não
*/
export default function isProximity(
    objA                : Ponteiro<AbstractObjectBase>,
    objB                : Ponteiro<AbstractObjectBase>,
    limites             : ProximityBounds,
    usarLimitesEmAmbos  : boolean = false
): boolean {

    //Se os ponteiros não forem nulos
    if( objA != null && objB != null )
    {
        const posicaoObjetoA : ObjectPosition  = objA.getPosition();
        const posicaoObjetoB : ObjectPosition  = objB.getPosition();

        const escalaObjetoA : ObjectScale  = objA.getScale();
        const escalaObjetoB : ObjectScale  = objB.getScale();

        return (
               // No eixo X
               objetoDentroRaioEixo( posicaoObjetoA.x, escalaObjetoA.x, posicaoObjetoB.x, escalaObjetoB.x, limites.x, usarLimitesEmAmbos )  &&  
               // No eixo Y
               objetoDentroRaioEixo( posicaoObjetoA.x, escalaObjetoA.y, posicaoObjetoB.y, escalaObjetoB.y, limites.y, usarLimitesEmAmbos )  &&
               // No eixo Z
               objetoDentroRaioEixo( posicaoObjetoA.z, escalaObjetoA.z, posicaoObjetoB.z, escalaObjetoB.z, limites.z, usarLimitesEmAmbos )
        )
    }

    return false;
}
