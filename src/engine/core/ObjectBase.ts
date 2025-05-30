/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectProps from '../interfaces/ObjectProps';
import PhysicsState from '../interfaces/PhysicsState';
import MovementState from '../interfaces/MovementState';
import ObjectPosition from '../interfaces/ObjectPosition';
import Scene from './Scene';
import ObjectEvents from '../interfaces/ObjectEvents';
import ObjectEventLayer from '../interfaces/ObjectEventBlock';
import isCollision from '../utils/logic/isCollision';
import removeObject from '../utils/removeObject';
import isProximity from '../utils/logic/isProximity';
import ProximityBounds from '../utils/interfaces/ProximityBounds';
import getDistance from '../utils/logic/getDistance';
import ObjectVelocity from '../interfaces/ObjectVelocity';
import ImaginaryObject from './ImaginaryObject';
import ObjectScale from '../interfaces/ObjectScale';
import ObjectAttachment from '../interfaces/ObjectAttachment';
import CollisionsData from '../interfaces/CollisionsData';
import ObjectRotation from '../interfaces/ObjectRotation';
import Wind from '../interfaces/Wind';
import MeshRepresentation from "../interfaces/MeshRepresentation";
import ObjectAcceleration from "../interfaces/ObjectAcceleration";
import ObjectForce from "../interfaces/ObjectForce";
import Position3D from "../interfaces/Position3D";
import RotationState from "../interfaces/RotationState";
import VelocityStatus from "../interfaces/VelocityStatus";
import ObjectFrameTracker from "./ObjectFrameTracker/ObjectFrameTracker";
import includeString from "../utils/array/includeString";
import objectAHaveSomeClassesIgnoredByObjectB from "../utils/array/objectAHaveSomeClassesIgnoredByObjectB";
import objectANOTHaveSomeClassesIgnoredByObjectB from "../utils/array/objectANOTHaveSomeClassesIgnoredByObjectB";
import AbstractObjectBase from "./AbstractObjectBase";

/**
* O ObjectBase aqui é uma classe implementada, que herda do AbstractObjectBase,
* e no ObjectBase, ele tem todos os atributos que o AbstractObjectBase tem, e implementa todos os métodos, com exatamente os mesmos parametros e tipo de retornos
* E na realidade, em C++, a ideia do polimorfismo iria prevalecer, seguindo a regra de que em qualquer lugar que eu precise aceitar qualquer objetos derivado da classe AbstractObjectBase, eu vou usar AbstractObjectBase*, ou seja, um ponteiro dessa classe
* e isso automaticamente aceita tanto instancias de AbstractObjectBase, quanto de ObjectBase, ou outras derivadas de AbstractObjectBase
*/ 

export default class ObjectBase extends AbstractObjectBase
{    
    /** ATRIBUTOS QUE SÂO PONTEIROS OU REFERENCIAS EXTERNAS */
    public scene:Scene|null;       // é um ponteiro com referencia: *
    public onCreate:Function|null; // è uma função e tambem um ponteiro *

    public objectBelow: AbstractObjectBase|null;     //O objeto cujo o objeto atual está em cima dele. Ou seja, objectBelow é o objeto que esta abaixo do objeto atual. Pode ser o chao ou outro objeto. Se o objeto atual estiver no ar(caindo, ou se for um objeto sem fisica), essa variavel vai ter valor null
    public lastObjectBelow: AbstractObjectBase|null; //O ultimo objeto cujo o objeto atual esteve em cima 

    /** OUTROS ATRIBUTOS DO OBJETO */
    public tipo:string = 'ObjectBase';
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

    constructor(mesh: MeshRepresentation, 
                objProps:ObjectProps
            
    ){
        super( objProps );
    
        this.objProps  = objProps;
        this.weight = 0;

        this.onCreate  = this.objProps.onCreate || null;

        this.groundY = 0;

        // objectBelow é um ponteiro, ele pode ser nulo na criação, mais ele será vinculado dinamicamente pela propia logica da engine
        this.objectBelow = null;
        this.lastObjectBelow = null;
        this.isMovimentoTravadoPorColisao = false; //Se o objeto atual esta travado por que esta tentando se mover para uma direção em que ele está colidindo com outro objeto

        this.isReceiving_Y_Velocity = false; //Sinaliza se o objeto está recebendo uma aceleração externa à gravidade ou não(usado para não dar conflito com a logica de queda).

        this.id          = (this.objProps.name||'objeto') + String(new Date().getTime());
        this.name        = this.objProps.name;

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

        this.objEvents = new ObjectEventLayer(this.objProps.events || []);

        // this.scene é um ponteiro, ele pode ser nulo na criação, mais ele será atribuido dinamicamente para apontar pra cena, na fase de atualização dos objetos
        this.scene = null;

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

        /**
        * Vai guardar todas as informações relevantes do objeto dentro do array frameData, após cada frame 
        * Pra poderem ser consultadas posteriormente
        * o SCENE vai chamar ele
        */
        this.frameHistory = new ObjectFrameTracker( this );

        // Se nao for usar monitoramento de frames
        if( this.objProps.enable_advanced_frame_tracking == false ){
            this.frameHistory.disable();
        }

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

        this.setMesh( mesh );

        this.isFalling = false;

        //Se tem posição
        this.setPosition( this.objProps.position );

        //Se tem rotação
        this.setRotation( this.objProps.rotation );

        //Se tem escala
        this.setScale( this.objProps.scale );

        // Se tem redução de escala
        this.somarEscalaX( this.objProps.scaleReduce.x );
        this.somarEscalaY( this.objProps.scaleReduce.y );
        this.somarEscalaZ( this.objProps.scaleReduce.z );

        // Dispara o evento ao criar o objeto
        if( this.onCreate )
        {
            this.onCreate.bind(this)()
        }
    }

    /**
    * Altera a cena a qual este objeto pertence 
    */
    public setScene( novaScene:Scene )
    {
        this.scene = novaScene;
    }

    public debug()
    {
        debugger;
    }

    /**
    * Reseta algumas coisas basicas, antes de qualquer loop de lógica 
    */
    public pre_loop_reset(): void{

        this.movimentSinalyzer =  {
            forward: false,
            backward: false,
            right: false,
            left: false,
            up: false,
            down: false,
            isJumping: false,
            steps: 1
        };

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

        const velocitySinalyzerAtual: VelocityStatus = this.velocitySinalyzer;
        const velocityAtual         : ObjectVelocity = this.getVelocity();

        // Se o valor do eixo X no frame atual for maior que no frame anterior, então está aumentando
        if( velocityAtual.x > velocityBeforeUpdate.x ){
            velocitySinalyzerAtual.x = 'increasing';

        // Se o valor do eixo X no frame atual for menor que no frame anterior, então está diminuindo
        }else if( velocityAtual.x < velocityBeforeUpdate.x ){
            velocitySinalyzerAtual.x = 'decreasing';

        // Se o valor do eixo X no frame atual for igual ao do frame anterior, então está a mesma coisa
        }else if( velocityAtual.x == velocityBeforeUpdate.x ){
            velocitySinalyzerAtual.x = 'constant'; // Se manteve o mesmo
        }


        // Se o valor do eixo Y no frame atual for maior que no frame anterior, então está aumentando
        if( velocityAtual.y > velocityBeforeUpdate.y ){
            velocitySinalyzerAtual.y = 'increasing';

        // Se o valor do eixo X no frame atual for menor que no frame anterior, então está diminuindo
        }else if( velocityAtual.y < velocityBeforeUpdate.y ){
            velocitySinalyzerAtual.y = 'decreasing';

        // Se o valor do eixo X no frame atual for igual ao do frame anterior, então está a mesma coisa
        }else if( velocityAtual.y == velocityBeforeUpdate.y ){
            velocitySinalyzerAtual.y = 'constant'; // Se manteve o mesmo
        }


        // Se o valor do eixo Z no frame atual for maior que no frame anterior, então está aumentando
        if( velocityAtual.z > velocityBeforeUpdate.z ){
            velocitySinalyzerAtual.z = 'increasing';

        // Se o valor do eixo Z no frame atual for menor que no frame anterior, então está diminuindo
        }else if( velocityAtual.z < velocityBeforeUpdate.z ){
            velocitySinalyzerAtual.z = 'decreasing';

        // Se o valor do eixo Z no frame atual for igual ao do frame anterior, então está a mesma coisa
        }else if( velocityAtual.z == velocityBeforeUpdate.z ){
            velocitySinalyzerAtual.z = 'constant'; // Se manteve o mesmo
        }
        
    }

    /**
    * Verifica se este objeto tem uma classe especifica 
    */
    public haveClass( className:string ): boolean{
        return includeString(this.objProps.classes, className);
    }

    /**
    * Retorna todos os objetos anexados ao objeto atual
    */
    public getAttachments(): Array<string|ObjectAttachment>|undefined{
        return this.objProps.attachments;
    }

    /**
    * Faz o objeto atual se anexar com outro objeto
    * @param {AbstractObjectBase*} outroObjeto
    * @param {ObjectAttachment} attachementConfig
    */
    public joinAttachment( outroObjeto:AbstractObjectBase, attachementConfig: ObjectAttachment ): void{
        // Cria o anexo no outro objeto para linkar esteObjeto com ele
        outroObjeto.objProps.attachments.push(attachementConfig);
    }

