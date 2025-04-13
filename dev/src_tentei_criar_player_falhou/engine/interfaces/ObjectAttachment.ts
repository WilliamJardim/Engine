import ObjectPosition from "./ObjectPosition";
import ObjectRotation from "./ObjectRotation";
import ObjectScale from "./ObjectScale";

/**
* Interface usada para criar anexos de objetos 
*/
export default interface ObjectAttachment{
    //Pode ser feito tanto por nome quanto por id
    name?: string;
    id?: string;

    // Personalizacao
    havePhysics?: boolean; //Se o objeto em anexo vai ter fisica ou nao
    collide?: boolean; //Se o objeto em anexo pode colidir ou não
    collisionEvents?: boolean; //Se o objeto em anexo vai receber eventos de colisão ou nao
    traverse?: boolean, //Se o objeto em anexo pode simplismente passar atravez de outros objetos(ignora a fisica)
    invisible?: boolean, //Se o objeto em anexo vai ou não ser invisivel

    position: ObjectPosition; // A posição do objeto em anexo em relação ao objeto pai(a qual ele esta sendo anexado)
    rotation: ObjectRotation;
    rotationIncrement: ObjectRotation;
    scale: ObjectScale|number; 
    scaleReduce: ObjectScale|number; // Se vai ter redução de escala
    sameScale: boolean;
}