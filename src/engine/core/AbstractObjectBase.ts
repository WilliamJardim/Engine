/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import CollisionsData from "../interfaces/CollisionsData";
import MeshRepresentation from "../interfaces/MeshRepresentation";
import MovementState from "../interfaces/MovementState";
import ObjectAcceleration from "../interfaces/ObjectAcceleration";
import ObjectAttachment from "../interfaces/ObjectAttachment";
import ObjectEventLayer from "../interfaces/ObjectEventBlock";
import ObjectEvents from "../interfaces/ObjectEvents";
import ObjectForce from "../interfaces/ObjectForce";
import ObjectPosition from "../interfaces/ObjectPosition";
import ObjectProps from "../interfaces/ObjectProps";
import ObjectRotation from "../interfaces/ObjectRotation";
import ObjectScale from "../interfaces/ObjectScale";
import ObjectVelocity from "../interfaces/ObjectVelocity";
import PhysicsState from "../interfaces/PhysicsState";
import Position3D from "../interfaces/Position3D";
import RotationState from "../interfaces/RotationState";
import VelocityStatus from "../interfaces/VelocityStatus";
import ProximityBounds from "../utils/interfaces/ProximityBounds";
import ObjectFrameTracker from "./ObjectFrameTracker/ObjectFrameTracker";
import Scene from "./Scene";

/**
* Lembrando que o objeto dessa classe é somente declarar os atributos e métodos da classe ObjectBase e seus derivados vão usar
* Apenas nao ter erros de compilação. Todos os métodos são virtuais e devem ser implementados no ObjectBase e seus derivados.
*/

export default abstract class AbstractObjectBase{

    public scene:any|null;         // é um ponteiro com referencia: Scene*
    public onCreate:Function|null; // è uma função e tambem um ponteiro *

    public objectBelow: any|null;     //Um ponteiro ObjectBase*,  O objeto cujo o objeto atual está em cima dele. Ou seja, objectBelow é o objeto que esta abaixo do objeto atual. Pode ser o chao ou outro objeto. Se o objeto atual estiver no ar(caindo, ou se for um objeto sem fisica), essa variavel vai ter valor null
    public lastObjectBelow: any|null; //Um ponteiro ObjectBase*, O ultimo objeto cujo o objeto atual esteve em cima 

    /** OUTROS ATRIBUTOS DO OBJETO */
    public tipo:string = 'AbstractObjectBase';
    public name:string;
    public id:string;
    public mesh:MeshRepresentation;
    public objProps:ObjectProps;
    public objEvents:ObjectEventLayer;
    public frameHistory:ObjectFrameTracker;
    public movimentState:MovementState;
    public movimentSinalyzer:MovementState; // Indica se o objeto está se movendo para essas direções, quer por força ou de forma direta
    public rotationSinalyzer:RotationState; // Indica a direção de rotação do objeto
    public velocitySinalyzer:VelocityStatus; // Indica o status da velocidade do objeto para cada eixo
    public physicsState:PhysicsState;
    public weight:number;
    public isFalling:boolean;
    public groundY:number; // A posição Y do chão atual em relação a este objeto
    public infoCollisions:CollisionsData;
    public infoProximity:CollisionsData;
    public isMovimentoTravadoPorColisao:boolean;
    public isReceiving_Y_Velocity:boolean; // Sinaliza se o objeto está recebendo uma aceleração externa à gravidade ou não(usado para não dar conflito com a logica de queda).

    /** OUTROS ATRIBUTOS **/
    public lastPosition:ObjectPosition = {x: 0, y: 0, z: 0};

    constructor(objProps:ObjectProps){
        
        // Inicialização dos valores da classe
        this.tipo = "AbstractObjectBase";
        this.name = "";
        this.id = "";

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
            material: null,
            mass: 0,
            type: "", 
            name: "",
            classes: [],
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
            traverse: false,
            ignoreCollisions: [],
            proximityConfig: {
                    x: 0,
                    y: 0,
                    z: 0
                },

            invisible: false,
            opacity: 0,
            events: ([] as ObjectEvents[]),
            kick_rate: 0,
            enable_advanced_frame_tracking: false,
            onCreate: null,
            attachments: ([] as ObjectAttachment[])
        };