    /**
    * Adiciona algum objeto ao objeto atual simplismente adicionando ele na lista de attachments 
    * @param {ObjectBase} objetoAnexar
    * @param {ObjectAttachment} attachementConfig
    */
    public attach( objetoAnexar:AbstractObjectBase, attachementConfig: ObjectAttachment ): void{
        const esteObjeto:AbstractObjectBase = this;

        // Cria o anexo no outro objeto para linkar esteObjeto com ele
        esteObjeto.objProps.attachments.push(attachementConfig);
    }

    /**
    * Limpa a lista de attachments do objeto atual. Similar ao DettachFromAll(), porém, isso limpa a lista do objeto pai, liberando todos os objetos subordinados/anexados a ele.
    */
    public ClearAttachments(): void{
        const esteObjeto:AbstractObjectBase = this;
        esteObjeto.objProps.attachments = [];

        //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
        // ou se for um std:array pode usar .fill(nullptr) direto
    }

    public getProps(): ObjectProps{
        return this.objProps;
    }

    public getMass(): number{
        return this.objProps.mass;
    }

    public getWeight(): number{
        return this.weight;
    }

    public getMesh(): MeshRepresentation{
        return this.mesh;
    }

    public setMesh(newMesh:any): void{
        this.mesh = newMesh;
    }

    public getScene(): Scene|null{
        return this.scene;
    }

    /**
    * Obtém a posição: X Y Z do objeto na cena
    */
    public getPosition(): ObjectPosition{
        return this.getMesh().position;
    }

    /**
    * Obtém a posição ANTERIOR: X Y Z do objeto na cena
    */
    public getLastPosition(): ObjectPosition{
        return this.lastPosition;
    }

    public setPosition( position: ObjectPosition ): AbstractObjectBase{
        const mesh: MeshRepresentation = this.getMesh();

        mesh.position.x = position.x;
        mesh.position.y = position.y;
        mesh.position.z = position.z;

        //Retorna ele mesmo modificado
        return this;
    }

    public somarX( x:number ): void{
        this.getPosition().x += x;
    }
    
    public somarY( y:number ): void{
        this.getPosition().y += y;
    }

    public somarZ( z:number ): void{
        this.getPosition().z += z;
    }

    public somarPosicaoX( x:number ): void{
        this.getPosition().x += x;
    }
    
    public somarPosicaoY( y:number ): void{
        this.getPosition().y += y;
    }

    public somarPosicaoZ( z:number ): void{
        this.getPosition().z += z;
    }

    public subtrairPosicaoX( x:number ): void{
        this.getPosition().x -= x;
    }
    
    public subtrairPosicaoY( y:number ): void{
        this.getPosition().y -= y;
    }

    public subtrairPosicaoZ( z:number ): void{
        this.getPosition().z -= z;
    }

    public somarEixo(eixo:string, valor:number): void{
        switch( eixo ){
            case 'x':
                this.somarPosicaoX( valor );
                break;
            case 'y':
                this.somarPosicaoY( valor );
                break;
            case 'z':
                this.somarPosicaoZ( valor );
                break;
        }
    }

    public subtrairEixo(eixo:string, valor:number): void{
        switch( eixo ){
            case 'x':
                this.subtrairPosicaoX( valor );
                break;
            case 'y':
                this.subtrairPosicaoY( valor );
                break;
            case 'z':
                this.subtrairPosicaoZ( valor );
                break;
        }
    }

    /**
    * Acrescenta uma posição ao objeto
    * @param rotation 
    */
    public somarPosition( position:ObjectPosition ): void{
        this.getPosition().x += position.x;
        this.getPosition().y += position.y;
        this.getPosition().z += position.z;
    }

    public setScale( scale: ObjectScale ): AbstractObjectBase{
        const mesh: MeshRepresentation = this.getMesh();

        mesh.scale.x = scale.x;
        mesh.scale.y = scale.y;
        mesh.scale.z = scale.z;

        //Retorna ele mesmo modificado
        return this;
    }

    public getScale(): ObjectScale{
        return this.getMesh().scale;
    }

    public somarEscalaX( x:number ): void{
        this.getScale().x += x;
    }
    
    public somarEscalaY( y:number ): void{
        this.getScale().y += y;
    }

    public somarEscalaZ( z:number ): void{
        this.getScale().z += z;
    }

    /**
    * Acrescenta uma escala ao objeto
    * @param rotation 
    */
    public somarEscala( scale:ObjectScale ): void{
        this.getScale().x += scale.x;
        this.getScale().y += scale.y;
        this.getScale().z += scale.z;
    }

    public getForce(): ObjectForce{
        return this.physicsState.force;
    }

    public somarForce( forca:ObjectForce, isExternal:boolean = true ): void{

        // Em X
        this.getForce().x += forca.x

        // Em Y, Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getForce().y += forca.y 

        // Em Z
        this.getForce().z += forca.z
    }

    public somarForceX( forca:number ): void{
        this.getForce().x += forca;
    }

    public somarForceY( forca:number ): void{
        this.getForce().y += forca;
    }

    public somarForceZ( forca:number ): void{
        this.getForce().z += forca;
    }

    public subtrairForceX( forca:number ): void{
        this.getForce().x -= forca;
    }

    public subtrairForceY( forca:number ): void{
        this.getForce().y -= forca;
    }

    public subtrairForceZ( forca:number ): void{
        this.getForce().z -= forca;
    }

    public somarForceEixo(eixo:string, valor:number): void{
        switch( eixo ){
            case 'x':
                this.somarForceX( valor );
                break;
            case 'y':
                this.somarForceY( valor );
                break;
            case 'z':
                this.somarForceZ( valor );
                break;
        }
    }

    public subtrairForceEixo(eixo:string, valor:number): void{
        switch( eixo ){
            case 'x':
                this.subtrairForceX( valor );
                break;
            case 'y':
                this.subtrairForceY( valor );
                break;
            case 'z':
                this.subtrairForceZ( valor );
                break;
        }
    }

    public setForce( forca:ObjectForce ): void{
        this.getForce().x = forca.x;
        this.getForce().y = forca.y;
        this.getForce().z = forca.z;
    }

    public getAcceleration(): ObjectAcceleration{
        return this.physicsState.acceleration;
    }

    public somarAcceleration( velocidade:ObjectAcceleration ): void{
        this.getAcceleration().x += velocidade.x;
        this.getAcceleration().y += velocidade.y;
        this.getAcceleration().z += velocidade.z;
    }

    public somarAccelerationX( acceleration:number ): void{
        this.getAcceleration().x += acceleration;
    }

    public somarAccelerationY( acceleration:number ): void{
        this.getAcceleration().y += acceleration;
    }

    public somarAccelerationZ( acceleration:number ): void{
        this.getAcceleration().z += acceleration;
    }

    public subtrairAccelerationX( acceleration:number ): void{
        this.getAcceleration().x -= acceleration;
    }

    public subtrairAccelerationY( acceleration:number ): void{
        this.getAcceleration().y -= acceleration;
    }

    public subtrairAccelerationZ( acceleration:number ): void{
        this.getAcceleration().z -= acceleration;
    }

    public somarAccelerationEixo(eixo:string, valor:number): void{
        switch( eixo ){
            case 'x':
                this.somarAccelerationX( valor );
                break;
            case 'y':
                this.somarAccelerationY( valor );
                break;
            case 'z':
                this.somarAccelerationZ( valor );
                break;
        }
    }

    public subtrairAccelerationEixo(eixo:string, valor:number): void{
        switch( eixo ){
            case 'x':
                this.subtrairAccelerationX( valor );
                break;
            case 'y':
                this.subtrairAccelerationY( valor );
                break;
            case 'z':
                this.subtrairAccelerationZ( valor );
                break;
        }
    }

    public setAcceleration( acceleration:ObjectAcceleration ): void{
        this.getAcceleration().x = acceleration.x;
        this.getAcceleration().y = acceleration.y;
        this.getAcceleration().z = acceleration.z;
    }

    public getVelocity(): ObjectVelocity{
        return this.physicsState.velocity;
    }

    /**
    * Acrescenta uma velocidade ao objeto
    * @param velocidade 
    */
    public somarVelocity( velocidade:ObjectVelocity, isExternal:boolean = true ): void{

        // Em X
        this.getVelocity().x += velocidade.x;

        // Em Y, Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getVelocity().y += velocidade.y 

        // Em Z
        this.getVelocity().z += velocidade.z;
    }

    public somarVelocityX( velocidade:number ): void{
        this.getVelocity().x += velocidade
    }

    public somarVelocityY( velocidade:number, isExternal:boolean = true ): void{
        // Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getVelocity().y += velocidade
    }

    public somarVelocityZ( velocidade:number ): void{
        this.getVelocity().z += velocidade
    }

    public subtrairVelocityX( velocidade:number ): void{
        this.getVelocity().x -= velocidade
    }

    public subtrairVelocityY( velocidade:number, isExternal:boolean = true ): void{
        // Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getVelocity().y -= velocidade
    }

    public subtrairVelocityZ( velocidade:number ): void{
        this.getVelocity().z -= velocidade
    }

    public somarVelocityEixo(eixo:string, valor:number, isExternal:boolean = true): void{
        switch( eixo ){
            case 'x':
                this.somarVelocityX( valor );
                break;
            case 'y':
                // Diz pra Engine que o objeto recebeu uma velocidade externa
                this.isReceiving_Y_Velocity = isExternal;
                this.somarVelocityY( valor );
                break;

            case 'z':
                this.somarVelocityZ( valor );
                break;
        }
    }

