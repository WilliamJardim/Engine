/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectProps         from '../interfaces/main_engine/ObjectProps';
import MovementState       from '../interfaces/main_engine/MovementState';
import ObjectPosition      from '../interfaces/main_engine/ObjectPosition';
import Scene               from './Scene';
import ObjectEvents        from '../interfaces/main_engine/ObjectEvents';
import ObjectEventLayer    from '../interfaces/main_engine/ObjectEventBlock';
import isCollision         from '../utils/main_engine/isCollision';
import isProximity         from '../utils/main_engine/isProximity';
import ProximityBounds     from '../interfaces/main_engine/ProximityBounds';
import getDistance         from '../utils/main_engine/getDistance';
import ObjectVelocity      from '../interfaces/main_engine/ObjectVelocity';
import ObjectScale         from '../interfaces/main_engine/ObjectScale';
import ObjectAttachment    from '../interfaces/main_engine/ObjectAttachment';
import ObjectRotation      from '../interfaces/main_engine/ObjectRotation';
import Wind                from '../interfaces/main_engine/Wind';
import MeshRepresentation  from "../interfaces/main_engine/MeshRepresentation";
import ObjectAcceleration  from "../interfaces/main_engine/ObjectAcceleration";
import ObjectForce         from "../interfaces/main_engine/ObjectForce";
import Position3D          from "../interfaces/main_engine/Position3D";
import VelocityStatus      from "../interfaces/main_engine/VelocityStatus";
import ObjectFrameTracker  from "./ObjectFrameTracker";
import includeString       from "../utils/array/includeString";
import objectANOTHaveSomeClassesIgnoredByObjectB from "../utils/main_engine/array/objectANOTHaveSomeClassesIgnoredByObjectB";
import AbstractObjectBase  from "./AbstractObjectBase";
import Mapa                from '../utils/dicionarios/Mapa';
import { float, int, Ponteiro }        from '../types/types-cpp-like';

/**
* O ObjectBase aqui é uma classe implementada, que herda do AbstractObjectBase,
* e no ObjectBase, ele tem todos os atributos que o AbstractObjectBase tem, e implementa todos os métodos, com exatamente os mesmos parametros e tipo de retornos
* E na realidade, em C++, a ideia do polimorfismo iria prevalecer, seguindo a regra de que em qualquer lugar que eu precise aceitar qualquer objetos derivado da classe AbstractObjectBase, eu vou usar AbstractObjectBase*, ou seja, um ponteiro dessa classe
* e isso automaticamente aceita tanto instancias de AbstractObjectBase, quanto de ObjectBase, ou outras derivadas de AbstractObjectBase
*/ 

export default class ObjectBase extends AbstractObjectBase
{    
    /**
    * Um ObjectBase possui todos os atributos declarados que o AbstractObjectBase possui
    * Para que o polimorfismo funcione bem, NÂO SE DEVE REDECLARAR ATRIBUTOS QUE A CLASSE MAE JA TEM
    */
   