        this.objEvents = new ObjectEventLayer([]);

        this.frameHistory = new ObjectFrameTracker(this);

        this.movimentState = {
            forward: false,
            backward: false,
            right: false,
            left: false,
            up: false,
            down: false,
            steps: 1,
            isJumping: false
        };

        this.movimentSinalyzer =  {
            forward: false,
            backward: false,
            right: false,
            left: false,
            up: false,
            down: false,
            isJumping: false,
            steps: 1 //Isso aqui nao faz muito sentido, entoa vou remover depois
        };

        this.rotationSinalyzer =  {
            forward: false,
            backward: false,
            right: false,
            left: false,
            up: false,
            down: false
        };

        this.velocitySinalyzer = {
            x: 'uncalculed',
            y: 'uncalculed',
            z: 'uncalculed'
        }

        this.physicsState = {

            havePhysics: objProps.havePhysics,

            // Define a velocidade inicial do objeto
            velocity     : { x: 0, y: 0, z: 0 } as ObjectVelocity,
            acceleration : { x: 0, y: 0, z: 0 } as ObjectAcceleration,
            force        : { x: 0, y: 0, z: 0 } as ObjectForce,

            // Define a velocidade de rotação
            rotationVelocity     : { x: 0, y: 0, z: 0 } as ObjectVelocity,
            rotationAcceleration : { x: 0, y: 0, z: 0 } as ObjectAcceleration,
            rotationForce        : { x: 0, y: 0, z: 0 } as ObjectForce

        };

        this.weight = 0;
        this.isFalling = false;
        this.groundY = 0;

        this.infoCollisions = {
            objectNames: [],
            objectIDs: [],
            objectClasses: [],
            objects: []
        };

        this.infoProximity = {
            objectNames: [],
            objectIDs: [],
            objectClasses: [],
            objects: []
        };

