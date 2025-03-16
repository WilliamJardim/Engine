import ObjectBase from "../../core/ObjectBase";

export default function isCollision(objA:any, objB:any): boolean{

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
    * Testando se teve colisão 
    */
    const collisionX:boolean = (X_object1 < X_object2 + scaleX_object2) && 
                               (X_object1 + scaleX_object1 > X_object2 );

    const collisionY:boolean = (Y_object1 < Y_object2 + scaleY_object2) && 
                               (Y_object1 + scaleY_object1 > Y_object2 );

    const collisionZ:boolean = (Z_object1 < Z_object2 + scaleZ_object2) && 
                               (Z_object1 + scaleZ_object1 > Z_object2 );
    
    /**
    * Se em todos os tres eixos colidiu
    */
    if( collisionX == true && 
        collisionY == true && 
        collisionZ == true
    ){
        return true;
    }

    return false;
}