    constructor( objProps : ObjectProps )
    {
        super( objProps );
    
        this.objProps     = objProps;
        this.lastPosition = {x: 0, y: 0, z: 0} as ObjectPosition;
        this.weight       = 0;
        this.onCreate     = this.objProps.onCreate;
        this.groundY      = 0;

        // objectBelow é um ponteiro, ele pode ser nulo na criação, mais ele será vinculado dinamicamente pela propia logica da engine
        this.objectBelow     = null;
        this.lastObjectBelow = null;
        this.isMovimentoTravadoPorColisao = false; //Se o objeto atual esta travado por que esta tentando se mover para uma direção em que ele está colidindo com outro objeto
        this.isReceiving_Y_Velocity       = false; //Sinaliza se o objeto está recebendo uma aceleração externa à gravidade ou não(usado para não dar conflito com a logica de queda).
        
        this.isFalling  = false;
        this.id         = (this.objProps.name) + String(new Date().getTime());
        this.name       = this.objProps.name;

        this.objEvents = new ObjectEventLayer(this.objProps.events);

        // this.scene é um ponteiro, ele pode ser nulo na criação, mais ele será atribuido dinamicamente para apontar pra cena, na fase de atualização dos objetos
        this.scene = null;

        /**
        * Vai guardar todas as informações relevantes do objeto dentro do array frameData, após cada frame 
        * Pra poderem ser consultadas posteriormente
        * o SCENE vai chamar ele
        */
        this.frameHistory = new ObjectFrameTracker( this );

        // Se nao for usar monitoramento de frames
        if( this.objProps.enable_advanced_frame_tracking == false )
        {
            this.frameHistory.disable();
        }

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
        /**
        * ESSA INICIALIZAÇÂO ABAIXO NÂO PRECISA SER FEITA EM C++
        * Em C++, como dito acima, basta declarar infoCollisions e infoProximity como publicos no inicio da classe e só
        * Não precisaria dessa inicialização.
        * Aqui eu fiz apenas pra manter uma convenção mais rigorosa 
        * MAIS ESSA INICIALIZAÇÂO NÂO PRECISA SER FEITA EM C++
        */
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
            x : "uncalculed",
            y : "uncalculed",
            z : "uncalculed"
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
        /**
        * FIM DAS INICIALIZAÇÔES QUE NÂO PRECISAM EM C++ 
        */

        /**
        * Final do construtor do ObjectBase
        */
        
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
    public pre_loop_reset(): void
    {
        this.movimentSinalyzer =  {
            forward   : false,
            backward  : false,
            right     : false,
            left      : false,
            up        : false,
            down      : false,
            isJumping : false,
            steps     : 1
        };
    }

    /**
    * Atualiza o status da velocidade(em cada eixo, se está aumentando, diminuindo, etc...) 
    * Isso é um pouco mais complexo por que leva em conta o frame anterior, da forma como eu fiz
    * A cena chama essa função após CADA ATUALIZAÇÂO DO OBJETO ATUAL, porém, contendo os dados do frame anterior
    * assim eu consigo saber o que mudou
    */
    public updateVelocitySinalyzer( velocityBeforeUpdate          : ObjectVelocity,
                                    velocitySinalyzerBeforeUpdate : VelocityStatus, 
                                    firstRender                   : boolean, 
                                    renderizadorPronto            : boolean, 
                                    frameDelta                    : float, 
                                    frameNumber                   : int 
    ): void{

        const velocitySinalyzerAtual : VelocityStatus = this.velocitySinalyzer;
        const velocityAtual          : ObjectVelocity = this.getVelocity();

        // Se o valor do eixo X no frame atual for maior que no frame anterior, então está aumentando
        if( velocityAtual.x > velocityBeforeUpdate.x ){
            velocitySinalyzerAtual.x = "increasing";

        // Se o valor do eixo X no frame atual for menor que no frame anterior, então está diminuindo
        }else if( velocityAtual.x < velocityBeforeUpdate.x ){
            velocitySinalyzerAtual.x = "decreasing";

        // Se o valor do eixo X no frame atual for igual ao do frame anterior, então está a mesma coisa
        }else if( velocityAtual.x == velocityBeforeUpdate.x ){
            velocitySinalyzerAtual.x = "constant"; // Se manteve o mesmo
        }


        // Se o valor do eixo Y no frame atual for maior que no frame anterior, então está aumentando
        if( velocityAtual.y > velocityBeforeUpdate.y ){
            velocitySinalyzerAtual.y = "increasing";

        // Se o valor do eixo X no frame atual for menor que no frame anterior, então está diminuindo
        }else if( velocityAtual.y < velocityBeforeUpdate.y ){
            velocitySinalyzerAtual.y = "decreasing";

        // Se o valor do eixo X no frame atual for igual ao do frame anterior, então está a mesma coisa
        }else if( velocityAtual.y == velocityBeforeUpdate.y ){
            velocitySinalyzerAtual.y = "constant"; // Se manteve o mesmo
        }


        // Se o valor do eixo Z no frame atual for maior que no frame anterior, então está aumentando
        if( velocityAtual.z > velocityBeforeUpdate.z ){
            velocitySinalyzerAtual.z = "increasing";

        // Se o valor do eixo Z no frame atual for menor que no frame anterior, então está diminuindo
        }else if( velocityAtual.z < velocityBeforeUpdate.z ){
            velocitySinalyzerAtual.z = "decreasing";

        // Se o valor do eixo Z no frame atual for igual ao do frame anterior, então está a mesma coisa
        }else if( velocityAtual.z == velocityBeforeUpdate.z ){
            velocitySinalyzerAtual.z = "constant"; // Se manteve o mesmo
        }
        
    }

    /**
    * Verifica se este objeto tem uma classe especifica 
    */
    public haveClass( className:string ): boolean
    {
        return includeString(this.objProps.classes, className);
    }

    /**
    * Retorna todos os objetos anexados ao objeto atual
    */
    public getAttachments() : Array<ObjectAttachment>
    {
        return this.objProps.attachments;
    }

    /**
    * Faz o objeto atual se anexar com outro objeto
    * @param {AbstractObjectBase*} outroObjeto
    * @param {ObjectAttachment} attachementConfig
    */
    public joinAttachment( outroObjeto:Ponteiro<AbstractObjectBase>, 
                           attachementConfig: ObjectAttachment 
    ): void{
        // Se o ponteiro não é nulo
        if(outroObjeto != null)
        {
            // Cria o anexo no outro objeto para linkar esteObjeto com ele
            outroObjeto.objProps.attachments.push(attachementConfig);
        }
    }

    /**
    * Adiciona algum objeto ao objeto atual simplismente adicionando ele na lista de attachments 
    * @param {ObjectBase} objetoAnexar
    * @param {ObjectAttachment} attachementConfig
    */
    public attach( objetoAnexar:Ponteiro<AbstractObjectBase>, 
                   attachementConfig: ObjectAttachment 
    ): void{
        const esteObjeto:Ponteiro<AbstractObjectBase> = this;

        if( esteObjeto != null )
        {
            // Cria o anexo no outro objeto para linkar esteObjeto com ele
            esteObjeto.objProps.attachments.push(attachementConfig);
        }
    }

    /**
    * Limpa a lista de attachments do objeto atual. Similar ao DettachFromAll(), porém, isso limpa a lista do objeto pai, liberando todos os objetos subordinados/anexados a ele.
    */
    public ClearAttachments(): void
    {
        const esteObjeto:Ponteiro<AbstractObjectBase> = this;
        esteObjeto.objProps.attachments = [];

        //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
        // ou se for um std:array pode usar .fill(nullptr) direto
    }

    public getProps(): ObjectProps
    {
        return this.objProps;
    }

    public getMass(): float
    {
        return this.objProps.mass;
    }

    public getWeight(): float
    {
        return this.weight;
    }

    public getRepresentacaoMesh(): MeshRepresentation
    {
        return this.mesh;
    }

    public setMesh(newMesh:MeshRepresentation): void
    {
        this.mesh = newMesh;
    }

    public getScene(): Ponteiro<Scene>
    {
        return this.scene;
    }

    /**
    * Obtém a posição: X Y Z do objeto na cena
    */
    public getPosition(): ObjectPosition
    {
        return this.getRepresentacaoMesh().position;
    }

    /**
    * Obtém a posição ANTERIOR: X Y Z do objeto na cena
    */
    public getLastPosition(): ObjectPosition
    {
        return this.lastPosition;
    }

    public setPosition( position: ObjectPosition ): void
    {
        const mesh: MeshRepresentation = this.getRepresentacaoMesh();

        mesh.position.x = position.x;
        mesh.position.y = position.y;
        mesh.position.z = position.z;
    }

    public somarX( x:float ): void
    {
        this.getPosition().x += x;
    }
    
    public somarY( y:float ): void
    {
        this.getPosition().y += y;
    }

    public somarZ( z:float ): void
    {
        this.getPosition().z += z;
    }

    public somarPosicaoX( x:float ): void
    {
        this.getPosition().x += x;
    }
    
    public somarPosicaoY( y:float ): void
    {
        this.getPosition().y += y;
    }

    public somarPosicaoZ( z:float ): void
    {
        this.getPosition().z += z;
    }

    public subtrairPosicaoX( x:float ): void
    {
        this.getPosition().x -= x;
    }
    
    public subtrairPosicaoY( y:float ): void
    {
        this.getPosition().y -= y;
    }

    public subtrairPosicaoZ( z:float ): void
    {
        this.getPosition().z -= z;
    }

    public somarEixo(eixo:string, valor:float): void
    {
        if( eixo == "x" )
        {
            this.somarPosicaoX( valor );
        }

        if( eixo == "y" )
        {
            this.somarPosicaoY( valor );
        }

        if( eixo == "z" )
        {
            this.somarPosicaoZ( valor );
        }
    }

    public subtrairEixo(eixo:string, valor:float): void
    {
        if( eixo == "x" )
        {
            this.subtrairPosicaoX( valor );
        }

        if( eixo == "y" )
        {
            this.subtrairPosicaoY( valor );
        }

        if( eixo == "z" )
        {
            this.subtrairPosicaoZ( valor );
        }
    }

    /**
    * Acrescenta uma posição ao objeto
    * @param rotation 
    */
    public somarPosition( position:ObjectPosition ): void
    {
        this.getPosition().x += position.x;
        this.getPosition().y += position.y;
        this.getPosition().z += position.z;
    }

    public setScale( scale: ObjectScale ): void
    {
        const mesh: MeshRepresentation = this.getRepresentacaoMesh();

        mesh.scale.x = scale.x;
        mesh.scale.y = scale.y;
        mesh.scale.z = scale.z;
    }

    public getScale(): ObjectScale
    {
        return this.getRepresentacaoMesh().scale;
    }

    public somarEscalaX( x:float ): void
    {
        this.getScale().x += x;
    }
    
    public somarEscalaY( y:float ): void
    {
        this.getScale().y += y;
    }

    public somarEscalaZ( z:float ): void
    {
        this.getScale().z += z;
    }

    /**
    * Acrescenta uma escala ao objeto
    * @param rotation 
    */
    public somarEscala( scale:ObjectScale ): void
    {
        this.getScale().x += scale.x;
        this.getScale().y += scale.y;
        this.getScale().z += scale.z;
    }

    public getForce(): ObjectForce
    {
        return this.physicsState.force;
    }

    public somarForce( forca:ObjectForce, isExternal:boolean = true ): void
    {
        // Em X
        this.getForce().x += forca.x

        // Em Y, Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getForce().y += forca.y 

        // Em Z
        this.getForce().z += forca.z
    }

    public somarForceX( forca:float ): void
    {
        this.getForce().x += forca;
    }

    public somarForceY( forca:float ): void
    {
        this.getForce().y += forca;
    }

    public somarForceZ( forca:float ): void
    {
        this.getForce().z += forca;
    }

    public subtrairForceX( forca:float ): void
    {
        this.getForce().x -= forca;
    }

    public subtrairForceY( forca:float ): void
    {
        this.getForce().y -= forca;
    }

    public subtrairForceZ( forca:float ): void
    {
        this.getForce().z -= forca;
    }

    public somarForceEixo(eixo:string, valor:float): void
    {
        
        if( eixo == "x" )
        {
            this.somarForceX( valor );
        }

        if( eixo == "y" )
        {
            this.somarForceY( valor );
        }
            
        if( eixo == "z" )
        {
            this.somarForceZ( valor );
        }    
        
    }

    public subtrairForceEixo(eixo:string, valor:float): void
    {
        if( eixo == "x" )
        {
            this.subtrairForceX( valor );
        }    
        
        if( eixo == "y" )
        {
            this.subtrairForceY( valor );
        }
            
        if( eixo == "z" )
        {
            this.subtrairForceZ( valor );
        }   
        
    }

    public setForce( forca:ObjectForce ): void
    {
        this.getForce().x = forca.x;
        this.getForce().y = forca.y;
        this.getForce().z = forca.z;
    }

    public getAcceleration(): ObjectAcceleration
    {
        return this.physicsState.acceleration;
    }

    public somarAcceleration( velocidade:ObjectAcceleration ): void
    {
        this.getAcceleration().x += velocidade.x;
        this.getAcceleration().y += velocidade.y;
        this.getAcceleration().z += velocidade.z;
    }

    public somarAccelerationX( acceleration:float ): void
    {
        this.getAcceleration().x += acceleration;
    }

    public somarAccelerationY( acceleration:float ): void
    {
        this.getAcceleration().y += acceleration;
    }

    public somarAccelerationZ( acceleration:float ): void
    {
        this.getAcceleration().z += acceleration;
    }

    public subtrairAccelerationX( acceleration:float ): void
    {
        this.getAcceleration().x -= acceleration;
    }

    public subtrairAccelerationY( acceleration:float ): void
    {
        this.getAcceleration().y -= acceleration;
    }

    public subtrairAccelerationZ( acceleration:float ): void
    {
        this.getAcceleration().z -= acceleration;
    }

    public somarAccelerationEixo(eixo:string, valor:float): void
    {
        if( eixo == "x" )
        {
            this.somarAccelerationX( valor );
        }

        if( eixo == "y" )
        {
            this.somarAccelerationY( valor );
        }

        if( eixo == "z" )
        {
            this.somarAccelerationZ( valor );
        }
        
    }

    public subtrairAccelerationEixo(eixo:string, valor:float): void
    {
        
        if( eixo == "x" )
        {
            this.subtrairAccelerationX( valor );
        }

        if( eixo == "y" )
        {
            this.subtrairAccelerationY( valor );
        }

        if( eixo == "z" )
        {
            this.subtrairAccelerationZ( valor );
        }
        
    }

    public setAcceleration( acceleration:ObjectAcceleration ): void
    {
        this.getAcceleration().x = acceleration.x;
        this.getAcceleration().y = acceleration.y;
        this.getAcceleration().z = acceleration.z;
    }

    public getVelocity(): ObjectVelocity
    {
        return this.physicsState.velocity;
    }

    /**
    * Acrescenta uma velocidade ao objeto
    * @param velocidade 
    */
    public somarVelocity( velocidade:ObjectVelocity, isExternal:boolean = true ): void
    {

        // Em X
        this.getVelocity().x += velocidade.x;

        // Em Y, Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getVelocity().y += velocidade.y 

        // Em Z
        this.getVelocity().z += velocidade.z;
    }

    public somarVelocityX( velocidade:float ): void
    {
        this.getVelocity().x += velocidade
    }

    public somarVelocityY( velocidade:float, isExternal:boolean = true ): void
    {
        // Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getVelocity().y += velocidade
    }

    public somarVelocityZ( velocidade:float ): void
    {
        this.getVelocity().z += velocidade
    }

    public subtrairVelocityX( velocidade:float ): void
    {
        this.getVelocity().x -= velocidade
    }

    public subtrairVelocityY( velocidade:float, isExternal:boolean = true ): void
    {
        // Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getVelocity().y -= velocidade
    }

    public subtrairVelocityZ( velocidade:float ): void
    {
        this.getVelocity().z -= velocidade
    }

    public somarVelocityEixo(eixo:string, valor:float, isExternal:boolean = true): void
    {
        
        if( eixo == "x" )
        {
            this.somarVelocityX( valor );
        }

        if( eixo == "y" )
        {
            // Diz pra Engine que o objeto recebeu uma velocidade externa
            this.isReceiving_Y_Velocity = isExternal;
            this.somarVelocityY( valor );
        }

        if( eixo == "z" )
        {
            this.somarVelocityZ( valor );
        }
        
    }

    public subtrairVelocityEixo(eixo:string, valor:float, isExternal:boolean = true): void
    {
        
        if( eixo == "x" )
        {
            this.subtrairVelocityX( valor );
        }

        if( eixo == "y" )
        {
            // Diz pra Engine que o objeto recebeu uma velocidade externa
            this.isReceiving_Y_Velocity = isExternal;
            this.subtrairVelocityY( valor );
        }

        if( eixo == "z" )
        {
            this.subtrairVelocityZ( valor );
        }
        
    }

    public setVelocity( velocidade:ObjectVelocity, isExternal:boolean = true ): void
    {
        // Em X
        this.getVelocity().x = velocidade.x;
        
        // Em Y, Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getVelocity().y = velocidade.y 
        
        // Em Z
        this.getVelocity().z = velocidade.z;
    }

    public setVelocityX( velocidade:float ): void
    {
        this.getVelocity().x = velocidade;
    }

    public setVelocityY( velocidade:float, isExternal:boolean = true ): void
    {
        // Diz pra Engine que o objeto recebeu uma velocidade externa
        this.isReceiving_Y_Velocity = isExternal;
        this.getVelocity().y = velocidade;
    }

    public setVelocityZ( velocidade:float ): void
    {
        this.getVelocity().z = velocidade;
    }

    public setVelocityEixo( eixo:string, velocidade:float, isExternal:boolean = true ): void
    {
        
        if( eixo == "x" )
        {
            this.setVelocityX( velocidade );
        }

        if( eixo == "y" )
        {
            // Diz pra Engine que o objeto recebeu uma velocidade externa
            this.isReceiving_Y_Velocity = isExternal;
            this.setVelocityY( velocidade );
        }

        if( eixo == "z" )
        {
            this.setVelocityZ( velocidade );
        }
        
    }

    /**
    * Calcula o momento linear do objeto
    */
    public getMomentoLinear(): Position3D
    {
        const massa     = this.objProps.mass;
        const momento_x = massa * this.getVelocity().x;
        const momento_y = massa * this.getVelocity().y;
        const momento_z = massa * this.getVelocity().z;

        return {
            x: momento_x,
            y: momento_y,
            z: momento_z
        };
    }

    /**
    * Calcula a massa invertida
    */
    public getMassaInvertida(): float
    {
        const massa     = this.objProps.mass;
        return 1 / massa;
    }

    public getRotation(): ObjectRotation
    {
        return this.getRepresentacaoMesh().rotation;
    }

    public setRotation( rotation: ObjectRotation ): void
    {
        const mesh : MeshRepresentation = this.getRepresentacaoMesh();

        mesh.rotation.x = rotation.x;
        mesh.rotation.y = rotation.y;
        mesh.rotation.z = rotation.z;
    }

    public somarRotationX( x:float ): void
    {
        this.getRotation().x += x;
    }
    
    public somarRotationY( y:float ): void
    {
        this.getRotation().y += y;
    }

    public somarRotationZ( z:float ): void
    {
        this.getRotation().z += z;
    }

    /**
    * Acrescenta uma rotação ao objeto
    * @param rotation 
    */
    public somarRotation( rotation:ObjectRotation ): void
    {
        this.getRotation().x += rotation.x;
        this.getRotation().y += rotation.y;
        this.getRotation().z += rotation.z;
    }

    /**
    * Obtem a força de rotação 
    */
    public getRotationForce(): ObjectForce
    {
        return this.physicsState.rotationForce;
    }

    /**
    * Obtem a aceleração de rotação 
    */
    public getRotationAcceleration(): ObjectForce
    {
        return this.physicsState.rotationAcceleration;
    }

    /**
    * Obtem a aceleração de rotação 
    */
    public getRotationVelocity(): ObjectForce
    {
        return this.physicsState.rotationVelocity;
    }

    public somarRotationVelocityX( velocidadeRotacao:float ): void
    {
        this.getRotationVelocity().x += velocidadeRotacao;
    }

    public somarRotationVelocityY( velocidadeRotacao:float ): void
    {
        this.getRotationVelocity().y += velocidadeRotacao;
    }

    public somarRotationVelocityZ( velocidadeRotacao:float ): void
    {
        this.getRotationVelocity().z += velocidadeRotacao;
    }

    public subtrairRotationVelocityX( velocidadeRotacao:float ): void
    {
        this.getRotationVelocity().x -= velocidadeRotacao;
    }

    public subtrairRotationVelocityY( velocidadeRotacao:float ): void
    {
        this.getRotationVelocity().y -= velocidadeRotacao;
    }

    public subtrairRotationVelocityZ( velocidadeRotacao:float ): void
    {
        this.getRotationVelocity().z -= velocidadeRotacao;
    }

    public somarRotationForceX( velocidadeRotacao:float ): void
    {
        this.getRotationForce().x += velocidadeRotacao;
    }

    public somarRotationForceY( velocidadeRotacao:float ): void
    {
        this.getRotationForce().y += velocidadeRotacao;
    }

    public somarRotationForceZ( velocidadeRotacao:float ): void
    {
        this.getRotationForce().z += velocidadeRotacao;
    }

    public setRotationVelocityX( velocidadeRotacaoX:float ): void
    {
        this.getRotationVelocity().x += velocidadeRotacaoX;
    }

    public setRotationVelocityY( velocidadeRotacaoY:float ): void
    {
        this.getRotationVelocity().y += velocidadeRotacaoY;
    }

    public setRotationVelocityZ( velocidadeRotacaoZ:float ): void
    {
        this.getRotationVelocity().z += velocidadeRotacaoZ;
    }

    /**
    * Deleta o objeto da cena 
    */
    public destroy(): void
    {
        // TODO
    }

    /**
    * Calcula o voluma do objeto 
    * @returns {float}
    */
    public getVolume(): float 
    {
        const escala = this.getScale();
        return escala.x * escala.y * escala.z;
    }

    /**
    * Reseta algumas coisas após cada frame terminar
    */
    public reset_loop_afterframe(): void
    {
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

    /**
    * Método que vai fazer a atualização de lógica e regras de jogo do objeto.
    * OBS: Esse método não vai fazer atualizações de fisica, ou movimentação padrão da engine. Apenas lógicas especificas para o objeto.
    */
    public updateObject( firstRender: boolean, 
                         renderizadorPronto: boolean, 
                         frameDelta: float, 
                         frameNumber: int 
    ): void{
        if( renderizadorPronto == true )
        {
            // MOVIDO PARA O Scene.ts
                /**
                * Reseta algumas coisas antes do loop 
                */
                //this.pre_loop_reset(); 

                /**
                * Principal: Fisica, Movimentação e Eventos 
                */
                //this.updatePhysics( frameDelta );
            
                /**
                * Igualmente importante, atualiza quais objetos estão colidindo/e os que estão proximos com quais objetos 
                */
                //this.updateCollisionState( frameDelta );

                /**
                * Atualiza os movimentos do objeto 
                */
                //this.updateMovement( frameDelta );

                /**
                * Atualiza a rotação do objeto 
                */
                //this.updateRotation( frameDelta );
            
                /**
                * Atualiza os eventos do objeto 
                */
                //this.updateEvents( frameDelta );

                /**
                * Atualiza os "attachments" ou "objeto anexados/grudados" ao objeto atual
                */
                //this.updateAttachments( frameDelta );

                /**
                * Reseta algumas coisas depois do frame atual terminar
                */
                //this.reset_loop_afterframe();
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
    public isCollisionOf( outroObjeto:Ponteiro<AbstractObjectBase>, 
                          limites:ProximityBounds 

    ): boolean{
        let objetosColidindo : Array<Ponteiro<AbstractObjectBase>> = new Array();
        let esteObjeto       : Ponteiro<AbstractObjectBase>        = this;
        let scene            : Ponteiro<Scene>                     = esteObjeto.getScene();

        if( scene != null )
        {
            return scene.queryIfObjectIsCollisionOf( this, outroObjeto, limites );
        }

        return false;
    }

    /**
    * Traz todos os objetos que estão colidindo com ESTE OBJETO
    */
    public getCollisions( limites:ProximityBounds = {x:0, y:0, z:0}, 
                          recalculate:boolean = false  

    ): Array<Ponteiro<AbstractObjectBase>>
    {
        let esteObjeto       : Ponteiro<AbstractObjectBase>        = this;
        let objetosColidindo : Array<Ponteiro<AbstractObjectBase>> = new Array();
        let scene            : Ponteiro<Scene>                     = esteObjeto.getScene();

        //Se não tem limites personalizados
        if( recalculate == false ){
            objetosColidindo = [... this.infoCollisions.objects]; // Faz uma copia do array

        //Se tem limites de zona de colisão personalizado
        }else{
            if( scene != null )
            {
                //Traz só os objetos que estão colidindo dentro da zona definida no "limites"
                for( let i:int = 0 ; i < scene.objects.length ; i++ )
                {
                    const objetoAtual : Ponteiro<AbstractObjectBase> = scene.objects[i];

                    //Se o ponteiro não é nulo
                    if( objetoAtual != null )
                    {
                        // Se está colidindo
                        if( isCollision( esteObjeto, objetoAtual, limites ) == true && esteObjeto.id !== objetoAtual.id )
                        {
                            objetosColidindo.push( objetoAtual );
                        }
                    }
                }
            }
        }

        return objetosColidindo;
    }

    /**
    * Traz todos os objetos que estão proximos DESTE OBJETO
    */
    public getProximity( limites:ProximityBounds = {x:0, y:0, z:0}, 
                         recalculate:boolean = false 
                  
    ): Array<Ponteiro<AbstractObjectBase>>
    {
        let esteObjeto       : Ponteiro<AbstractObjectBase>        = this;
        let objetosColidindo : Array<Ponteiro<AbstractObjectBase>> = new Array();
        let scene            : Ponteiro<Scene>                     = esteObjeto.getScene();

        //Se não tem limites personalizados
        if( recalculate == false ){
            objetosColidindo = [...this.infoProximity.objects]; // Faz uma copia do Array

        //Se tem limites de zona de colisão personalizado
        }else{
            if( scene != null )
            {
                //Traz só os objetos que estão proximos dentro da zona definida no "limites"
                for( let i:int = 0 ; i < scene.objects.length ; i++ )
                {
                    const objetoAtual : Ponteiro<AbstractObjectBase> = scene.objects[i];

                    //Se o ponteiro nao é nulo
                    if( objetoAtual != null )
                    {
                        // Se está colidindo
                        if( isProximity( esteObjeto, objetoAtual, limites ) && esteObjeto.id !== objetoAtual.id )
                        {
                            objetosColidindo.push( objetoAtual );
                        }
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
    public isProximityOf( outroObjeto:Ponteiro<AbstractObjectBase>, 
                          limites:ProximityBounds 

    ): boolean{
        const esteObjeto       : Ponteiro<AbstractObjectBase>        = this;
        const objetosColidindo : Array<Ponteiro<AbstractObjectBase>> = new Array();
        const scene            : Ponteiro<Scene>                     = this.getScene();

        if( scene != null )
        {
            return scene.queryIfObjectIsProximityOf( this, outroObjeto, limites );
        }

        return false;
    }
}