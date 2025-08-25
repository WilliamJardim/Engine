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
    * Atualiza status de colisão e proximidade com outros objetos 
    */
    public updateCollisionState( frameDelta:float ): void
    {
        const scene       : Ponteiro<Scene>              = this.getScene();
        const esteObjeto  : Ponteiro<AbstractObjectBase> = this;

        // Se o ponteiro não estiver nulo
        if( scene != null && esteObjeto.scene != null )
        {

            const objetosCena : Array<Ponteiro<AbstractObjectBase>> = scene.objects;

            // Zera as informações de colisão com outros objetos
            esteObjeto.infoCollisions = {
                objectNames    : [],
                objectIDs      : [],
                objectClasses  : [],
                objects        : []
            };
            // Zera as informações de proximidade com outros objetos
            esteObjeto.infoProximity = {
                objectNames    : [],
                objectIDs      : [],
                objectClasses  : [],
                objects        : []
            };

            //em c++ precisaria usar o .clear() ou fazer std::fill(attachments.begin(), attachments.end(), nullptr);
            // ou se for um std:array pode usar .fill(nullptr) direto

            //Se este objeto pode colidir
            if( (this.objProps.podeAtravessar != true) &&
                (this.objProps.collide == true) && 
                this.physicsState.havePhysics == true 
            ){
    
                // Limpa a tabela global de colisões do objeto 
                esteObjeto.scene.clearObjectCollisionFromTableByName( esteObjeto.name );
                esteObjeto.scene.clearObjectCollisionFromTableByID( esteObjeto.id );
                esteObjeto.scene.clearObjectCollisionFromTableByCLASSES( esteObjeto.objProps.classes );

                // Limpa a tabela global de proximidade do objeto
                esteObjeto.scene.clearObjectProximityFromTableByName( esteObjeto.name );
                esteObjeto.scene.clearObjectProximityFromTableByID( esteObjeto.id );
                esteObjeto.scene.clearObjectProximityFromTableByCLASSES( esteObjeto.objProps.classes );

                for( let i:int = 0 ; i < objetosCena.length ; i++ )
                {
                    const objetoAtualCena : Ponteiro<AbstractObjectBase> = objetosCena[i];

                    /**
                    * Se o ESTE OBJETO tiver colisão habilitada e colidir com o TAL outro OBJETO
                    */
                    if( (objetoAtualCena != null) &&
                        (objetoAtualCena.objProps.podeAtravessar != true) &&
                        (objetoAtualCena.objProps.collide == true) && 
                        objetoAtualCena.id != esteObjeto.id 
                    ){

                        /**
                        * Cadastra pela primeira vez as chaves de nomes e ids nos meus mapas collisionTable e collisionBinaryTable
                        * Para ser usados em detecção de colisões entre os objetos:
                        * 
                        * Assim como eu já fizia antes do commit desse dia 30/07/2025: Se a chave não existir, cria um Array ou Mapa para ela(dependendo de qual critério: se é por nome ou por ID)
                        * Esses objetos criados para a chave vão ser acessados para definir estados de colisão
                        */

                        // Por nome
                        if( esteObjeto.scene.collisionTable.byName.search( esteObjeto.name ) == esteObjeto.scene.collisionTable.byName.NotFounded() ){
                            esteObjeto.scene.collisionTable.byName[ esteObjeto.name ] = new Array<Ponteiro<AbstractObjectBase>>();
                        }
                        if( esteObjeto.scene.collisionBinaryTable.byName.search( esteObjeto.name ) == esteObjeto.scene.collisionBinaryTable.byName.NotFounded() ){
                            esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.name ] = new Mapa<string, boolean>();
                        }

                        // Por ID
                        if( esteObjeto.scene.collisionTable.byID.search( esteObjeto.id ) == esteObjeto.scene.collisionTable.byID.NotFounded() ){
                            esteObjeto.scene.collisionTable.byID[ esteObjeto.id ] = new Array<Ponteiro<AbstractObjectBase>>();
                        }
                        if( esteObjeto.scene.collisionBinaryTable.byID.search( esteObjeto.id ) == esteObjeto.scene.collisionBinaryTable.byID.NotFounded() ){
                            esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ] = new Mapa<string, boolean>();
                        }

                        /**
                        * Cadastra pela primeira vez as chaves de nomes e ids nos meus mapas proximityTable e proximityBinaryTable
                        * Para ser usados em detecção de proximidade entre os objetos:
                        * 
                        * Assim como eu já fizia antes do commit desse dia 30/07/2025: Se a chave não existir, cria um Array ou Mapa para ela(dependendo de qual critério: se é por nome ou por ID)
                        * Esses objetos criados para a chave vão ser acessados para definir estados de colisão
                        */
                        
                        // Por nome
                        if( esteObjeto.scene.proximityTable.byName.search( esteObjeto.name ) == esteObjeto.scene.proximityTable.byName.NotFounded() ){
                            esteObjeto.scene.proximityTable.byName[ esteObjeto.name ] = new Array<Ponteiro<AbstractObjectBase>>();
                        }
                        if( esteObjeto.scene.proximityBinaryTable.byName.search( esteObjeto.name ) == esteObjeto.scene.proximityBinaryTable.byName.NotFounded() ){
                            esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ] = new Mapa<string, boolean>();
                        }

                        if( esteObjeto.scene.proximityTable.byID.search( esteObjeto.id ) == esteObjeto.scene.proximityTable.byID.NotFounded() ){
                            esteObjeto.scene.proximityTable.byID[ esteObjeto.id ] = new Array<Ponteiro<AbstractObjectBase>>();
                        }
                        if( esteObjeto.scene.proximityBinaryTable.byID.search( esteObjeto.id ) == esteObjeto.scene.proximityBinaryTable.byID.NotFounded() ){
                            esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ] = new Mapa<string, boolean>();
                        }
                
                        /**
                        * Cadastra pela primeira vez as chaves de classes nos meus mapas proximityTable e proximityBinaryTable
                        * E tambem as chaves de classes nos meus mapas collisionTable e collisionBinaryTable
                        * 
                        * Exatamente como eu já fazia antes do commit desse dia 30/07/2025
                        */
                        for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                        {
                            const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];

                            //Registra tambem na tabela mestre da cena
                            if( esteObjeto.scene.proximityTable.byClasses.search( nomeClasse ) == esteObjeto.scene.proximityTable.byClasses.NotFounded() ){
                                esteObjeto.scene.proximityTable.byClasses[ nomeClasse ] = new Array<Ponteiro<AbstractObjectBase>>();
                            }
                            if( esteObjeto.scene.proximityBinaryTable.byClasses.search( nomeClasse ) == esteObjeto.scene.proximityBinaryTable.byClasses.NotFounded() ){
                                esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ] = new Mapa<string, boolean>();
                            }

                            //Registra tambem na tabela mestre da cena
                            if( esteObjeto.scene.collisionTable.byClasses.search( nomeClasse ) == esteObjeto.scene.collisionTable.byClasses.NotFounded() ){
                                esteObjeto.scene.collisionTable.byClasses[ nomeClasse ] = new Array<Ponteiro<AbstractObjectBase>>();
                            }
                            if( esteObjeto.scene.collisionBinaryTable.byClasses.search( nomeClasse ) == esteObjeto.scene.collisionBinaryTable.byClasses.NotFounded() ){
                                esteObjeto.scene.collisionBinaryTable.byClasses[ nomeClasse ] = new Mapa<string, boolean>();
                            }
                        }

                        /**
                        * Começa a verificar as colisões
                        * Nesse ponto, eu ja tenho os mapas collisionTable, collisionBinaryTable, proximityTable, proximityBinaryTable devidamente inicializados
                        * Pois os Arrays e Mapas dessas chaves que não existiam já estão todos criados nesse ponto. (Foram criados nos trechos de códigos das linhas anteriores) 
                        */

                        //Se houve uma colisão(usando Bounding Box)
                        if( isCollision( esteObjeto, objetoAtualCena, {x: 0.5, y: 0.5, z: 0.5} ) === true )
                        {
                            // POR NOME
                            // Registra as colisões detectadas
                            esteObjeto.infoCollisions.objectNames.push( objetoAtualCena.name );

                            // Por Nome
                            esteObjeto.scene.collisionTable.byName[ esteObjeto.name ].push( objetoAtualCena );
                            esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = true;
                            esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ] = true;

                            // Por ID
                            esteObjeto.infoCollisions.objectIDs.push( objetoAtualCena.id );
                            esteObjeto.scene.collisionTable.byID[ esteObjeto.id ].push( objetoAtualCena );

                            // Marca na tabela binaria
                            esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = true;
                            esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id ] = true;

                            //As classes tambem são inclusas se houver, para permitir facil acesso
                            for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                            {
                                const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];
                                esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.id ][ nomeClasse ] = true;
                                esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ][ nomeClasse ] = true;

                                esteObjeto.infoCollisions.objectClasses.push( nomeClasse );

                                // por Nome da classe
                                esteObjeto.scene.collisionTable.byClasses[ nomeClasse ].push( objetoAtualCena );                          
                                esteObjeto.scene.collisionBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = true;
                                esteObjeto.scene.collisionBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ] = true;
                            }

                            esteObjeto.infoCollisions.objects.push( objetoAtualCena );

                        // Se não está mais colidindo, desmarca na tabela binaria, tanto por nome, id e classes
                        }else{
                            // Por Nome
                            esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = false;
                            esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ]   = false;

                            // Por ID
                            esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = false;
                            esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id   ] = false;

                            //As classes tambem são inclusas se houver, para permitir facil acesso
                            for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                            {
                                const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];
                                esteObjeto.scene.collisionBinaryTable.byName[ esteObjeto.id ][ nomeClasse ] = false;
                                esteObjeto.scene.collisionBinaryTable.byID[ esteObjeto.id ][ nomeClasse ]   = false;

                                esteObjeto.infoCollisions.objectClasses.push( nomeClasse );

                                // por Nome da classe
                                esteObjeto.scene.collisionTable.byClasses[ nomeClasse ].push( objetoAtualCena );                          
                                esteObjeto.scene.collisionBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = false;
                                esteObjeto.scene.collisionBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ]   = false;
                            }

                        }

                        //Se houve uma proximidade
                        if( isProximity( esteObjeto, objetoAtualCena, esteObjeto.objProps.proximityConfig ) === true )
                        {

                            // Registra as colisões detectadas
                            esteObjeto.infoProximity.objectNames.push( objetoAtualCena.name );

                            // Por nome
                            esteObjeto.scene.proximityTable.byName[ esteObjeto.name ].push( objetoAtualCena );
                            esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = true;
                            esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ]   = true;

                            // infoProximity
                            esteObjeto.infoProximity.objectIDs.push( objetoAtualCena.id );

                            // Por ID
                            esteObjeto.scene.proximityTable.byID[ esteObjeto.id ].push( objetoAtualCena );
                            esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = true;
                            esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id ]   = true; 
                            
                            // Por classes
                            for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                            {
                                 const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];
                                 
                                 esteObjeto.infoProximity.objectClasses.push( nomeClasse );
    
                                 // Por nome da classe
                                 esteObjeto.scene.proximityTable.byClasses[ nomeClasse ].push( objetoAtualCena );
                                 esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = true;
                                 esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ] = true;
                            }
                            
                            esteObjeto.infoProximity.objects.push( objetoAtualCena );


                        // Se não está mais proximo, desmarca na tabela binaria, tanto por nome, id e classes
                        }else{
                            // Por nome
                            esteObjeto.scene.proximityTable.byName[ esteObjeto.name ].push( objetoAtualCena );
                            esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = false;
                            esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ]   = false;

                            // Por ID
                            esteObjeto.scene.proximityTable.byID[ esteObjeto.id ].push( objetoAtualCena );
                            esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = false;
                            esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id ]   = false; 

                            // Por classes
                            for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                            {
                                 const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];
                                 
                                 esteObjeto.infoProximity.objectClasses.push( nomeClasse );
    
                                 // Por nome da classe
                                 esteObjeto.scene.proximityTable.byClasses[ nomeClasse ].push( objetoAtualCena );
                                 esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = false;
                                 esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ]   = false;
                            }

                        }
                    }
                }
            }   
        }

    }

    /**
    * Atualiza a fisica de queda com gravidade, sopro de vento, kicks, etc - deste objeto.
    * Este objeto atualiza essas coisas dele mesmo.
    */
    public updatePhysics( frameDelta:float ): void
    {
        const esteObjeto  : Ponteiro<AbstractObjectBase>  = this;
        const scene       : Ponteiro<Scene>               = esteObjeto.scene;

        // Se o ponteiro da cena nao for null
        if( scene != null )
        { 
            const objetosCena               : Array<Ponteiro<AbstractObjectBase>> = scene.getObjects();
            const gravity                   : Position3D                          = scene.getGravity();
            const frameDeltaIntensification : float                               = scene.frameDeltaIntensification;
            const objectPhysicsUpdateRate   : float                               = scene.objectPhysicsUpdateRate;

            this.isFalling = true;

            //If this object have physics
            if( (this.objProps.podeAtravessar != true) &&
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
                for( let i:int = 0; i < objetosCena.length; i++ )
                {
                    const objetoAtualCena :  Ponteiro<AbstractObjectBase>  = objetosCena[i];

                    /**
                    * Se o ESTE OBJETO tiver colisão habilitada e colidir com o TAL outro OBJETO, ele corrige a posição Y DESTE OBJETO, para impedir ultrapassar o TAL outro OBJETO
                    */
                    if(  objetoAtualCena != null &&
                        (objetoAtualCena.objProps.podeAtravessar != true) &&
                        (objetoAtualCena.objProps.collide == true ) && 
                        objetoAtualCena.id != this.id && 
                        
                        //no ar, o objeto tem um alcançe de colisão maior, pra evitar o bug dele não conseguir detectar o objeto para ele parar em cima ao cair
                        isCollision( this, 
                                    objetoAtualCena, 
                                    (
                                        this.isFalling == true ? {x: 0.8, y: 0.8, z: 0.8} 
                                                            : {x: 0.5, y: 0.5, z: 0.5}
                                    ) 
                        ) == true 
                    ){
                        //Corrige a posição Y do objeto pra não ultrapassar o Y do objeto
                        //BUG: Se o cubo ficar em baixo da caixa e subir um pouquinho Y dele, a caixa corrige sua posição e FICA EM CIMA DO CUBO
                        
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
                        
                        //Impede que o objeto suba em cima de outro objeto
                        if( this.isMovimentoTravadoPorColisao == false && this.getPosition().y < objetoAtualCena.getPosition().y ){
                            this.setPosition({
                                y: objetoAtualCena.getPosition().y - objetoAtualCena.getScale().y - this.getScale().y,

                                // O resto da posição mantém
                                x: objetoAtualCena.getPosition().x,
                                z: objetoAtualCena.getPosition().z
                            })
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
                    }
                }

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

                        /**
                        * Executa os eventos de queda 
                        */
                        const eventosDoObjeto : Array<ObjectEvents> = this.objEvents.getEventos();

                        for( let j:int = 0; j < eventosDoObjeto.length; j++ )
                        {
                            const eventosObjeto : ObjectEvents = eventosDoObjeto[ j ];

                            //Chama o evento whenFall
                            if( eventosObjeto.whenFall != null )
                            {
                                eventosObjeto.whenFall.bind(esteObjeto)({
                                    self     : esteObjeto,
                                    instante : new Date().getTime()
                                });
                            }
                        }
                    }

                    /**
                    * Aplica fisica de rotação na queda de acordo com o vento
                    */
                    if( this.scene.sceneConfig.haveWind == true )
                    {
                        if( this.objProps.name != "Player" ){
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
                    if( this.objectBelow != null && this.objProps.name != "Player" ){
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

    }

    /**
    * Atualiza a rotação do objeto, e do objeto em relação aos outros objetos na cena
    */
    public updateRotation( frameDelta:float ): void
    {
        const objeto : Ponteiro<AbstractObjectBase>  = this;
        const scene  : Ponteiro<Scene>               = objeto.getScene();

        // Ignora se a cena nao existir
        if( scene == null )
        {
            return;
        }

        const massaObjeto                          : float         = objeto.getMass();
        const gravity                              : Position3D    = scene.gravity;
        const atrito                               : float         = scene.atrito;
        const arrastoAr                            : float         = scene.arrastoAr;
        const frameDeltaIntensification            : float         = scene.frameDeltaIntensification;
        const objectPhysicsUpdateRate              : float         = scene.objectPhysicsUpdateRate;
        const objectPhysicsDesaceleracaoUpdateRate : float         = scene.objectPhysicsDesaceleracaoUpdateRate;
        const movimentState                        : MovementState = objeto.movimentState;

        const objetosCena             : Array<Ponteiro<AbstractObjectBase>> = scene.objects;

        const forcaVelocidadeObjeto   : ObjectForce          = objeto.getRotationForce();
        const aceleracaoRotacaoObjeto : ObjectAcceleration   = objeto.getRotationAcceleration();
        
        // Se a massaObjeto for zero, não faz nada pra não dar divisão por zero
        if( massaObjeto != 0 )
        {
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
        }

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
    }

    /**
    * Atualiza a movimentação do objeto, e do objeto em relação aos outros objetos na cena, como por exemplo objetos que podem carregar ele
    */
    public updateMovement( frameDelta:float ): void
    {
        const objeto           : Ponteiro<AbstractObjectBase> = this;
        const scene            : Ponteiro<Scene>              = objeto.scene;

        // Ignora se a cena nao existir
        if( scene == null )
        {
            return;
        }

        const velocidadeObjeto : ObjectVelocity                      = objeto.getVelocity();
        const aceleracaoObjeto : ObjectAcceleration                  = objeto.getAcceleration();
        const forcaObjeto      : ObjectForce                         = objeto.getForce();
        const massaObjeto      : float                               = objeto.getMass();
        const gravity          : Position3D                          = scene.gravity;
        const atrito           : float                               = scene.atrito;
        const arrastoAr        : float                               = scene.arrastoAr;
        const frameDeltaIntensification            : float           = scene.frameDeltaIntensification;
        const objectPhysicsUpdateRate              : float           = scene.objectPhysicsUpdateRate;
        const objectPhysicsDesaceleracaoUpdateRate : float           = scene.objectPhysicsDesaceleracaoUpdateRate;
        const movimentState    : MovementState                       = objeto.movimentState;
        const objetosCena      : Array<Ponteiro<AbstractObjectBase>> = scene.objects;

        /**
        * Salva posição atual do objeto ANTES DE QUALQUER MOVIMENTO OCORRER, como sendo a posição anterior dele,
        * Pois se um movimento ocorrer, a posição anterior vai estar registrada para fins de calculos. 
        */
        objeto.lastPosition = { 
                                x: Number( objeto.getPosition().x ),
                                y: Number( objeto.getPosition().y ),
                                z: Number( objeto.getPosition().z ),
                              };

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

        // Se a massa for zero vai dar problema de divisão por zero, então preciso verificar primeiro
        if( massaObjeto != 0 )
        {
            /**
            * Calcula a aceleração do objeto 
            */
            aceleracaoObjeto.x = forcaObjeto.x / massaObjeto;
            aceleracaoObjeto.y = forcaObjeto.y / massaObjeto;
            aceleracaoObjeto.z = forcaObjeto.z / massaObjeto;
        }

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
            objeto.objectBelow.haveClass("ground") == false
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
        if( objeto.objectBelow != undefined && 
            objeto.objectBelow != null &&
            //O objeto abaixo NÂO PODE TER fisica
            objeto.objectBelow.objProps.havePhysics == false &&
            // Porém o objeto ainda assim deve colidir
            objeto.objectBelow.objProps.collide == true &&
            //Essa regra não vale para chãos
            objeto.objectBelow.haveClass("ground") == false
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
    public updateAttachments( frameDelta:float ): void
    {
        const objeto  : AbstractObjectBase = this;
        const scene   : Ponteiro<Scene>    = objeto.getScene();

        // Se o ponteiro não for null
        if( scene != null )
        {
            if( objeto.objProps.attachments.length > 0 )
            {                                                
                /**
                * Para cada objeto da cena
                */
                for( let i:int = 0; i < objeto.objProps.attachments.length; i++ )
                {   
                    const anexo            : ObjectAttachment             = objeto.objProps.attachments[i];
                    const nomeObjetoAnexar : string                       = anexo.name;
                    const objetoAnexar     : Ponteiro<AbstractObjectBase> = scene.getObjectByName( nomeObjetoAnexar );
                    
                    //Se o ponteiro não é nulo
                    if( objetoAnexar != null )
                    {
                        // Se ele NÂO DEVE COLIDIR COM O OBOJETO DONO DO ANEXO
                        if( anexo.attacherCollision == false )
                        {
                            if( includeString(objeto.objProps.ignoreCollisions, objetoAnexar.id) == false ){ 
                                objeto.objProps.ignoreCollisions.push( objetoAnexar.id );
                            }
                        }

                        // Se tem um ajuste de posição EM RELAÇÂO AO OBJETO, aplica
                        // Acompanha a posição do objeto
                        objetoAnexar.setPosition( objeto.getPosition() );

                        // Alem disso, permite fazer um ajuste de posição
                        objetoAnexar.somarX( anexo.position.x );
                        objetoAnexar.somarY( anexo.position.y );
                        objetoAnexar.somarZ( anexo.position.z );

                        //Se vai copiar a memsa escala do objeto
                        if( anexo.sameScale == true ){
                            objetoAnexar.setScale( objeto.getScale() );
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
                        objetoAnexar.objProps.podeAtravessar = anexo.podeAtravessar;
                        objetoAnexar.objProps.collide        = anexo.collide;
                        
                        objetoAnexar.objProps.havePhysics     = anexo.havePhysics;
                        objetoAnexar.physicsState.havePhysics = anexo.havePhysics;

                        objetoAnexar.objProps.collisionEvents = anexo.collisionEvents;
                        objetoAnexar.objProps.isInvisible     = anexo.isInvisible;
                    }
                }        
            }                                               
        }
    }

    /**
    * Atualiza os eventos internos do objeto 
    */
    public updateEvents( frameDelta:float ): void
    {
        const scene   : Ponteiro<Scene>               = this.getScene();
        const objeto  : Ponteiro<AbstractObjectBase>  = this;
        const eventos : ObjectEventLayer              = objeto.objEvents;

        // Se o ponteiro não for null
        if( scene != null )
        {
            //Se tem eventos
            if( eventos != null )
            {   
                const eventosDoObjeto : Array<ObjectEvents>  = eventos.getEventos();

                // Para cada bloco de evento
                for( let i:int = 0; i < eventosDoObjeto.length; i++ )
                {
                    const eventosObjeto : ObjectEvents                        = eventosDoObjeto[i];
                    const objetosCena   : Array<Ponteiro<AbstractObjectBase>> = scene.objects;

                    // Se o objeto pode colidir e Se existe o evento whenCollide
                    if( (objeto.objProps.collide != false || objeto.objProps.collisionEvents == true) && 
                        eventosObjeto.whenCollide 
                    ){
                        
                        // Para cada objeto na cena, verifica se colidiu com este objeto
                        for( let j:int = 0; j < objetosCena.length; j++ )
                        {
                            const objetoAtualCena : Ponteiro<AbstractObjectBase>  = objetosCena[j];

                            //Se ESTE objeto COLIDIR com o objeto atual da cena 
                            if( 
                                objetoAtualCena != null &&
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
                                eventosObjeto.whenCollide.bind(objeto)({
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
                    if( eventosObjeto.whenProximity != null )
                    {
                        // Para cada objeto na cena, verifica se colidiu com este objeto
                        for( let j:int = 0; j < objetosCena.length; j++ )
                        {
                            const objetoAtualCena : Ponteiro<AbstractObjectBase>  = objetosCena[j];

                            if( 
                                objetoAtualCena != null &&
                                // Se não for ele mesmo
                                objetoAtualCena.id != objeto.id &&
                                isProximity( objeto, objetoAtualCena, objeto.objProps.proximityConfig ) == true
                            ){
                                eventosObjeto.whenProximity.bind(objeto)({
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
                    if( eventosObjeto.loop != null )
                    {
                        eventosObjeto.loop.bind(objeto)(objeto);
                    }
                }

            }
        }
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

    public updateObject( firstRender: boolean, 
                         renderizadorPronto: boolean, 
                         frameDelta: float, 
                         frameNumber: int 
    ): void{
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