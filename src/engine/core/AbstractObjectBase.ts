/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import CollisionsData      from "../interfaces/main_engine/CollisionsData";
import MeshRepresentation  from "../interfaces/main_engine/MeshRepresentation";
import MovementState       from "../interfaces/main_engine/MovementState";
import ObjectAcceleration  from "../interfaces/main_engine/ObjectAcceleration";
import ObjectAttachment    from "../interfaces/main_engine/ObjectAttachment";
import ObjectEventLayer    from "../interfaces/main_engine/ObjectEventBlock";
import ObjectEvents        from "../interfaces/main_engine/ObjectEvents";
import ObjectForce         from "../interfaces/main_engine/ObjectForce";
import ObjectPosition      from "../interfaces/main_engine/ObjectPosition";
import ObjectProps         from "../interfaces/main_engine/ObjectProps";
import ObjectRotation      from "../interfaces/main_engine/ObjectRotation";
import ObjectScale         from "../interfaces/main_engine/ObjectScale";
import ObjectVelocity      from "../interfaces/main_engine/ObjectVelocity";
import PhysicsState        from "../interfaces/main_engine/PhysicsState";
import Position3D          from "../interfaces/main_engine/Position3D";
import RotationState       from "../interfaces/main_engine/RotationState";
import VelocityStatus      from "../interfaces/main_engine/VelocityStatus";
import { float, int, Ponteiro }        from "../types/types-cpp-like";
import ProximityBounds     from "../interfaces/main_engine/ProximityBounds";
import ObjectFrameTracker  from "./ObjectFrameTracker/ObjectFrameTracker";
import Scene               from "./Scene";

/**
* Lembrando que o objetivo dessa classe é somente declarar os atributos e métodos da classe ObjectBase e seus derivados vão usar
* Apenas nao ter erros de compilação. Todos os métodos são virtuais e devem ser implementados no ObjectBase e seus derivados.
* 
* Em varios lugares aqui nesse código, por exemplo no objectBelow, lastObjectBelow, parametros de funcoes como o objeto, outroObjeto, que estão com o  tipo AbstractObjectBase, na realidade são ponteiros da classe AbstractObjectBase,
* Ou seja, que vão aceitar qualquer derivação que venha da AbstractObjectBase
* 
* O ObjectBase aqui nessa mesma pasta, em: "./ObjectBase.ts", ele é uma classe implementada, que herda do AbstractObjectBase,
* e no ObjectBase, ele tem todos os atributos que o AbstractObjectBase tem, e implementa todos os métodos, com exatamente os mesmos parametros e tipo de retornos
* E na realidade, em C++, a ideia do polimorfismo iria prevalecer, seguindo a regra de que em qualquer lugar que eu precise aceitar qualquer objetos derivado da classe AbstractObjectBase, eu vou usar AbstractObjectBase*, ou seja, um ponteiro dessa classe
* e isso automaticamente aceita tanto instancias de AbstractObjectBase, quanto de ObjectBase, ou outras derivadas de AbstractObjectBase
*/

export default abstract class AbstractObjectBase
{
    public scene            : Ponteiro<Scene>;         // é um ponteiro com referencia: Scene*
    public onCreate         : Ponteiro<Function>; // è uma função e tambem um ponteiro *

    public objectBelow      : Ponteiro<AbstractObjectBase>;     //Um ponteiro AbstractObjectBase*,  O objeto cujo o objeto atual está em cima dele. Ou seja, objectBelow é o objeto que esta abaixo do objeto atual. Pode ser o chao ou outro objeto. Se o objeto atual estiver no ar(caindo, ou se for um objeto sem fisica), essa variavel vai ter valor null
    public lastObjectBelow  : Ponteiro<AbstractObjectBase>; //Um ponteiro AbstractObjectBase*, O ultimo objeto cujo o objeto atual esteve em cima 

