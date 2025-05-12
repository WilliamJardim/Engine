/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectBase from "../../core/ObjectBase";
import DistanciaEixos from "../interfaces/DistanciaEixos";
import ProximityBounds from "../interfaces/ProximityBounds";
import getDistance from "./getDistance";

/**
* Verifica se dois objetos estão proximos dentro de uma faixa de coordenadas:
* Leva em conta uma zona de proximidade imaginária entre os objetos
* 
* @param objA - Object 1
* @param objB - Object 2 
* @returns {boolean} - Se está colidindo ou não
*/
export default function isProximity(
    objA: any,
    objB: any,
    limites: ProximityBounds | number,
    consideraEscala: boolean = true,
    usaValorAbsoluto: boolean = true
): boolean {
    const posA = objA.getPosition?.() ?? { x: 0, y: 0, z: 0 };
    const posB = objB.getPosition?.() ?? { x: 0, y: 0, z: 0 };

    const escalaA = objA.getScale?.() ?? { x: 0, y: 0, z: 0 };
    const escalaB = objB.getScale?.() ?? { x: 0, y: 0, z: 0 };

    const getLimite = (eixo: 'x' | 'y' | 'z'): number => {
        if (typeof limites === 'number'){
            return limites;
        }

        const valor = limites[eixo];
        return typeof valor === 'number' ? valor : 0;
    };

    const inRange = (eixo: 'x' | 'y' | 'z'): boolean => {
        const centroA = posA[eixo];
        const centroB = posB[eixo];

        const metadeEscalaA = escalaA[eixo] / 2;
        const metadeEscalaB = escalaB[eixo] / 2;
        const limiteExtra = getLimite(eixo);

        const minA = centroA - metadeEscalaA - limiteExtra;
        const maxA = centroA + metadeEscalaA + limiteExtra;

        const minB = centroB - metadeEscalaB;
        const maxB = centroB + metadeEscalaB;

        return maxB >= minA && minB <= maxA;
    };

    return inRange('x') && inRange('y') && inRange('z');
}