    public subtrairVelocityEixo(eixo:string, valor:number, isExternal:boolean = true): void{
        switch( eixo ){
            case 'x':
                this.subtrairVelocityX( valor );
                break;
            case 'y':
                // Diz pra Engine que o objeto recebeu uma velocidade externa
                this.isReceiving_Y_Velocity = isExternal;
                this.subtrairVelocityY( valor );
                break;

            case 'z':
                this.subtrairVelocityZ( valor );
                break;
        }
    }

    public setVelocity( velocidade:ObjectVelocity, isExternal:boolean = true ): void{
        // Em X
        this.getVelocity().x = velocidade.x;
        
        // Em Y, Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getVelocity().y = velocidade.y 
        
        // Em Z
        this.getVelocity().z = velocidade.z;
    }

    public setVelocityX( velocidade:number ): void{
        this.getVelocity().x = velocidade;
    }

    public setVelocityY( velocidade:number, isExternal:boolean = true ): void{
        // Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getVelocity().y = velocidade;
    }

    public setVelocityZ( velocidade:number ): void{
        this.getVelocity().z = velocidade;
    }

    public setVelocityEixo( eixo:string, velocidade:number, isExternal:boolean = true ): void{
        switch( eixo ){
            case 'x':
                this.setVelocityX( velocidade );
                break;
            case 'y':
                // Diz pra Engine que o objeto recebeu uma velocidade externa
                this.isReceiving_Y_Velocity = isExternal;
                this.setVelocityY( velocidade );
                break;

            case 'z':
                this.setVelocityZ( velocidade );
                break;
        }
    }

    /**
    * Calcula o momento linear do objeto
    */
    public getMomentoLinear(): Position3D{
        const massa     = this.objProps.mass || 0;
        const momento_x = massa * this.getVelocity().x;
        const momento_y = massa * this.getVelocity().y;
        const momento_z = massa * this.getVelocity().z;

        return {
            x: momento_x,
            y: momento_y,
            z: momento_z
        } as Position3D;
    }

    /**
    * Calcula a massa invertida
    */
    public getMassaInvertida(): number{
        const massa     = this.objProps.mass || 0;
        return 1 / massa;
    }

    public getRotation(): ObjectRotation{
        return this.getMesh().rotation;
    }

    public setRotation( rotation: ObjectRotation ): AbstractObjectBase{
        const mesh: MeshRepresentation = this.getMesh();

        mesh.rotation.x = rotation.x;
        mesh.rotation.y = rotation.y;
        mesh.rotation.z = rotation.z;

        //Retorna ele mesmo modificado
        return this;
    }

    public somarRotationX( x:number ): void{
        this.getRotation().x += x;
    }
    
    public somarRotationY( y:number ): void{
        this.getRotation().y += y;
    }

    public somarRotationZ( z:number ): void{
        this.getRotation().z += z;
    }

    /**
    * Acrescenta uma rotação ao objeto
    * @param rotation 
    */
    public somarRotation( rotation:ObjectRotation ): void{
        this.getRotation().x += rotation.x;
        this.getRotation().y += rotation.y;
        this.getRotation().z += rotation.z;
    }

    /**
    * Obtem a força de rotação 
    */
    public getRotationForce(): ObjectForce{
        return this.physicsState.rotationForce;
    }

    /**
    * Obtem a aceleração de rotação 
    */
    public getRotationAcceleration(): ObjectForce{
        return this.physicsState.rotationAcceleration;
    }

    /**
    * Obtem a aceleração de rotação 
    */
    public getRotationVelocity(): ObjectForce{
        return this.physicsState.rotationVelocity;
    }

    public somarRotationVelocityX( velocidadeRotacao:number ){
        this.getRotationVelocity().x += velocidadeRotacao;
    }

    public somarRotationVelocityY( velocidadeRotacao:number ){
        this.getRotationVelocity().y += velocidadeRotacao;
    }

    public somarRotationVelocityZ( velocidadeRotacao:number ){
        this.getRotationVelocity().z += velocidadeRotacao;
    }

    public subtrairRotationVelocityX( velocidadeRotacao:number ){
        this.getRotationVelocity().x -= velocidadeRotacao;
    }

    public subtrairRotationVelocityY( velocidadeRotacao:number ){
        this.getRotationVelocity().y -= velocidadeRotacao;
    }

    public subtrairRotationVelocityZ( velocidadeRotacao:number ){
        this.getRotationVelocity().z -= velocidadeRotacao;
    }

    public somarRotationForceX( velocidadeRotacao:number ){
        this.getRotationForce().x += velocidadeRotacao;
    }

    public somarRotationForceY( velocidadeRotacao:number ){
        this.getRotationForce().y += velocidadeRotacao;
    }

    public somarRotationForceZ( velocidadeRotacao:number ){
        this.getRotationForce().z += velocidadeRotacao;
    }

    public setRotationVelocityX( velocidadeRotacaoX:number ){
        this.getRotationVelocity().x += velocidadeRotacaoX;
    }

    public setRotationVelocityY( velocidadeRotacaoY:number ){
        this.getRotationVelocity().y += velocidadeRotacaoY;
    }

    public setRotationVelocityZ( velocidadeRotacaoZ:number ){
        this.getRotationVelocity().z += velocidadeRotacaoZ;
    }

    /**
    * Deleta o objeto da cena 
    */
    public destroy(): void{
        removeObject( this, this.scene! );
    }

    /**
    * Calcula o voluma do objeto 
    * @returns {number}
    */
    public getVolume(): number {
        const escala = this.getScale();
        return escala.x * escala.y * escala.z;
    }

    /**
    * Atualiza status de colisão e proximidade com outros objetos 
    */
    public updateCollisionState( frameDelta:number ): void{

        const scene       : Scene|null         = this.getScene();
        const esteObjeto  : AbstractObjectBase = this;

        // Ignora se a cena nao existir
        if( !scene ){ return; }

        const objetosCena : AbstractObjectBase[] = scene.objects;

        // Zera as informações de colisão com outros objetos
        this.infoCollisions = {
            objectNames: [],
            objectIDs: [],
            objectClasses: [],
            objects: []
        };

        // Zera as informações de proximidade com outros objetos
        this.infoProximity = {
            objectNames: [],
            objectIDs: [],
            objectClasses: [],
            objects: []
        };

        //Se este objeto pode colidir
        if( (this.objProps.traverse != true) &&
            (this.objProps.collide == true || this.objProps.collide == undefined ) && 
            this.scene != null && 
            this.scene.gravity && 
            this.physicsState.havePhysics == true 
        ){
    
            // Limpa a tabela de colisões do objeto
            if( esteObjeto.scene && esteObjeto.name ){
                esteObjeto.scene.clearObjectCollisionFromTableByName( esteObjeto.name );
            }
            if( esteObjeto.scene && esteObjeto.id ){
                esteObjeto.scene.clearObjectCollisionFromTableByName( esteObjeto.id );
            }
            if( esteObjeto.scene && esteObjeto.objProps.classes ){
                esteObjeto.scene.clearObjectCollisionFromTableByCLASSES( esteObjeto.objProps.classes );
            }

            // Limpa a tabela de proximidade do objeto
            if( esteObjeto.scene && esteObjeto.name ){
                esteObjeto.scene.clearObjectProximityFromTableByName( esteObjeto.name );
            }
            if( esteObjeto.scene && esteObjeto.id ){
                esteObjeto.scene.clearObjectProximityFromTableByID( esteObjeto.id );
            }
            if( esteObjeto.scene && esteObjeto.objProps.classes ){
                esteObjeto.scene.clearObjectProximityFromTableByCLASSES( esteObjeto.objProps.classes );
            }

            for( let objetoAtualCena of objetosCena )
            {
                /**
                * Se o ESTE OBJETO tiver colisão habilitada e colidir com o TAL outro OBJETO
                */
                if( (objetoAtualCena.objProps.traverse != true) &&
                    (objetoAtualCena.objProps.collide == true || objetoAtualCena.objProps.collide == undefined ) && 
                     objetoAtualCena.id != esteObjeto.id 
                ){
    
                    //Se houve uma colisão(usando Bounding Box)
                    if( isCollision( esteObjeto, objetoAtualCena, {x: 0.5, y: 0.5, z: 0.5} ) === true ){
                        // Registra as colisões detectadas
                        if(objetoAtualCena.name){
                            esteObjeto.infoCollisions.objectNames.push( objetoAtualCena.name );

                            //Registra tambem na tabela mestre da cena
                            if( esteObjeto.scene && esteObjeto.name && !esteObjeto.scene.collisionTable.byName[ esteObjeto.name ] ){
                                esteObjeto.scene.collisionTable.byName[ esteObjeto.name ] = [];
                            }
                            if( esteObjeto.scene && esteObjeto.name && !esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.name ] ){
                                esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.name ] = {};
                            }
                            if( esteObjeto.scene && esteObjeto.name ){
                                esteObjeto.scene.collisionTable.byName[ esteObjeto.name ].push( objetoAtualCena );

                                if( objetoAtualCena.name ){ esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = true; }
                                if( objetoAtualCena.id   ){ esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ] = true;   }

                                if( objetoAtualCena.objProps.classes ){
                                    objetoAtualCena.objProps.classes.forEach(function(nomeClasse:string){
                                        if( esteObjeto.scene ){
                                            //As classes tambem são inclusas se houver, para permitir facil acesso
                                            esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.id ][ nomeClasse ] = true;
                                        }
                                    }); 
                                }
                            }
                        }
                        if(objetoAtualCena.id){
                            esteObjeto.infoCollisions.objectIDs.push( objetoAtualCena.id );

                            //Registra tambem na tabela mestre da cena
                            if( esteObjeto.scene && esteObjeto.id && !esteObjeto.scene.collisionTable.byID[ esteObjeto.id ] ){
                                esteObjeto.scene.collisionTable.byID[ esteObjeto.id ] = [];
                            }
                            if( esteObjeto.scene && esteObjeto.id && !esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ] ){
                                esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ] = {};
                            }
                            if( esteObjeto.scene && esteObjeto.id ){
                                esteObjeto.scene.collisionTable.byID[ esteObjeto.id ].push( objetoAtualCena );

                                if( objetoAtualCena.name ){ esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = true; };
                                if( objetoAtualCena.id   ){ esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id ] = true;   };