    /** OUTROS ATRIBUTOS DO OBJETO */
    public tipo                : string = "AbstractObjectBase";
    public name                : string;
    public id                  : string;
    public mesh                : MeshRepresentation;
    public objProps            : ObjectProps;
    public objEvents           : ObjectEventLayer;
    public frameHistory        : ObjectFrameTracker;
    public movimentState       : MovementState;
    public movimentSinalyzer   : MovementState; // Indica se o objeto está se movendo para essas direções, quer por força ou de forma direta
    public rotationSinalyzer   : RotationState; // Indica a direção de rotação do objeto
    public velocitySinalyzer   : VelocityStatus; // Indica o status da velocidade do objeto para cada eixo
    public physicsState        : PhysicsState;
    public weight              : float;
    public isFalling           : boolean;
    public groundY             : float; // A posição Y do chão atual em relação a este objeto
    public infoCollisions      : CollisionsData;
    public infoProximity       : CollisionsData;
    public isMovimentoTravadoPorColisao : boolean;
    public isReceiving_Y_Velocity       : boolean; // Sinaliza se o objeto está recebendo uma aceleração externa à gravidade ou não(usado para não dar conflito com a logica de queda).

    /** OUTROS ATRIBUTOS **/
    public lastPosition : ObjectPosition = {x: 0, y: 0, z: 0};

    constructor( objProps:ObjectProps )
    {    
        // Inicialização obrigatória dos valores da classe
        this.tipo             = "AbstractObjectBase";
        this.name             = "";
        this.id               = "";
        this.scene            = null;
        this.objectBelow      = null;
        this.lastObjectBelow  = null;
        this.weight           = 0;
        this.isFalling        = false;
        this.groundY          = 0;
        this.onCreate         = null;

        this.isMovimentoTravadoPorColisao = false;
        this.isReceiving_Y_Velocity       = false;

        /**
        * Objetos talvez precisem ser incializados em C++ se eles não tiverem um construtor padrão que aceite apenas declaração com inicialização automatica 
        */
        this.objEvents    = new ObjectEventLayer( new Array<ObjectEvents>() );
        this.frameHistory = new ObjectFrameTracker(this);

        /**
        * ESSA INICIALIZAÇÂO ABAIXO NÂO PRECISA SER FEITA EM C++
        * Em C++ basta declarar as variaveis, e não precisa inicializar
        */
        this.mesh = {
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: {
                x: 0,
                y: 0,
                z: 0
            }
        }
        this.objProps = {
            mass: 0,
            type: "", 
            name: "",
            classes: new Array<string>(),
            havePhysics: false,
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: {
                x: 0,
                y: 0,
                z: 0
            }, 
            scaleReduce: {
                x: 0,
                y: 0,
                z: 0
            },
            collide: false,
            collisionEvents: false,
            podeAtravessar: false,
            ignoreCollisions: new Array<string>(),
            proximityConfig: {
                x: 0,
                y: 0,
                z: 0
            },
            isInvisible: false,
            opacity: 0,
            events: new Array<ObjectEvents>(),
            kick_rate: 0,
            enable_advanced_frame_tracking: false,
            onCreate: null,
            attachments: new Array<ObjectAttachment>(),
            obj: "",
            mtl: "",
            useAccumulatedLights     : true,
            childrenIndividualLights : true,
            staticAccumulatedLights  : false
        };
        this.movimentState = {
            forward   : false,
            backward  : false,
            right     : false,
            left      : false,
            up        : false,
            down      : false,
            steps     : 1,
            isJumping : false
        };
        this.movimentSinalyzer =  {
            forward   : false,
            backward  : false,
            right     : false,
            left      : false,
            up        : false,
            down      : false,
            isJumping : false,
            steps     : 1 //Isso aqui nao faz muito sentido, entoa vou remover depois
        };
        this.rotationSinalyzer =  {
            forward   : false,
            backward  : false,
            right     : false,
            left      : false,
            up        : false,
            down      : false
        };
        this.velocitySinalyzer = {
            x  : "uncalculed",
            y  : "uncalculed",
            z  : "uncalculed"
        }
        this.physicsState = {
            havePhysics: objProps.havePhysics,

            // Define a velocidade inicial do objeto
            velocity             : { x: 0, y: 0, z: 0 } as ObjectVelocity,
            acceleration         : { x: 0, y: 0, z: 0 } as ObjectAcceleration,
            force                : { x: 0, y: 0, z: 0 } as ObjectForce,

            // Define a velocidade de rotação
            rotationVelocity     : { x: 0, y: 0, z: 0 } as ObjectVelocity,
            rotationAcceleration : { x: 0, y: 0, z: 0 } as ObjectAcceleration,
            rotationForce        : { x: 0, y: 0, z: 0 } as ObjectForce
        };
        this.infoCollisions = {
            objectNames   : new Array<string>(),
            objectIDs     : new Array<string>(),
            objectClasses : new Array<string>(),
            objects       : new Array<Ponteiro<AbstractObjectBase>>()
        };
        this.infoProximity = {
            objectNames   : new Array<string>(),
            objectIDs     : new Array<string>(),
            objectClasses : new Array<string>(),
            objects       : new Array<Ponteiro<AbstractObjectBase>>()
        };
        /**
        * FIM DAS INICIALIZAÇÔES QUE NÂO PRECISAM EM C++ 
        */
        
    }

