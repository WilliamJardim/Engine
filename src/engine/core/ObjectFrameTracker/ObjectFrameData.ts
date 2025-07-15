/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectPosition  from "../../interfaces/main_engine/ObjectPosition";
import ObjectScale     from "../../interfaces/main_engine/ObjectScale";
import ObjectVelocity  from "../../interfaces/main_engine/ObjectVelocity";

export type FrameDataOrder = 'beforeUpdate' | 'afterUpdate';

export default interface ObjectFrameData
{
    order              : FrameDataOrder, //After or Before the object update
    frameDelta         : number,
    frameNumber        : number,
    firstRender        : boolean,
    renderizadorPronto : boolean,
    velocity           : ObjectVelocity,
    position           : ObjectPosition,
    scale              : ObjectScale
}