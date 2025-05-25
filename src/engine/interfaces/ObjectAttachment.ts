/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectPosition from "./ObjectPosition";
import ObjectRotation from "./ObjectRotation";
import ObjectScale from "./ObjectScale";

/**
* Interface usada para criar anexos de objetos 
*/
export default interface ObjectAttachment{
    name: string;

    // Personalizacao
    havePhysics: boolean; //Se o objeto em anexo vai ter fisica ou nao
    collide: boolean; //Se o objeto em anexo pode colidir ou não
    collisionEvents: boolean; //Se o objeto em anexo vai receber eventos de colisão ou nao
    attacherCollision: boolean; //Se ele NÂO VAI COLIDIR COM O OBJETO ANEXANTE. Se "true" então pode colidir normal peka regra da colisao, agora se "false", então, ele ignora
    traverse: boolean, //Se o objeto em anexo pode simplismente passar atravez de outros objetos(ignora a fisica)
    invisible: boolean, //Se o objeto em anexo vai ou não ser invisivel

    position: ObjectPosition; // A posição do objeto em anexo em relação ao objeto pai(a qual ele esta sendo anexado)
    rotation: ObjectRotation;
    rotationIncrement: ObjectRotation;
    scale: ObjectScale|number; 
    scaleReduce: ObjectScale; // Se vai ter redução de escala
    sameScale: boolean;
}