                                if( objetoAtualCena.objProps.classes ){
                                    objetoAtualCena.objProps.classes.forEach(function(nomeClasse:string){
                                        if( esteObjeto.scene ){
                                            esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ][ nomeClasse ] = true;
                                        }
                                    }); 
                                }
                            }
                        }
                        if(objetoAtualCena.objProps.classes){
                            objetoAtualCena.objProps.classes.forEach(function(nomeClasse:string){
                                esteObjeto.infoCollisions.objectClasses.push( nomeClasse );

                                //Registra tambem na tabela mestre da cena
                                if( esteObjeto.scene && nomeClasse && !esteObjeto.scene.collisionTable.byID[ nomeClasse ] ){
                                    esteObjeto.scene.collisionTable.byClasses[ nomeClasse ] = [];
                                }
                                if( esteObjeto.scene && nomeClasse && !esteObjeto.scene.collisionBinaryTable.byID[ nomeClasse ] ){
                                    esteObjeto.scene.collisionBinaryTable.byClasses[ nomeClasse ] = {};
                                }
                                if( esteObjeto.scene && nomeClasse ){
                                    esteObjeto.scene.collisionTable.byClasses[ nomeClasse ].push( objetoAtualCena );
                                    
                                    if( objetoAtualCena.name ){ esteObjeto.scene.collisionBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = true; };
                                    if( objetoAtualCena.id   ){ esteObjeto.scene.collisionBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ] = true;   };
                                }
                            });
                        }
                        esteObjeto.infoCollisions.objects.push( objetoAtualCena );

                    }

                    //Se houve uma proximidade
                    if( isProximity( esteObjeto, objetoAtualCena, esteObjeto.objProps.proximityConfig ) === true ){
                        // Registra as colisões detectadas
                        if(objetoAtualCena.name){
                            esteObjeto.infoProximity.objectNames.push( objetoAtualCena.name );

                            //Registra tambem na tabela mestre da cena
                            if( esteObjeto.scene && esteObjeto.name && !esteObjeto.scene.proximityTable.byName[ esteObjeto.name ] ){
                                esteObjeto.scene.proximityTable.byName[ esteObjeto.name ] = [];
                            }
                            if( esteObjeto.scene && esteObjeto.name && !esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ] ){
                                esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ] = {};
                            }
                            if( esteObjeto.scene && esteObjeto.name ){
                                esteObjeto.scene.proximityTable.byName[ esteObjeto.name ].push( objetoAtualCena );

                                if( objetoAtualCena.name ){ esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = true; };
                                if( objetoAtualCena.id   ){ esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ] = true;   };
                            }
                        }
                        if(objetoAtualCena.infoProximity){
                            esteObjeto.infoCollisions.objectIDs.push( objetoAtualCena.id );

                            //Registra tambem na tabela mestre da cena
                            if( esteObjeto.scene && esteObjeto.id && !esteObjeto.scene.proximityTable.byID[ esteObjeto.id ] ){
                                esteObjeto.scene.proximityTable.byID[ esteObjeto.id ] = [];
                            }
                            if( esteObjeto.scene && esteObjeto.id && !esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ] ){
                                esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ] = {};
                            }
                            if( esteObjeto.scene && esteObjeto.id ){
                                esteObjeto.scene.proximityTable.byID[ esteObjeto.id ].push( objetoAtualCena );

                                if( objetoAtualCena.name ){ esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = true; };
                                if( objetoAtualCena.id   ){ esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id ] = true;   };
                            }
                        }
                        if(objetoAtualCena.objProps.classes){
                            objetoAtualCena.objProps.classes.forEach(function(nomeClasse:string){
                                esteObjeto.infoProximity.objectClasses.push( nomeClasse );

                                //Registra tambem na tabela mestre da cena
                                if( esteObjeto.scene && nomeClasse && !esteObjeto.scene.proximityTable.byClasses[ nomeClasse ] ){
                                    esteObjeto.scene.proximityTable.byClasses[ nomeClasse ] = [];
                                }
                                if( esteObjeto.scene && nomeClasse && !esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ] ){
                                    esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ] = {};
                                }
                                if( esteObjeto.scene && nomeClasse ){
                                    esteObjeto.scene.proximityTable.byClasses[ nomeClasse ].push( objetoAtualCena );

                                    if( objetoAtualCena.name ){ esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = true; };
                                    if( objetoAtualCena.id   ){ esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ] = true;   };
                                }
                            });
                        }
                        esteObjeto.infoProximity.objects.push( objetoAtualCena );

                    }
                }
            }
        }   

    }

    /**
    * Atualiza a fisica do objeto 
    */
    public updatePhysics( frameDelta:number ): void{

        const esteObjeto  : AbstractObjectBase  = this;
        const scene       : Scene|null          = esteObjeto.scene;

        // Ignora se a cena se nao existir
        if( !scene ){ return; }

        const objetosCena               : AbstractObjectBase[] = scene.objects;
        const gravity                   : Position3D           = ((scene||{}).gravity || {x: 0, y: 0, z: 0});
        const frameDeltaIntensification : number               = (((scene||{}).frameDeltaIntensification || 1));
        const objectPhysicsUpdateRate   : number               = (((scene||{}).objectPhysicsUpdateRate || 10));

        this.isFalling = true;

        //If this object have physics
        if( (this.objProps.traverse != true) &&
            (this.objProps.collide == true || this.objProps.collide == undefined ) && 
            this.scene != null && 
            this.scene.gravity && 
            this.physicsState.havePhysics == true 
        ){
            /**
            * FISICA DE QUEDA DO OBJETO
            * Para cada objeto da cena
            * (Esse laço só executa uma vez por que tem códigos que criei que precisam do BREAK)
            */
            for( let objetoAtualCena of objetosCena )
            {
                /**
                * Se o ESTE OBJETO tiver colisão habilitada e colidir com o TAL outro OBJETO, ele corrige a posição Y DESTE OBJETO, para impedir ultrapassar o TAL outro OBJETO
                */
                if( (objetoAtualCena.objProps.traverse != true) &&
                    (objetoAtualCena.objProps.collide == true || objetoAtualCena.objProps.collide == undefined ) && 
                     objetoAtualCena.id != this.id && 
                     
                     //no ar, o objeto tem um alcançe de colisão maior, pra evitar o bug dele não conseguir detectar o objeto para ele parar em cima ao cair
                     isCollision( this, 
                                  objetoAtualCena, 
                                  (
                                    this.isFalling == true ? {x: 0.8, y: 0.8, z: 0.8} 
                                                           : {x: 0.5, y: 0.5, z: 0.5}
                                  ) 
                     ) === true 
                ){
                    //Corrige a posição Y do objeto pra não ultrapassar o Y do objeto
                    //BUG: Se o cubo ficar em baixo da caixa e subir um pouquinho Y dele, a caixa corrige sua posição e FICA EM CIMA DO CUBO
                    
                    if( this.getPosition().y != undefined && objetoAtualCena.getPosition().y != undefined )
                    {
                        if( this.getPosition().y > objetoAtualCena.getPosition().y )
                        {
                            //Diz que o objeto parou de cair
                            this.isFalling = false;
                            this.groundY = this.getPosition().y; // A posição da ultima colisão
                            this.objectBelow = objetoAtualCena;
                            this.lastObjectBelow = objetoAtualCena;

                            if( this.getVelocity().y == 0 )
                            {
                                // Diz que o objeto parou de receber uma velocidade em Y
                                this.isReceiving_Y_Velocity = false;
                            }
                        }
                    }
                    
                    if( this.getPosition().y            != undefined && 
                        this.getScale().y               != undefined && 
                        objetoAtualCena.getPosition().y != undefined &&
                        objetoAtualCena.getScale().y    != undefined 
                    ){
                        //Impede que o objeto suba em cima de outro objeto
                        if( this.isMovimentoTravadoPorColisao == false && this.getPosition().y < objetoAtualCena.getPosition().y ){
                            this.setPosition({
                                y: objetoAtualCena.getPosition().y - objetoAtualCena.getScale().y - this.getScale().y,

                                // O resto da posição mantém
                                x: objetoAtualCena.getPosition().x,
                                z: objetoAtualCena.getPosition().z
                            })
                        }
                    }
                    //Corrige a posição Y do objeto pra não ultrapassar o Y do objeto
                    //BUG: Se o cubo ficar em baixo da caixa e subir um pouquinho Y dele, a caixa corrige sua posição e FICA EM CIMA DO CUBO
                    /*
                    if( this.getPosition().y > objetoAtualCena.getPosition().y )
                    {
                        this.setPosition({
                            y: objetoAtualCena.getPosition().y + (objetoAtualCena.getScale().y/1.4) + (this.getScale().y/1.4)
                        });

                        //Diz que o objeto parou de cair
                        this.isFalling = false;
                        this.groundY = this.getPosition().y; // A posição da ultima colisão
                        this.objectBelow = objetoAtualCena;
                        this.lastObjectBelow = objetoAtualCena;
                    }
                    */

                    /**
                    * A linha que estava comentada: objetoAtualCena.objProps.havePhysics === false , é desnecessaria, pois, o objeto não precisa ser estatico para nao poder ultrapassar
                    * Porem é mais dificil de testar se objetos tiverem fisica, por que ficam caindo. Mais eu fiz um teste movendo o chao para baixo, e a caixa e o cubo cairam certinho como esperado, e o cubo não conseguiu ultrapassar a caixa por baixo
                    *
                    * DETALHE: Mais se não mover o chao pra baixo não deu pra testar pois quando eu tentei mover o cubo pra ficar em baixo da caixa ele ficou no meio da caixa,
                    * mais isso não é por causa da logica de correação da posição do cubo, mais sim, por que, o cubo a onde ele tava não pode ultrassar a caixa, ai a logica de correção dele jogou ele pra baixo da caixa, porém, isso fez ele ultrapassar o chão, então, ele corrigiu a posição e ficou em cima do chão, o que fez ele ficar no meio da caixa
                    * Eu sei disso por que testei varias vezes, e ao fazer ess teste de mover o chao pra baixo, os dois objetos cairam corretamente como eu queria, e quando cairam no chao, o cubo ficou em baixo da caixa, e quando eu tentei forçar o cubo a ultrapassar a caixa por baixo, ele permaneceu lá em baixo da caixa, então a posição foi corrigida certa, e mesmo assim continuou em cima do chão, o que também é otimo, msotra que ta certo.
                    */

                    // Zera a velocidade do objeto pois ele já caiu
                    if( this.isReceiving_Y_Velocity == false )
                    {
                        //Se é um objeto que pode quicar como uma bola
                        if( this.objProps.kick_rate != undefined ){
                            
                            //Se tem uma velocidade aceitavel para quicar
                            if( Math.abs(this.getVelocity().y) >= 6 )
                            {
                                this.getVelocity().y = ((this.getVelocity().y/1.7) * -1) + this.objProps.kick_rate + (Math.random() * 5) + (Math.random() * this.objProps.kick_rate/2);
                            
                            }else{
                                //Se nao atendeu minha limitação, ele zera normalmente
                                this.getVelocity().y = 0;
                            }

                        //Se é um objeto normal, o Y zera
                        }else{
                            this.getVelocity().y = 0;
                        }
                    }


                    break;
                    //Engine.get('CuboRef').somarVelocity({y:80})
                }
            }

            /**
            * FISICA PARA IMPEDIR MOVIMENTO AO COLIDIR
            * Para cada objeto da cena
            * (Esse laço percorre novamente os objetos porém sem usar o break)
            */
            /*
            for( let objetoAtualCena of objetosCena )
            {
                if( (objetoAtualCena.objProps.traverse != true) &&
                    (objetoAtualCena.objProps.collide == true || objetoAtualCena.objProps.collide == undefined ) && 
                     objetoAtualCena.id != this.id && 
                     isProximity( this, objetoAtualCena, 0, true, false ) === true
                ){
                    // Impede que o objeto ultrapasse a posição X ou Z do outro objeto
                    if( //Se o objectBelow ja tem algum valor
                        this.objectBelow &&
                        //Se nao for o chao/ou o objeto que ele esta em cima
                        objetoAtualCena.id != this.objectBelow.id
                    ){
                        // Bounding boxes de ambos os objetos
                        const posA   : MeshRepresentation  = this.getPosition();
                        const scaleA : MeshRepresentation  = this.getScale();

                        const posB   : MeshRepresentation  = objetoAtualCena.getPosition();
                        const scaleB : MeshRepresentation  = objetoAtualCena.getScale();

                        // Zona do objeto atual
                        const minA = { 
                                       x: posA.x - scaleA.x / 2, 
                                       z: posA.z - scaleA.z / 2,
                                       y: posA.y - scaleA.y / 2
                                     };

                        const maxA = { 
                                       x: posA.x + scaleA.x / 2, 
                                       z: posA.z + scaleA.z / 2,
                                       y: posA.y + scaleA.y / 2
                                     };

                        // Zona do objeto colisor, cujo objeto atual esta intersectando
                        const minB = { 
                                       x: posB.x - scaleB.x / 2, 
                                       z: posB.z - scaleB.z / 2,
                                       y: posB.y - scaleB.y / 2 
                                     };

                        const maxB = { 
                                       x: posB.x + scaleB.x / 2, 
                                       z: posB.z + scaleB.z / 2,
                                       y: posB.y + scaleB.y / 2
                                     };

                        const sobreposicaoX:number = Math.min(maxA.x, maxB.x) - Math.max(minA.x, minB.x);
                        const sobreposicaoZ:number = Math.min(maxA.z, maxB.z) - Math.max(minA.z, minB.z);

                        this.isMovimentoTravadoPorColisao = false;

                        // Se houver sobreposição em algum dos eixos então houve colisão
                        //IDEIA ADICIONAR: && this.getPosition().y <= maxB.y
                        if (sobreposicaoX > 0 && sobreposicaoZ > 0 ) 
                        {
                            //Se for o jogador não quero usar tolerando pra não bugar a posição dele
                            //Mais se for objetos, eu uso pra evitar eles "grudarem" ao colidirem
                            const tolerancia = this.name != 'Player' ? 1.2 : 0.0;

                            // Corrigir no eixo de menor sobreposição (para evitar "grudar" no canto)
                            if (sobreposicaoX < sobreposicaoZ) {
                                // Empurra no X
                                if (posA.x < posB.x) {
                                    //this.getPosition().x -= (sobreposicaoX + tolerancia);
                                    
                                    if( posA.x < minB.x ){
                                        this.getPosition().x -= (sobreposicaoX + tolerancia);
                                    }

                                } else {
                                    //this.getPosition().x += (sobreposicaoX + tolerancia);
                                    
                                    if( posA.x > maxB.x ){
                                        this.getPosition().x += (sobreposicaoX + tolerancia);
                                    }
                                }
                                //this.getVelocity().x = 0;

                            } else {
                                // Empurra no Z
                                if (posA.z < posB.z) {
                                    //this.getPosition().z -= (sobreposicaoZ + tolerancia);
                                    
                                    if( posA.z < minB.z ){
                                        this.getPosition().z -= (sobreposicaoZ + tolerancia);
                                    }

                                } else {
                                    //this.getPosition().z += (sobreposicaoZ + tolerancia);
                                    
                                    if( posA.z > maxB.z ){
                                        this.getPosition().z += (sobreposicaoZ + tolerancia);
                                    }
                                }
                                //this.getVelocity().z = 0;
                            }

                            this.isMovimentoTravadoPorColisao = true;
                        }
                        
                    }
                }
            }*/

            /**
            * Se o objeto está caindo 
            */
            if( this.isFalling === true )
            {
                /**
                * Sinaliza que um movimento para baixo está ocorrendo neste objeto 
                */
                this.movimentSinalyzer.down = true;

                /**
                * Enquanto o objeto estiver caindo, ele não tem objeto abaixo dele 
                */
                this.objectBelow = null;
            
                if( this.getVelocity().y != undefined && this.getPosition().y != undefined )
                {
                    /**
                    * Faz o object decrementar a posição Y com a gravidade
                    */
                    this.getVelocity().y -= this.scene.gravity.y;
                    //this.isReceiving_Y_Velocity = false; //Aqui tambem é algo interno da Engine

                    /**
                    * Executa os eventos de queda 
                    */
                    this.objEvents
                    .getEventos()
                    .forEach(function(eventosObjeto:ObjectEvents){

                        //Chama o evento whenFall
                        if( eventosObjeto.whenFall )
                        {
                            esteObjeto.callEvent( eventosObjeto.whenFall, {
                                self     : esteObjeto,
                                instante : new Date().getTime()
                            });
                        }

                    });
                }

                /**
                * Aplica fisica de rotação na queda de acordo com o vento
                */
                if( this.scene.sceneConfig.haveWind == true )
                {
                    if( this.objProps.name != 'Player' ){
                        const wind:Wind = this.scene.wind;
                        const randomX = Math.random() * 0.001;
                        const randomY = Math.random() * 0.001;
                        const randomZ = Math.random() * 0.001;

                        this.somarRotation({
                            x: (randomX + wind.orientation.x) * wind.intensity.x * Math.abs(gravity.y) * 4.8 * frameDelta * frameDeltaIntensification,
                            y: (randomY + wind.orientation.y) * wind.intensity.y * Math.abs(gravity.y) * 4.8 * frameDelta * frameDeltaIntensification,
                            z: (randomZ + wind.orientation.z) * wind.intensity.z * Math.abs(gravity.y) * 4.8 * frameDelta * frameDeltaIntensification
                        });

                        //O vento tambem empurra um pouco na queda 
                        this.somarForce({
                            x: (randomX + wind.deslocationTrend.x + wind.orientation.x) * wind.intensity.x,
                            y: (randomY + wind.deslocationTrend.y + wind.orientation.y) * wind.intensity.y,
                            z: (randomZ + wind.deslocationTrend.z + wind.orientation.z) * wind.intensity.z
                        
                        //(como velocidade interna da engine)
                        }, false);
                    }
                }

            // Se o objeto não está caindo
            }else{
                //Se ele já está no chão
                if( this.objectBelow != null && this.objProps.name != 'Player' ){
                    this.setRotation({x:0, y: 0, z: 0});
                }

            }

            // Se existe gravidade em outras direções
            if( this.scene.gravity.x != 0 )
            {
                this.getVelocity().x -= this.scene.gravity.x;
            }

            // Se existe gravidade em outras direções
            if( this.scene.gravity.z != 0 )
            {
                this.getVelocity().z -= this.scene.gravity.z;
            }

        }

    }

    /**
    * Atualiza a rotação do objeto, e do objeto em relação aos outros objetos na cena
    */
    public updateRotation( frameDelta:number ): void{

        const objeto : AbstractObjectBase  = this;
        const scene  : Scene|null          = objeto.getScene();

        // Ignora se a cena nao existir
        if( !scene ){
            return;
        }

        const massaObjeto      : number          = objeto.getMass();
        const gravity          : Position3D      = ((scene||{}).gravity || {x: 0, y: 0, z: 0});
        const atrito           : number          = (((scene||{}).atrito || 0));
        const arrastoAr        : number          = (((scene||{}).arrastoAr || 0));
        const frameDeltaIntensification: number  = (((scene||{}).frameDeltaIntensification || 1));
        const objectPhysicsUpdateRate:number     = (((scene||{}).objectPhysicsUpdateRate || 10));
        const objectPhysicsDesaceleracaoUpdateRate:number = (((scene||{}).objectPhysicsDesaceleracaoUpdateRate || 2));
        const movimentState:MovementState        = objeto.movimentState;

        const objetosCena : AbstractObjectBase[] = scene.objects;

        const forcaVelocidadeObjeto      = objeto.getRotationForce();
        const aceleracaoRotacaoObjeto    = objeto.getRotationAcceleration();
        
        /**
        * Calcula a aceleração da velocidade do objeto 
        */
        aceleracaoRotacaoObjeto.x = forcaVelocidadeObjeto.x / massaObjeto;
        aceleracaoRotacaoObjeto.y = forcaVelocidadeObjeto.y / massaObjeto;
        aceleracaoRotacaoObjeto.z = forcaVelocidadeObjeto.z / massaObjeto;

        /**
        * Aplica aceleração da velocidade nos seus eixos
        */
        objeto.somarRotationVelocityX( aceleracaoRotacaoObjeto.x );
        objeto.somarRotationVelocityY( aceleracaoRotacaoObjeto.y );
        objeto.somarRotationVelocityZ( aceleracaoRotacaoObjeto.z );

        /**
        * Atualiza a rotação do objeto
        */
        objeto.somarRotationX( objeto.getRotationVelocity().x * frameDelta );
        objeto.somarRotationY( objeto.getRotationVelocity().y * frameDelta );
        objeto.somarRotationZ( objeto.getRotationVelocity().z * frameDelta );

        /**
        * Aplica uma desaceleração na velocidade de rotação atual 
        */
        const velocidadeRotacao   = objeto.getRotationVelocity();
        const sinalX              = Math.sign(velocidadeRotacao.x);
        const sinalY              = Math.sign(velocidadeRotacao.y);
        const sinalZ              = Math.sign(velocidadeRotacao.z);

        //Engine.get('CuboRef').somarRotationForceX(1500)

        /**
        * Para a rotação gradualmente 
        */
        if( velocidadeRotacao.x != 0 )
        {
            if( sinalX == 1 ){
                objeto.subtrairRotationVelocityX( gravity.y );
            }else{
                objeto.somarRotationVelocityX( gravity.y );
            }
            
        }

        if( velocidadeRotacao.y != 0 )
        {
            if( sinalY == 1 ){
                objeto.subtrairRotationVelocityY( gravity.y );
            }else{
                objeto.somarRotationVelocityY( gravity.y  );
            }
        }

        if( velocidadeRotacao.z != 0 )
        {
            if( sinalZ == 1 ){
                objeto.subtrairRotationVelocityZ( gravity.y );
            }else{
                objeto.somarRotationVelocityZ( gravity.y );
            }
        }

        //Engine.get('CuboRef').somarRotationForceX(400)
    }

    /**
    * Atualiza a movimentação do objeto, e do objeto em relação aos outros objetos na cena, como por exemplo objetos que podem carregar ele
    */
    public updateMovement( frameDelta:number ): void{

        const objeto           : AbstractObjectBase    = this;
        const velocidadeObjeto : ObjectVelocity        = objeto.getVelocity();
        const aceleracaoObjeto : ObjectAcceleration    = objeto.getAcceleration();
        const forcaObjeto      : ObjectForce           = objeto.getForce();
        const massaObjeto      : number                = objeto.getMass();
        const scene            : Scene|null            = objeto.scene;
        const gravity          : Position3D            = ((scene||{}).gravity || {x: 0, y: 0, z: 0});
        const atrito           : number                = (((scene||{}).atrito || 0));
        const arrastoAr        : number                = (((scene||{}).arrastoAr || 0));
        const frameDeltaIntensification: number        = (((scene||{}).frameDeltaIntensification || 1));
        const objectPhysicsUpdateRate:number           = (((scene||{}).objectPhysicsUpdateRate || 10));
        const objectPhysicsDesaceleracaoUpdateRate:number = (((scene||{}).objectPhysicsDesaceleracaoUpdateRate || 2));
        const movimentState:MovementState                 = objeto.movimentState;

        // Ignora se a cena nao existir
        if( !scene ){
            return;
        }

        const objetosCena : AbstractObjectBase[] =  scene.objects;

        /**
        * Salva posição atual do objeto ANTES DE QUALQUER MOVIMENTO OCORRER, como sendo a posição anterior dele,
        * Pois se um movimento ocorrer, a posição anterior vai estar registrada para fins de calculos. 
        */
        objeto.lastPosition = { 
                                x: Number( objeto.getPosition().x ),
                                y: Number( objeto.getPosition().y ),
                                z: Number( objeto.getPosition().z ),
                              } as ObjectPosition;

        /**
        * Movimento simples de objeto, SEM USAR FISICA 
        * Realiza uma movimentação simples, para cada uma das direções possiveis, sem usar fisica.
        */
        if( movimentState.forward == true ){
            objeto.somarPosicaoX( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
            objeto.movimentSinalyzer.forward = true;
        }
        if( movimentState.backward == true ){
            objeto.subtrairPosicaoX( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
            objeto.movimentSinalyzer.backward = true;
        }
        if( movimentState.left == true ){
            objeto.subtrairPosicaoZ( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
            objeto.movimentSinalyzer.left = true;
        }
        if( movimentState.right == true ){
            objeto.somarPosicaoZ( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
            objeto.movimentSinalyzer.right = true;
        }

        /**
        * Fisica da aceleração do objeto que afeta a velocidade do objeto 
        */

        /**
        * Calcula a aceleração do objeto 
        */
        aceleracaoObjeto.x = forcaObjeto.x / massaObjeto;
        aceleracaoObjeto.y = forcaObjeto.y / massaObjeto;
        aceleracaoObjeto.z = forcaObjeto.z / massaObjeto;

        /**
        * Calcula o peso do objeto 
        */
        objeto.weight = massaObjeto * gravity.y;

        /**
        * Aplica aceleração nos seus eixos
        */
        objeto.somarVelocityX( aceleracaoObjeto.x );
        objeto.somarVelocityY( aceleracaoObjeto.y, false );
        objeto.somarVelocityZ( aceleracaoObjeto.z );

        /**
        * Fisica de movimento de acordo com a velocidade com desaceleração gradual da velocidade.
        * OBS: Aqui não tem mecanica de acionar movimentos de acordo com o movimentState, apenas lida com a atualização do movimento e faz a desaceleração natural QUANDO O OBJETO TEM UMA VELOCIDADE ATIVA EM SEUS EIXOS
        */
        const velocidadeX = velocidadeObjeto.x;
        const sinalX      = Math.sign(velocidadeX);

        const velocidadeY = velocidadeObjeto.y;
        const sinalY      = Math.sign(velocidadeY);

        const velocidadeZ = velocidadeObjeto.z;
        const sinalZ      = Math.sign(velocidadeZ);
        
        if( velocidadeX != 0 )
        {   
            objeto.somarPosicaoX( velocidadeX * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

            // Vai desacelerando
            let novaVelocidadeX = (velocidadeObjeto.x - objectPhysicsDesaceleracaoUpdateRate * sinalX * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

            // Se o sinal da velocidade é diferente do sinal anterior (pra impedir de começar a andar para traz depois de a força acabar)
            if(Math.sign(novaVelocidadeX) !== sinalX){
                novaVelocidadeX = 0;
            }

            //No ar, ele vai ter arrasto do ar
            if( objeto.isFalling == true ){
                objeto.setVelocityX( novaVelocidadeX * arrastoAr );

            //No chao, ele vai ter atrito
            }else{
                objeto.setVelocityX( novaVelocidadeX * atrito );
            }

            // Indica qual direção o objeto está se movendo
            if( sinalX == 1 ){
                objeto.movimentSinalyzer.forward = true;
            }else{
                objeto.movimentSinalyzer.backward = true;
            }
        }   

        //Se o objeto não estiver caindo e SE NÂO ESTIVER NO CHÂO OU EM CIMA DE ALGO
        //BUG: O EIXO Y NÂO CONSEGUE RECEBER UMA VELOCIDADE IGUAL NOS OUTROS POR CAUSA DA FISICA DE QUEDA QUE MANIPULA O EIXO Y
        if( velocidadeY != 0 )
        {   
            objeto.somarPosicaoY( velocidadeY * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

            /** 
            * Se o objeto está recebendo uma aceleração externa em Y
            * (se não tivesse essa verificação iria dar conflito com a lógica da queda, eu testei)
            */
            if( this.isReceiving_Y_Velocity == true )
            {
                let novaVelocidadeY = ( velocidadeObjeto.y - objectPhysicsDesaceleracaoUpdateRate * sinalY );

                // Se o sinal da velocidade é diferente do sinal anterior (pra impedir de começar a andar para traz depois de a força acabar)
                if(Math.sign(novaVelocidadeY) !== sinalY){
                    novaVelocidadeY = 0;
                }

                objeto.setVelocityY( novaVelocidadeY * arrastoAr, false );
            }

            // Indica qual direção o objeto está se movendo
            if( sinalY == 1 ){
                objeto.movimentSinalyzer.up = true;
            }else{
                objeto.movimentSinalyzer.down = true;
            }

        }
        
        //globalContext.get('CuboRef').somarVelocity({x:5})
        if( velocidadeZ != 0 )
        {   
            objeto.somarPosicaoZ( velocidadeZ * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

            let novaVelocidadeZ = (velocidadeObjeto.z - objectPhysicsDesaceleracaoUpdateRate * sinalZ * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

            // Se o sinal da velocidade é diferente do sinal anterior (pra impedir de começar a andar para traz depois de a força acabar)
            if(Math.sign(novaVelocidadeZ) !== sinalZ){
                novaVelocidadeZ = 0;
            }

            //No ar, ele vai ter arrasto do ar
            if( objeto.isFalling == true ){
                objeto.setVelocityZ( novaVelocidadeZ * arrastoAr );

            //No chao, ele vai ter atrito
            }else{
                objeto.setVelocityZ( novaVelocidadeZ * atrito );
            }

            // Indica qual direção o objeto está se movendo
            if( sinalZ == 1 ){
                objeto.movimentSinalyzer.right = true;
            }else{
                objeto.movimentSinalyzer.left = true;
            }
        }  

        //Engine.get('CuboRef').getPosition().x = Engine.get('CaixaRef').getPosition().x
        //Engine.get('CuboRef').getPosition().y = Engine.get('CaixaRef').getPosition().y + 50
        //Engine.get('CaixaRef').somarVelocity({x: 10});
        //Engine.get('CaixaRef').somarVelocity({x: 120});

        /**
        * Se o objeto atual estiver em cima de outro objeto, este objeto o carrega junto ao ser mover
        * OBS: Isso tava anulando a fisica de desaceleração e só funcionava ao realizar movimentos com força de aceleração E NAO TA FUNCIONANDO EM MOVIMENTOS SIMPLES
        * Pra nao anular a fisica de desaceleração eu adicionei limitações.
        * 
        * Explicação: Se um objeto recebe uma força, e tem outro objeto em cima dele, esse objeto é carregado em cima dele junto, como se fosse uma plataforma que pode carregar outros objetos em cima dele. 
        * Essa fisica não é aplicada se o objeto estiver em cima do chão e nem em cima de objetos sem fisica pra evitar anular a fisica de desaceleração
        *
        * O delta da velocidade aqui nesse contexto é um pequeno valor numérico que vai dizer o quanto o objeto vai ter que andar para poder acompanhar o objeto abaixo dele
        *
        * Em outras palavras: 
        * Esse código faz com que, se um determinado objeto estiver em cima de outro objeto que está se movendo, Então, esse objeto que está em cima dele se move junto
        */
        if( objeto.objectBelow != undefined && 
            objeto.objectBelow != null &&
            //O objeto abaixo precisa ter fisica e poder colidir
            objeto.objectBelow.objProps.havePhysics == true &&
            objeto.objectBelow.objProps.collide == true &&
            //O objeto atual tambem precisa ter fisica e poder colidir
            objeto.objProps.havePhysics == true &&
            objeto.objProps.collide == true &&
            //Essa regra não vale para chãos
            objeto.objectBelow.haveClass('ground') == false
        ){
             const esteObjeto       = objeto;
             const objetoAbaixoDele = objeto.objectBelow;
             
             const coeficiente     = 0.5; // pode ser dinâmico
             const massa           = esteObjeto.getMass();
             const normal          = massa * Math.abs(gravity.y);
             const atritoCalculado = coeficiente * normal;

             const deltaVelocidadeX = objetoAbaixoDele.getVelocity().x - esteObjeto.getVelocity().x;
             const deltaVelocidadeZ = objetoAbaixoDele.getVelocity().z - esteObjeto.getVelocity().z;

             const forcaX = Math.min(Math.abs(deltaVelocidadeX), atritoCalculado) * Math.sign(deltaVelocidadeX);
             const forcaZ = Math.min(Math.abs(deltaVelocidadeZ), atritoCalculado) * Math.sign(deltaVelocidadeZ);

             // Acompanha o movimento do objeto que ele está em baixo 
             esteObjeto.getVelocity().x += forcaX;
             esteObjeto.getVelocity().z += forcaZ;   
        } 
        
        /**
        * Quase identifico ao anterior:
        * Outra lógica para criar mecanica do objeto ao se mover carregar outro objeto que está em cima dele 
        * PORÈM especifico para objetos que não tem fisica e usam movimentos não orientados a força, para contornar a limitação do anterior
        * 
        * Em outras palavras: 
        * Esse código faz com que, se um determinado objeto estiver em cima de outro objeto que está se movendo, Então, esse objeto que está em cima dele se move junto
        */
        //Engine.get('CaixaRef').movimentState.forward = true;
        //Engine.get('Cubo2Ref').movimentState.forward = true;
        //Engine.get('Cubo2Ref').somarX(45);
        if( objeto.objectBelow != undefined && 
            objeto.objectBelow != null &&
            //O objeto abaixo NÂO PODE TER fisica
            objeto.objectBelow.objProps.havePhysics == false &&
            // Porém o objeto ainda assim deve colidir
            objeto.objectBelow.objProps.collide == true &&
            //Essa regra não vale para chãos
            objeto.objectBelow.haveClass('ground') == false
        ){
            const esteObjeto          = objeto;
            const objetoAbaixoDele    = objeto.objectBelow;
            const posicaoAtualDele    = objetoAbaixoDele.getPosition();
            const posicaoAnteriorDele = objetoAbaixoDele.getLastPosition();

            const deltaPosicaoX       = posicaoAtualDele.x! - (posicaoAnteriorDele.x || 0);
            const deltaPosicaoZ       = posicaoAtualDele.z! - (posicaoAnteriorDele.z || 0);

            // Acompanha o movimento do objeto que ele está em baixo 
            esteObjeto.getPosition().x += deltaPosicaoX;
            esteObjeto.getPosition().z += deltaPosicaoZ;
        }
        
    }

    /**
    * Atualize objetos anexados/grudados 
    */
    public updateAttachments( frameDelta:number ): void{

        const objeto  : AbstractObjectBase = this;
        const scene   : Scene|null         = objeto.getScene();

        if(!scene){ return; }

        if( objeto.objProps.attachments )
        {                                                
            /**
            * Para cada objeto da cena
            */
            for( let anexo of objeto.objProps.attachments )
            {   
                const nomeObjetoAnexar : string             = anexo.name;
                const objetoAnexar     : AbstractObjectBase = scene.getObjectByName( nomeObjetoAnexar );
                           
                // Se ele NÂO DEVE COLIDIR COM O OBOJETO DONO DO ANEXO
                if( anexo.attacherCollision == false )
                {
                    if( includeString(objeto.objProps.ignoreCollisions, objetoAnexar.id) == false ){ 
                        objeto.objProps.ignoreCollisions.push( objetoAnexar.id );
                    }
                }

                // Se tem um ajuste de posição EM RELAÇÂO AO OBJETO, aplica
                // Acompanha a posição do objeto
                objetoAnexar.setPosition( objeto.getPosition() as ObjectPosition );

                // Alem disso, permite fazer um ajuste de posição
                objetoAnexar.somarX( anexo.position.x );
                objetoAnexar.somarY( anexo.position.y );
                objetoAnexar.somarZ( anexo.position.z );

                //Se vai copiar a memsa escala do objeto
                if( anexo.sameScale == true ){
                    objetoAnexar.setScale( objeto.getScale() as ObjectScale );
                }

                // Se tem uma escala especifica para ele
                objetoAnexar.setScale( anexo.scale );

                // Se tem redução de escala
                objetoAnexar.somarEscalaX( anexo.scaleReduce.x );
                objetoAnexar.somarEscalaY( anexo.scaleReduce.y );
                objetoAnexar.somarEscalaZ( anexo.scaleReduce.z );

                //Se tem rotação
                objetoAnexar.setRotation( anexo.rotation );

                //Se tem incremento de rotação nos eixos
                objetoAnexar.somarRotation( anexo.rotationIncrement );

                //Se tem outras coisas
                objetoAnexar.objProps.traverse = anexo.traverse;
                objetoAnexar.objProps.collide = anexo.collide;
                
                objetoAnexar.objProps.havePhysics = anexo.havePhysics;
                objetoAnexar.physicsState.havePhysics = anexo.havePhysics;

                objetoAnexar.objProps.collisionEvents = anexo.collisionEvents;
                objetoAnexar.objProps.invisible = anexo.invisible;
            }        
        }                                               

    }

    /**
    * Chama um evento 
    */
    public callEvent( funcaoEvento:Function, parametros:any ): void{
        const objeto  = this;
        funcaoEvento.bind(objeto)( parametros );
    }

    /**
    * Atualiza os eventos internos do objeto 
    */
    public updateEvents( frameDelta:number ): void{
        const scene   : Scene|null          = this.getScene();
        const objeto  : AbstractObjectBase  = this;
        const eventos : ObjectEventLayer    = objeto.objEvents;

        if(!scene){ return; }

        //Se tem eventos
        if( eventos )
        {   
            // Para cada bloco de evento
            for( let eventosObjeto of eventos.getEventos() )
            {
                const objetosCena: AbstractObjectBase[] = scene.objects;

                // Se o objeto pode colidir e Se existe o evento whenCollide
                if( (objeto.objProps.collide != false || objeto.objProps.collisionEvents == true) && 
                    eventosObjeto.whenCollide 
                ){
                    
                    // Para cada objeto na cena, verifica se colidiu com este objeto
                    for( let objetoAtualCena of objetosCena ){
            
                        //Se ESTE objeto COLIDIR com o objeto atual da cena 
                        if( 
                            // Se não for ele mesmo
                            objetoAtualCena.id != objeto.id &&
                            
                            //Se o objetoAtualCena tem colisão habilitada
                            (objetoAtualCena.objProps.collide == true || objetoAtualCena.objProps.collisionEvents == true) &&
                            
                            //Se o objeto atual NÂO tiver uma exceção para o objetoAtualCena
                            (
                                //Se ele inclui o ID ou se não tem ignoreColisions nem entra
                                includeString(objeto.objProps.ignoreCollisions, objetoAtualCena.id) == false &&
                                //Se ele tem nome o nome é uma excessao ou se ele não tem name, nem entra
                                includeString(objeto.objProps.ignoreCollisions, objetoAtualCena.name) == false &&
                                // Se o ignoreCollisions do outro objeto(o objeto B) NÂO inclui alguma classe que o objeto A tenha
                                objectANOTHaveSomeClassesIgnoredByObjectB( objeto, objetoAtualCena )
                            ) &&
                            //Se o objetoAtualCena NÂO tiver uma exceção para o objeto
                            (   
                                includeString(objetoAtualCena.objProps.ignoreCollisions, objeto.id) == false && 
                                includeString(objetoAtualCena.objProps.ignoreCollisions, objeto.name) == false &&
                                objectANOTHaveSomeClassesIgnoredByObjectB( objetoAtualCena, objeto )
                            ) &&
                            /** Se houve uma colisão de fato **/
                            (
                                isCollision( objeto, objetoAtualCena, {x: 0.5, y: 0.5, z: 0.5} ) == true 
                            )
                        ) {
                            objeto.callEvent( eventosObjeto.whenCollide, {
                                self     : objeto,
                                target   : objetoAtualCena,
                                instante : new Date().getTime(),
                                subjects : [ objeto.id, objetoAtualCena.id ],
                                distance : getDistance(objeto, objetoAtualCena) 
                            });
                        }
                        
                    }
                }

                //Se tem o evento whenProximity
                if( eventosObjeto.whenProximity )
                {
                    // Para cada objeto na cena, verifica se colidiu com este objeto
                    for( let objetoAtualCena of objetosCena ){
                        if( 
                            // Se não for ele mesmo
                            objetoAtualCena.id != objeto.id &&
                            isProximity( objeto, objetoAtualCena, objeto.objProps.proximityConfig ) == true
                        ){
                            objeto.callEvent( eventosObjeto.whenProximity, {
                                self     : objeto,
                                target   : objetoAtualCena,
                                instante : new Date().getTime(),
                                subjects : [ objeto.id, objetoAtualCena.id ],
                                proximityConfig: objeto.objProps.proximityConfig,
                                distance : getDistance(objeto, objetoAtualCena) 
                            });
                        }
                    }
                }

                //Se tem o evento loop(um evento sem condições que sempre será executado se existir, pra permitir criar loops especificos para cada objeto)
                if( eventosObjeto.loop )
                {
                    eventosObjeto.loop.bind(objeto)(objeto);
                }
            }

        }
    }

    /**
    * Reseta algumas coisas após cada frame terminar
    */
    public reset_loop_afterframe(): void{

        /**
        * Zera o vetor de força deste ObjectBase 
        * Isso pra evitar que a força seja infinita, e para fazer com que a força seja algo momentaneo e não se acumule de forma indevida
        */
        this.physicsState.force.x = 0;
        this.physicsState.force.y = 0;
        this.physicsState.force.z = 0;

        /**
        * Zera o vetor de força de rotação deste ObjectBase 
        * Isso pra evitar que a força de rotação seja infinita, e para fazer com que a força de rotação seja algo momentaneo e não se acumule de forma indevida
        */
        this.physicsState.rotationForce.x = 0;
        this.physicsState.rotationForce.y = 0;
        this.physicsState.rotationForce.z = 0;

    }

    public updateObject( firstRender: boolean, renderizadorPronto: boolean, frameDelta:number, frameNumber: number ): void{
        if( renderizadorPronto == true )
        {
            /**
            * Reseta algumas coisas antes do loop 
            */
            this.pre_loop_reset();

            /**
            * Principal: Fisica, Movimentação e Eventos 
            */
            this.updatePhysics( frameDelta );
            
            /**
            * Igualmente importante, atualiza quais objetos estão colidindo/e os que estão proximos com quais objetos 
            */
            this.updateCollisionState( frameDelta );

            /**
            * Atualiza os movimentos do objeto 
            */
            this.updateMovement( frameDelta );

            /**
            * Atualiza a rotação do objeto 
            */
            this.updateRotation( frameDelta );
            

            /**
            * Atualiza os eventos do objeto 
            */
            this.updateEvents( frameDelta );

            /**
            * Atualiza os "attachments" ou "objeto anexados/grudados" ao objeto atual
            */
            this.updateAttachments( frameDelta );

            /**
            * Reseta algumas coisas depois do frame atual terminar
            */
            this.reset_loop_afterframe();
        }
    }

    /**
    * Outros métodos 
    */

    /**
    * Verifica se um objeto está colidindo com ESTE OBJETO
    * @param outroObjeto 
    * @returns {boolean}
    */
    isCollisionOf( outroObjeto:AbstractObjectBase|string, limites:ProximityBounds ): boolean
    {
        let objetosColidindo : AbstractObjectBase[] = [];
        let esteObjeto       : AbstractObjectBase   = this;
        let scene            : Scene|null           = esteObjeto.getScene();

        if(scene)
        {
            return scene.queryIfObjectIsCollisionOf( this, outroObjeto, limites );
        }

        return false;
    }

    /**
    * Traz todos os objetos que estão colidindo com ESTE OBJETO
    */
    getCollisions( limites:ProximityBounds = {x:0, y:0, z:0}, 
                   recalculate:boolean = false  

    ): AbstractObjectBase[]
    {
        let objetosColidindo : AbstractObjectBase[] = [];
        let esteObjeto       : AbstractObjectBase   = this;
        let scene            : Scene|null           = esteObjeto.getScene();

        //Se não tem limites personalizados
        if( recalculate == false ){
            objetosColidindo = [... this.infoCollisions.objects]; // Faz uma copia do array

        //Se tem limites de zona de colisão personalizado
        }else{
            if(scene)
            {
                //Traz só os objetos que estão colidindo dentro da zona definida no "limites"
                for( let i = 0 ; i < scene.objects.length ; i++ )
                {
                    const objetoAtual : AbstractObjectBase = scene.objects[i];

                    // Se está colidindo
                    if( isCollision( esteObjeto, objetoAtual, limites ) == true && esteObjeto.id !== objetoAtual.id )
                    {
                        objetosColidindo.push( objetoAtual );
                    }
                }
            }
        }

        return objetosColidindo;
    }

    /**
    * Traz todos os objetos que estão proximos DESTE OBJETO
    */
    getProximity( limites:ProximityBounds = {x:0, y:0, z:0}, 
                  recalculate:boolean = false 
                  
    ): AbstractObjectBase[]
    {
        let objetosColidindo : AbstractObjectBase[] = [];
        let esteObjeto       : AbstractObjectBase   = this;
        let scene            : Scene|null           = esteObjeto.getScene();

        //Se não tem limites personalizados
        if( recalculate == false ){
            objetosColidindo = [...this.infoProximity.objects]; // Faz uma copia do Array

        //Se tem limites de zona de colisão personalizado
        }else{
            if(scene)
            {
                //Traz só os objetos que estão proximos dentro da zona definida no "limites"
                for( let i = 0 ; i < scene.objects.length ; i++ )
                {
                    const objetoAtual : AbstractObjectBase = scene.objects[i];

                    // Se está colidindo
                    if( isProximity( esteObjeto, objetoAtual, limites ) && esteObjeto.id !== objetoAtual.id )
                    {
                        objetosColidindo.push( objetoAtual );
                    }
                }
            }
        }

        return objetosColidindo;
    }

    /**
    * Verifica se um objeto está proximo DESTE OBJETO
    * @param outroObjeto 
    * @returns {boolean}
    */
    isProximityOf( outroObjeto:AbstractObjectBase|string, limites:ProximityBounds ): boolean{
        let objetosColidindo : AbstractObjectBase[] = [];
        let esteObjeto       : AbstractObjectBase   = this;
        let scene            : Scene|null           = esteObjeto.getScene();

        if(scene)
        {
            return scene.queryIfObjectIsProximityOf( this, outroObjeto, limites );
        }

        return false;
    }
}