    public setScene( novaScene:Scene ): void
    {
        this.scene = novaScene;
    }

    public debug(): void
    {
        
    }

    public pre_loop_reset(): void
    {

    }

    public updateVelocitySinalyzer( velocityBeforeUpdate           : ObjectVelocity,
                                    velocitySinalyzerBeforeUpdate  : VelocityStatus, 
                                    firstRender                    : boolean, 
                                    renderizadorPronto             : boolean, 
                                    frameDelta                     : float, 
                                    frameNumber                    : int 
    ): void{

    }

    public haveClass( className:string ): boolean
    {
        return false;
    }

    public getAttachments(): Array<ObjectAttachment>
    {
        return [];
    }

    public joinAttachment( outroObjeto:Ponteiro<AbstractObjectBase>, attachementConfig: ObjectAttachment ): void
    {
        
    }

    public attach( objetoAnexar:Ponteiro<AbstractObjectBase>, attachementConfig: ObjectAttachment ): void
    {
        
    }

    public ClearAttachments(): void
    {
       
    }

    public getProps(): ObjectProps
    {
       return {
            mass        : 0,
            type        : "", 
            name        : "",
            classes     : new Array<string>(),
            havePhysics : false,

            position: {
                x: 0,
                y: 0,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: {
                x: 0,
                y: 0,
                z: 0
            },
            scaleReduce: {
                x: 0,
                y: 0,
                z: 0
            },

            collide          : false,
            collisionEvents  : false,
            podeAtravessar   : false,
            ignoreCollisions : new Array<string>(),

            proximityConfig: {
                x: 0,
                y: 0,
                z: 0
            },

            isInvisible : false,
            opacity     : 0,
            events      : new Array<ObjectEvents>(),
            kick_rate   : 0,
            enable_advanced_frame_tracking: false,
            onCreate    : null,
            attachments : new Array<ObjectAttachment>(),
            obj: "",
            mtl: "",
            useAccumulatedLights     : true,
            childrenIndividualLights : true,
            staticAccumulatedLights  : false
        };
    }

    public getMass(): float
    {
       return 0;
    }

    public getWeight(): float
    {
       return 0;
    }

    public getRepresentacaoMesh(): MeshRepresentation
    {
       return {
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: {
                x: 0,
                y: 0,
                z: 0
            }
        };
    }

    public setMesh(newMesh:MeshRepresentation): void
    {
        
    }

    public getScene(): Ponteiro<Scene>
    {
       return null;
    }

    public getPosition(): ObjectPosition
    {
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    public getLastPosition(): ObjectPosition
    {
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    public setPosition( position: ObjectPosition ): void
    {
       
    }

    public somarX( x:float ): void
    {
        
    }
    
    public somarY( y:float ): void
    {
        
    }

    public somarZ( z:float ): void
    {
        
    }

    public somarPosicaoX( x:float ): void
    {
       
    }
    
    public somarPosicaoY( y:float ): void
    {
        
    }

    public somarPosicaoZ( z:float ): void
    {
       
    }

    public subtrairPosicaoX( x:float ): void
    {
        
    }
    
    public subtrairPosicaoY( y:float ): void
    {
        
    }

    public subtrairPosicaoZ( z:float ): void
    {
        
    }

    public somarEixo(eixo:string, valor:float): void
    {
        
    }

    public subtrairEixo(eixo:string, valor:float): void
    {
        
    }

    public somarPosition( position:ObjectPosition ): void
    {
       
    }

    public setScale( scale: ObjectScale ): void
    {
        
    }

    public getScale(): ObjectScale
    {
      return {
        x: 0,
        y: 0,
        z: 0
      }
    }

    public somarEscalaX( x:float ): void
    {
       
    }
    
    public somarEscalaY( y:float ): void
    {
      
    }

    public somarEscalaZ( z:float ): void
    {
        
    }

    public somarEscala( scale:ObjectScale ): void
    {
       
    }

    public getForce(): ObjectForce
    {
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    public somarForce( forca:ObjectForce, isExternal:boolean = true ): void
    {

    }

    public somarForceX( forca:float ): void
    {
      
    }

    public somarForceY( forca:float ): void
    {
       
    }

    public somarForceZ( forca:float ): void
    {
        
    }

    public subtrairForceX( forca:float ): void
    {
       
    }

    public subtrairForceY( forca:float ): void
    {
       
    }

    public subtrairForceZ( forca:float ): void
    {
       
    }

    public somarForceEixo(eixo:string, valor:float): void
    {
        
    }

    public subtrairForceEixo(eixo:string, valor:float): void
    {
       
    }

    public setForce( forca:ObjectForce ): void
    {
       
    }

    public getAcceleration(): ObjectAcceleration
    {
      return {
            x: 0,
            y: 0,
            z: 0
      }
    }

    public somarAcceleration( velocidade:ObjectAcceleration ): void
    {
       
    }

    public somarAccelerationX( acceleration:float ): void
    {
       
    }

    public somarAccelerationY( acceleration:float ): void
    {
       
    }

    public somarAccelerationZ( acceleration:float ): void
    {
      
    }

    public subtrairAccelerationX( acceleration:float ): void
    {
      
    }

    public subtrairAccelerationY( acceleration:float ): void
    {
       
    }

    public subtrairAccelerationZ( acceleration:float ): void
    {
       
    }

    public somarAccelerationEixo(eixo:string, valor:float): void
    {
        
    }

    public subtrairAccelerationEixo(eixo:string, valor:float): void
    {
       
    }

    public setAcceleration( acceleration:ObjectAcceleration ): void
    {
       
    }

    public getVelocity(): ObjectVelocity
    {
      return {
            x: 0,
            y: 0,
            z: 0
      }
    }

    public somarVelocity( velocidade:ObjectVelocity, isExternal:boolean = true ): void
    {

    }

    public somarVelocityX( velocidade:float ): void
    {
        
    }

    public somarVelocityY( velocidade:float, isExternal:boolean = true ): void
    {
       
    }

    public somarVelocityZ( velocidade:float ): void
    {
       
    }

    public subtrairVelocityX( velocidade:float ): void
    {
        
    }

    public subtrairVelocityY( velocidade:float, isExternal:boolean = true ): void
    {
       
    }

    public subtrairVelocityZ( velocidade:float ): void
    {
       
    }

    public somarVelocityEixo(eixo:string, valor:float, isExternal:boolean = true): void
    {
        
    }

    public subtrairVelocityEixo(eixo:string, valor:float, isExternal:boolean = true): void
    {
       
    }

    public setVelocity( velocidade:ObjectVelocity, isExternal:boolean = true ): void
    {
       
    }

    public setVelocityX( velocidade:float ): void
    {
        
    }

    public setVelocityY( velocidade:float, isExternal:boolean = true ): void
    {
       
    }

    public setVelocityZ( velocidade:float ): void
    {
       
    }

    public setVelocityEixo( eixo:string, velocidade:float, isExternal:boolean = true ): void
    {
        
    }

    /**
    * Calcula o momento linear do objeto
    */
    public getMomentoLinear(): Position3D
    {
       return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    /**
    * Calcula a massa invertida
    */
    public getMassaInvertida(): float
    {
       return 0;
    }

    public getRotation(): ObjectRotation
    {
       return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    public setRotation( rotation: ObjectRotation ): void
    {
      
    }

    public somarRotationX( x:float ): void
    {
        
    }
    
    public somarRotationY( y:float ): void
    {
        
    }

    public somarRotationZ( z:float ): void
    {
       
    }

    /**
    * Acrescenta uma rotação ao objeto
    * @param rotation 
    */
    public somarRotation( rotation:ObjectRotation ): void
    {
        
    }

    /**
    * Obtem a força de rotação 
    */
    public getRotationForce(): ObjectForce
    {
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    /**
    * Obtem a aceleração de rotação 
    */
    public getRotationAcceleration(): ObjectForce
    {
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    /**
    * Obtem a aceleração de rotação 
    */
    public getRotationVelocity(): ObjectForce
    {
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    public somarRotationVelocityX( velocidadeRotacao:float ): void
    {
        
    }

    public somarRotationVelocityY( velocidadeRotacao:float ): void
    {
       
    }

    public somarRotationVelocityZ( velocidadeRotacao:float ): void
    {
        
    }

    public subtrairRotationVelocityX( velocidadeRotacao:float ): void
    {
        
    }

    public subtrairRotationVelocityY( velocidadeRotacao:float ): void
    {
        
    }

    public subtrairRotationVelocityZ( velocidadeRotacao:float ): void
    {
       
    }

    public somarRotationForceX( velocidadeRotacao:float ): void
    {
        
    }

    public somarRotationForceY( velocidadeRotacao:float ): void
    {
       
    }

    public somarRotationForceZ( velocidadeRotacao:float ): void
    {
        
    }

    public setRotationVelocityX( velocidadeRotacaoX:float ): void
    {
      
    }

    public setRotationVelocityY( velocidadeRotacaoY:float ): void
    {

    }

    public setRotationVelocityZ( velocidadeRotacaoZ:float ): void
    {

    }

    public destroy(): void
    {
      
    }

    public getVolume(): float 
    {
        return 0;
    }

    public updateCollisionState( frameDelta:float ): void
    {

    }

    public updatePhysics( frameDelta:float ): void
    {

    }

    public updateRotation( frameDelta:float ): void
    {

    }

    public updateMovement( frameDelta:float ): void
    {
   
    }

    public updateAttachments( frameDelta:float ): void
    {
                           
    }

    public callEvent( funcaoEvento:Function, parametros:any ): void
    {
      
    }

    public updateEvents( frameDelta:float ): void
    {
        
    }

    public reset_loop_afterframe(): void
    {

    }

    public updateObject( firstRender: boolean, renderizadorPronto: boolean, frameDelta:float, frameNumber: int ): void
    {
        
    }
    
    isCollisionOf( outroObjeto:Ponteiro<AbstractObjectBase>, limites:ProximityBounds ): boolean
    {
        return false;
    }

    getCollisions( limites:ProximityBounds = {x:0, y:0, z:0}, 
                   recalculate:boolean = false  

    ): Array<Ponteiro<AbstractObjectBase>>
    {
        return [];
    }

    getProximity( limites:ProximityBounds = {x:0, y:0, z:0}, 
                  recalculate:boolean = false 
                    
    ): Array<Ponteiro<AbstractObjectBase>>
    {
        return [];
    }

    isProximityOf( outroObjeto:Ponteiro<AbstractObjectBase>, limites:ProximityBounds ): boolean
    {
        return false;
    }

}