        this.isMovimentoTravadoPorColisao = false;
        this.isReceiving_Y_Velocity = false;
        this.onCreate = null;
        
    }

    public setScene( novaScene:Scene )
    {
        this.scene = novaScene;
    }

    public debug()
    {
        
    }

    public pre_loop_reset(): void{

    }

    /**
    * Atualiza o status da velocidade(em cada eixo, se está aumentando, diminuindo, etc...) 
    * Isso é um pouco mais complexo por que leva em conta o frame anterior, da forma como eu fiz
    * A cena chama essa função após CADA ATUALIZAÇÂO DO OBJETO ATUAL, porém, contendo os dados do frame anterior
    * assim eu consigo saber o que mudou
    */
    public updateVelocitySinalyzer( velocityBeforeUpdate: ObjectVelocity,
                                    velocitySinalyzerBeforeUpdate: VelocityStatus, 
                                    firstRender:boolean, 
                                    renderizadorPronto:boolean, 
                                    frameDelta:number, 
                                    frameNumber:number 
    ): void{

    }

    public haveClass( className:string ): boolean{
        return false;
    }

    public getAttachments(): Array<string|ObjectAttachment>|undefined{
        return undefined;
    }

    public joinAttachment( outroObjeto:AbstractObjectBase, attachementConfig: ObjectAttachment ): void{
        
    }

    public attach( objetoAnexar:AbstractObjectBase, attachementConfig: ObjectAttachment ): void{
        
    }

    public ClearAttachments(): void{
       
    }

    public getProps(): ObjectProps{
       return {
            material: null,
            mass: 0,
            type: "", 
            name: "",
            classes: [],
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
            traverse: false,
            ignoreCollisions: [],
            proximityConfig: {
                    x: 0,
                    y: 0,
                    z: 0
                },

            invisible: false,
            opacity: 0,
            events: ([] as ObjectEvents[]),
            kick_rate: 0,
            enable_advanced_frame_tracking: false,
            onCreate: null,
            attachments: ([] as ObjectAttachment[])
        };
    }

    public getMass(): number{
       return 0;
    }

    public getWeight(): number{
       return 0;
    }

    public getMesh(): MeshRepresentation{
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

    public setMesh(newMesh:any): void{
        
    }

    public getScene(): Scene|null{
       return null;
    }

    public getPosition(): ObjectPosition{
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    public getLastPosition(): ObjectPosition{
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    public setPosition( position: ObjectPosition ): AbstractObjectBase{
       return this;
    }

    public somarX( x:number ): void{
        
    }
    
    public somarY( y:number ): void{
        
    }

    public somarZ( z:number ): void{
        
    }

    public somarPosicaoX( x:number ): void{
       
    }
    
    public somarPosicaoY( y:number ): void{
        
    }

    public somarPosicaoZ( z:number ): void{
       
    }

    public subtrairPosicaoX( x:number ): void{
        
    }
    
    public subtrairPosicaoY( y:number ): void{
        
    }

    public subtrairPosicaoZ( z:number ): void{
        
    }

    public somarEixo(eixo:string, valor:number): void{
        
    }

    public subtrairEixo(eixo:string, valor:number): void{
        
    }

    public somarPosition( position:ObjectPosition ): void{
       
    }

    public setScale( scale: ObjectScale ): AbstractObjectBase{
        return this;
    }

    public getScale(): ObjectScale{
      return {
        x: 0,
        y: 0,
        z: 0
      }
    }

    public somarEscalaX( x:number ): void{
       
    }
    
    public somarEscalaY( y:number ): void{
      
    }

    public somarEscalaZ( z:number ): void{
        
    }

    public somarEscala( scale:ObjectScale ): void{
       
    }

    public getForce(): ObjectForce{
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    public somarForce( forca:ObjectForce, isExternal:boolean = true ): void{

    }

    public somarForceX( forca:number ): void{
      
    }

    public somarForceY( forca:number ): void{
       
    }

    public somarForceZ( forca:number ): void{
        
    }

    public subtrairForceX( forca:number ): void{
       
    }

    public subtrairForceY( forca:number ): void{
       
    }

    public subtrairForceZ( forca:number ): void{
       
    }

    public somarForceEixo(eixo:string, valor:number): void{
        
    }

    public subtrairForceEixo(eixo:string, valor:number): void{
       
    }

    public setForce( forca:ObjectForce ): void{
       
    }

    public getAcceleration(): ObjectAcceleration{
      return {
            x: 0,
            y: 0,
            z: 0
      }
    }

    public somarAcceleration( velocidade:ObjectAcceleration ): void{
       
    }

    public somarAccelerationX( acceleration:number ): void{
       
    }

    public somarAccelerationY( acceleration:number ): void{
       
    }

    public somarAccelerationZ( acceleration:number ): void{
      
    }

    public subtrairAccelerationX( acceleration:number ): void{
      
    }

    public subtrairAccelerationY( acceleration:number ): void{
       
    }

    public subtrairAccelerationZ( acceleration:number ): void{
       
    }

    public somarAccelerationEixo(eixo:string, valor:number): void{
        
    }

    public subtrairAccelerationEixo(eixo:string, valor:number): void{
       
    }

    public setAcceleration( acceleration:ObjectAcceleration ): void{
       
    }

    public getVelocity(): ObjectVelocity{
      return {
            x: 0,
            y: 0,
            z: 0
      }
    }

    public somarVelocity( velocidade:ObjectVelocity, isExternal:boolean = true ): void{

    }

    public somarVelocityX( velocidade:number ): void{
        
    }

    public somarVelocityY( velocidade:number, isExternal:boolean = true ): void{
       
    }

    public somarVelocityZ( velocidade:number ): void{
       
    }

    public subtrairVelocityX( velocidade:number ): void{
        
    }

    public subtrairVelocityY( velocidade:number, isExternal:boolean = true ): void{
       
    }

    public subtrairVelocityZ( velocidade:number ): void{
       
    }

    public somarVelocityEixo(eixo:string, valor:number, isExternal:boolean = true): void{
        
    }

    public subtrairVelocityEixo(eixo:string, valor:number, isExternal:boolean = true): void{
       
    }

    public setVelocity( velocidade:ObjectVelocity, isExternal:boolean = true ): void{
       
    }

    public setVelocityX( velocidade:number ): void{
        
    }

    public setVelocityY( velocidade:number, isExternal:boolean = true ): void{
       
    }

    public setVelocityZ( velocidade:number ): void{
       
    }

    public setVelocityEixo( eixo:string, velocidade:number, isExternal:boolean = true ): void{
        
    }

    /**
    * Calcula o momento linear do objeto
    */
    public getMomentoLinear(): Position3D{
       return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    /**
    * Calcula a massa invertida
    */
    public getMassaInvertida(): number{
       return 0;
    }

    public getRotation(): ObjectRotation{
       return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    public setRotation( rotation: ObjectRotation ): AbstractObjectBase{
       return this;
    }

    public somarRotationX( x:number ): void{
        
    }
    
    public somarRotationY( y:number ): void{
        
    }

    public somarRotationZ( z:number ): void{
       
    }

    /**
    * Acrescenta uma rotação ao objeto
    * @param rotation 
    */
    public somarRotation( rotation:ObjectRotation ): void{
        
    }

    /**
    * Obtem a força de rotação 
    */
    public getRotationForce(): ObjectForce{
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    /**
    * Obtem a aceleração de rotação 
    */
    public getRotationAcceleration(): ObjectForce{
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    /**
    * Obtem a aceleração de rotação 
    */
    public getRotationVelocity(): ObjectForce{
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    public somarRotationVelocityX( velocidadeRotacao:number ){
        
    }

    public somarRotationVelocityY( velocidadeRotacao:number ){
       
    }

    public somarRotationVelocityZ( velocidadeRotacao:number ){
        
    }

    public subtrairRotationVelocityX( velocidadeRotacao:number ){
        
    }

    public subtrairRotationVelocityY( velocidadeRotacao:number ){
        
    }

    public subtrairRotationVelocityZ( velocidadeRotacao:number ){
       
    }

    public somarRotationForceX( velocidadeRotacao:number ){
        
    }

    public somarRotationForceY( velocidadeRotacao:number ){
       
    }

    public somarRotationForceZ( velocidadeRotacao:number ){
        
    }

    public setRotationVelocityX( velocidadeRotacaoX:number ){
      
    }

    public setRotationVelocityY( velocidadeRotacaoY:number ){

    }

    public setRotationVelocityZ( velocidadeRotacaoZ:number ){

    }

    public destroy(): void{
      
    }

    public getVolume(): number {
        return 0;
    }

    public updateCollisionState( frameDelta:number ): void{

    }

    public updatePhysics( frameDelta:number ): void{

    }

    public updateRotation( frameDelta:number ): void{

    }

    public updateMovement( frameDelta:number ): void{
   
    }

    public updateAttachments( frameDelta:number ): void{
                           
    }

    public callEvent( funcaoEvento:Function, parametros:any ): void{
      
    }

    public updateEvents( frameDelta:number ): void{
        
    }

    public reset_loop_afterframe(): void{

    }

    public updateObject( firstRender: boolean, renderizadorPronto: boolean, frameDelta:number, frameNumber: number ): void{
        
    }
    
    isCollisionOf( outroObjeto:AbstractObjectBase|string, limites:ProximityBounds ): boolean{
        return false;
    }

    getCollisions( limites:ProximityBounds = {x:0, y:0, z:0}, 
                    recalculate:boolean = false  

    ): AbstractObjectBase[]
    {
        return [];
    }

    getProximity( limites:ProximityBounds = {x:0, y:0, z:0}, 
                  recalculate:boolean = false 
                    
    ): AbstractObjectBase[]
    {
        return [];
    }

    isProximityOf( outroObjeto:AbstractObjectBase|string, limites:ProximityBounds ): boolean{
        return false;
    }

}