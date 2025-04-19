import * as THREE from 'three';
import Base from "./Base";
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

export default class ObjectBase extends Base{
    
    public tipo:string = 'ObjectBase';
    public name?:string|undefined;
    public id:string;
    public mesh:any;
    public objProps:ObjectProps;
    public objEvents:ObjectEventLayer;
    public movimentState:MovementState;
    public physicsState:PhysicsState;
    public scene:Scene|null;
    public isFalling:boolean;
    public isRecevingYMovementPhysics:boolean; //Indica se este objeto está recebendo uma fisica de movimento em Y O QUE VAI SER DIFERENTE DA FISICA DE QUEDA NO EIXO Y
    public groundY:number; // A posição Y do chão atual em relação a este objeto
    public objectBelow: ObjectBase|null; //O objeto cujo o objeto atual está em cima dele. Ou seja, objectBelow é o objeto que esta abaixo do objeto atual. Pode ser o chao ou outro objeto. Se o objeto atual estiver no ar(caindo, ou se for um objeto sem fisica), essa variavel vai ter valor null
    public lastObjectBelow: ObjectBase|null; //O ultimo objeto cujo o objeto atual esteve em cima 
    public infoCollisions:CollisionsData;
    public infoProximity:CollisionsData;
    public isMovimentoTravadoPorColisao:boolean;
    public onCreate:Function|null;

    /** OUTROS ATRIBUTOS **/
    public lastPosition:ObjectPosition = {x: 0, y: 0, z: 0};

    constructor(mesh: any, 
                objProps?:ObjectProps
            
    ){
        super()
    
        this.objProps  = objProps || ({} as ObjectProps);

        this.onCreate  = this.objProps.onCreate || null;

        this.groundY = 0;
        this.objectBelow = null;
        this.lastObjectBelow = null;
        this.isMovimentoTravadoPorColisao = false; //Se o objeto atual esta travado por que esta tentando se mover para uma direção em que ele está colidindo com outro objeto

        this.id          = (this.objProps.name||'objeto') + String(new Date().getTime());
        this.name        = this.objProps.name || undefined;

        this.objEvents = new ObjectEventLayer(this.objProps.events || []);

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

        this.movimentState = {
            forward: false,
            backward: false,
            right: false,
            left: false,
            steps: 1
        };

        this.physicsState = this.movimentState.physics || {

            //Define a velocidade inicial do objeto
            velocity: { x: 0, y: 0, z: 0 } as ObjectVelocity

        };

        this.physicsState.havePhysics = (this.objProps || {}).havePhysics || false;

        this.setMesh( mesh );

        this.isFalling = false;
        this.isRecevingYMovementPhysics = false;

        //Se tem posição
        if( this.objProps.position ){
            this.setPosition( this.objProps.position );
        }
        //Se tem rotação
        if( this.objProps.rotation ){
            this.setRotation( this.objProps.rotation );
        }
        //Se tem escala
        if( this.objProps.scale ){
            this.setScale( this.objProps.scale );
        }
        // Se tem redução de escala
        if( this.objProps.scaleReduce ){
            if( typeof this.objProps.scaleReduce == 'object' ){
                this.somarEscalaX( this.objProps.scaleReduce.x || 0 );
                this.somarEscalaY( this.objProps.scaleReduce.y || 0 );
                this.somarEscalaZ( this.objProps.scaleReduce.z || 0 );

            //Se o scaleReduce for um numero, todos os eixos sofrem igual
            }else if(typeof this.objProps.scaleReduce == 'number'){
                this.somarEscalaX( this.objProps.scaleReduce || 0 );
                this.somarEscalaY( this.objProps.scaleReduce || 0 );
                this.somarEscalaZ( this.objProps.scaleReduce || 0 );
            }
        }

        // Dispara o evento ao criar o objeto
        if( this.onCreate )
        {
            this.onCreate.bind(this)()
        }
    }

    /**
    * Verifica se este objeto tem uma classe especifica 
    */
    public haveClass( className:string ): boolean{
        if(this.objProps.classes){
            return this.objProps.classes.includes(className);
        }
        return false;
    }

    /**
    * Retorna todos os objetos anexados ao objeto atual
    */
    public getAttachments(): Array<string|ObjectAttachment>|undefined{
        return this.objProps.attachments;
    }

    /**
    * Faz o objeto atual se anexar com outro objeto
    * @param {ObjectBase} outroObjeto
    * @param {ObjectAttachment} attachementConfig
    */
    public joinAttachment( outroObjeto:ObjectBase, attachementConfig: ObjectAttachment ): void{
        const esteObjeto:ObjectBase = this;

        //Se nao existe cria
        if( !outroObjeto.objProps.attachments ){
            outroObjeto.objProps.attachments = [];
        }

        // Cria o anexo no outro objeto para linkar esteObjeto com ele
        outroObjeto.objProps.attachments.push({
            name:esteObjeto.name, 
            id:esteObjeto.id, 

            //Junto com o resto do attachementConfig
            ... attachementConfig

        } as ObjectAttachment);
    }

    /**
    * Adiciona algum objeto ao objeto atual simplismente adicionando ele na lista de attachments 
    * @param {ObjectBase} objetoAnexar
    * @param {ObjectAttachment} attachementConfig
    */
    public attach( objetoAnexar:ObjectBase, attachementConfig: ObjectAttachment ): void{
        const esteObjeto:ObjectBase = this;

        //Se nao existe cria
        if( !esteObjeto.objProps.attachments ){
            esteObjeto.objProps.attachments = [];
        }

        // Cria o anexo no outro objeto para linkar esteObjeto com ele
        esteObjeto.objProps.attachments.push({
            name:objetoAnexar.name, 
            id:objetoAnexar.id, 

            //Junto com o resto do attachementConfig
            ... attachementConfig

        } as ObjectAttachment);
    }

    /**
    * Limpa a lista de attachments do objeto atual. Similar ao DettachFromAll(), porém, isso limpa a lista do objeto pai, liberando todos os objetos subordinados/anexados a ele.
    */
    public ClearAttachments(): void{
        const esteObjeto:ObjectBase = this;
        esteObjeto.objProps.attachments = [];
    }

    public setProps( newObjProps:ObjectProps ): void{
        this.objProps = newObjProps;

        if( this.objProps.havePhysics != undefined ){
            this.physicsState.havePhysics = this.objProps.havePhysics;
        }
    }

    public addProp( propName:string, propValue:any ): void{
        this.objProps[ propName ] = propValue;

        if( propName == 'havePhysics' ){
            this.physicsState.havePhysics = propValue;
        }
    }   

    public getProps(): ObjectProps{
        return this.objProps;
    }

    public getMesh(): any{
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
    public getPosition(): THREE.Vector3{
        return this.getMesh().position;
    }

    /**
    * Obtém a posição ANTERIOR: X Y Z do objeto na cena
    */
    public getLastPosition(): ObjectPosition{
        return this.lastPosition;
    }

    public setPosition( position: ObjectPosition ): ObjectBase{
        const mesh: THREE.Mesh = this.getMesh();
        mesh.position.x = position.x || mesh.position.x;
        mesh.position.y = position.y || mesh.position.y;
        mesh.position.z = position.z || mesh.position.z;

        //Retorna ele mesmo modificado
        return this;
    }

    public somarX( x:number ): void{
        this.getPosition().x! += x;
    }
    
    public somarY( y:number ): void{
        this.getPosition().y! += y;
    }

    public somarZ( z:number ): void{
        this.getPosition().z! += z;
    }

    public somarPosicaoX( x:number ): void{
        this.getPosition().x! += x;
    }
    
    public somarPosicaoY( y:number ): void{
        this.getPosition().y! += y;
    }

    public somarPosicaoZ( z:number ): void{
        this.getPosition().z! += z;
    }

    public subtrairPosicaoX( x:number ): void{
        this.getPosition().x! -= x;
    }
    
    public subtrairPosicaoY( y:number ): void{
        this.getPosition().y! -= y;
    }

    public subtrairPosicaoZ( z:number ): void{
        this.getPosition().z! -= z;
    }

    public somarEixo(eixo:string, valor:number): void{
        (this.getPosition() as ObjectPosition)[eixo] += valor;
    }

    public subtrairEixo(eixo:string, valor:number): void{
        (this.getPosition() as ObjectPosition)[eixo] -= valor;
    }

    /**
    * Acrescenta uma posição ao objeto
    * @param rotation 
    */
    public somarPosition( position:ObjectPosition ): void{
        if( position.x ){ this.getPosition().x! += position.x };
        if( position.y ){ this.getPosition().y! += position.y };
        if( position.z ){ this.getPosition().z! += position.z };
    }

    public setScale( scale: ObjectScale|number ): ObjectBase{
        const mesh: THREE.Mesh = this.getMesh();

        if( typeof scale == 'object' ){
            mesh.scale.x = scale.x || mesh.scale.x;
            mesh.scale.y = scale.y || mesh.scale.y;
            mesh.scale.z = scale.z || mesh.scale.z;

        //Se a escala for um numero igual para todos os eixos
        }else if( typeof scale == 'number' ){
            mesh.scale.x = scale || mesh.scale.x;
            mesh.scale.y = scale || mesh.scale.y;
            mesh.scale.z = scale || mesh.scale.z;
        }

        //Retorna ele mesmo modificado
        return this;
    }

    public getScale(): THREE.Vector3{
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
        if( scale.x ){ this.getScale().x += scale.x };
        if( scale.y ){ this.getScale().y += scale.y };
        if( scale.z ){ this.getScale().z += scale.z };
    }

    public getVelocity(): ObjectVelocity{
        return this.physicsState.velocity;
    }

    /**
    * Acrescenta uma velocidade ao objeto
    * @param velocidade 
    */
    public somarVelocity( velocidade:ObjectVelocity ): void{
        if( velocidade.x ){ this.getVelocity().x += velocidade.x };
        if( velocidade.y ){ this.getVelocity().y += velocidade.y };
        if( velocidade.z ){ this.getVelocity().z += velocidade.z };
    }

    public subtrairVelocityX( velocidade:number ): void{
        this.getVelocity().x -= velocidade
    }

    public subtrairVelocityY( velocidade:number ): void{
        this.getVelocity().y -= velocidade
    }

    public subtrairVelocityZ( velocidade:number ): void{
        this.getVelocity().z -= velocidade
    }

    public somarVelocityEixo(eixo:string, valor:number): void{
        (this.getVelocity() as ObjectVelocity)[eixo] += valor;
    }

    public subtrairVelocityEixo(eixo:string, valor:number): void{
        (this.getVelocity() as ObjectVelocity)[eixo] -= valor;
    }

    public setVelocity( velocidade:ObjectVelocity ): void{
        if( velocidade.x ){ this.getVelocity().x = velocidade.x };
        if( velocidade.y ){ this.getVelocity().y = velocidade.y };
        if( velocidade.z ){ this.getVelocity().z = velocidade.z };
    }

    public setVelocityX( velocidade:number ): void{
        this.getVelocity().x = velocidade;
    }

    public setVelocityY( velocidade:number ): void{
        this.getVelocity().y = velocidade;
    }

    public setVelocityZ( velocidade:number ): void{
        this.getVelocity().z = velocidade;
    }

    public setVelocityEixo( eixo:string, velocidade:number ): void{
        (this.getVelocity() as ObjectVelocity)[eixo] = velocidade;
    }

    public getRotation(): THREE.Vector3{
        return this.getMesh().rotation;
    }

    public setRotation( rotation: ObjectRotation ): ObjectBase{
        const mesh: THREE.Mesh = this.getMesh();
        mesh.rotation.x = rotation.x !== undefined ? rotation.x : mesh.rotation.x;
        mesh.rotation.y = rotation.y !== undefined ? rotation.y : mesh.rotation.y;
        mesh.rotation.z = rotation.z !== undefined ? rotation.z : mesh.rotation.z;

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
        if( rotation.x ){ this.getRotation().x += rotation.x };
        if( rotation.y ){ this.getRotation().y += rotation.y };
        if( rotation.z ){ this.getRotation().z += rotation.z };
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
    * Calcula a massa do objeto 
    * @returns {number}
    */
    public getMassa(): number {
        const peso = this.objProps.weight || 0;
        return peso / (this.scene!.gravity || 0.5); 
    }

    /**
    * Calcula a massa total do objeto 
    * @returns {number}
    */
    public getMassaTotal(): number {
        const densidade = this.objProps.density || 1;
        const volume    = this.getVolume();
        const peso      = this.objProps.weight || 0;
        
        const massaPorDensidade = densidade * volume;
        const massaPorPeso = peso / (this.scene!.gravity || 9.8);
    
        return massaPorDensidade + massaPorPeso;
    }

    /**
    * Retorna o peso do objeto levando em conta a area dele, algo que vou usar na fisica
    * @returns {number} 
    */
    public getAreaPeso(): number{
        return (this.objProps.weight||0) + (0.3 * (this.objProps.weight||0) * this.getVolume());
    }

    /**
    * Calcula a força/impacto
    * Isso não calcula apenas o impacto mais tambem leva em conta o peso intensificado pelo volume do objeto
    */
    public getImpacto(): number{
        const velocidadeObjeto = this.getVelocity();
        const velocidadeTotal  = Math.sqrt(velocidadeObjeto.x**2 + velocidadeObjeto.y**2 + velocidadeObjeto.z**2);

        return this.getAreaPeso() * velocidadeTotal;
    }

    /**
    * Atualiza status de colisão e proximidade com outros objetos 
    */
    public updateCollisionState( frameDelta:number ): void{

        const esteObjeto  : ObjectBase       = this;

        const objetosCena : ObjectBase[]     = Array<ObjectBase>(0).concat( this.scene!.objects )
                                                                   .concat( this.scene!.additionalObjects );

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
                    if( isCollision( esteObjeto, objetoAtualCena, 0.5 ) === true ){
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
                    if( isProximity( esteObjeto, objetoAtualCena, ( esteObjeto.objProps.proximityConfig || 100) ) === true ){
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

        const esteObjeto  : ObjectBase       = this;

        const objetosCena : ObjectBase[]     = Array<ObjectBase>(0).concat( this.scene!.objects )
                                                                   .concat( this.scene!.additionalObjects );
        
        const scene            : Scene|null     = esteObjeto.scene;
        const gravity          : number         = ((scene||{}).gravity || -45);
        const frameDeltaIntensification: number = (((scene||{}).frameDeltaIntensification || 1));
        const objectPhysicsUpdateRate:number    = (((scene||{}).objectPhysicsUpdateRate || 10));

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
                     isCollision( this, objetoAtualCena, (this.isFalling == true ? 0.8 : 0.5) ) === true 
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
                    }
                    
                    /*
                    //Diz que o objeto parou de cair
                    this.isFalling = false;
                    this.groundY = this.getPosition().y; // A posição da ultima colisão
                    this.objectBelow = objetoAtualCena;
                    this.lastObjectBelow = objetoAtualCena;
                    */
                    

                    //Impede que o objeto suba em cima de outro objeto
                    if( this.isMovimentoTravadoPorColisao == false && this.getPosition().y < objetoAtualCena.getPosition().y ){
                        this.setPosition({
                            y: objetoAtualCena.getPosition().y - objetoAtualCena.getScale().y - this.getScale().y
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
                    if( this.isRecevingYMovementPhysics == false ){
                        this.getVelocity().y = 0;
                    }

                    break;
                    //Engine.get('CuboRef').somarVelocity({y:10})
                }
            }

            /**
            * FISICA PARA IMPEDIR MOVIMENTO AO COLIDIR
            * Para cada objeto da cena
            * (Esse laço percorre novamente os objetos porém sem usar o break)
            */
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
                        const posA   : THREE.Vector3  = this.getPosition();
                        const scaleA : THREE.Vector3  = this.getScale();

                        const posB   : THREE.Vector3  = objetoAtualCena.getPosition();
                        const scaleB : THREE.Vector3  = objetoAtualCena.getScale();

                        // Zona do objeto atual
                        const minA = { x: posA.x - scaleA.x / 2, z: posA.z - scaleA.z / 2 };
                        const maxA = { x: posA.x + scaleA.x / 2, z: posA.z + scaleA.z / 2 };

                        // Zona do objeto colisor, cujo objeto atual esta intersectando
                        const minB = { x: posB.x - scaleB.x / 2, z: posB.z - scaleB.z / 2 };
                        const maxB = { x: posB.x + scaleB.x / 2, z: posB.z + scaleB.z / 2 };

                        const sobreposicaoX:number = Math.min(maxA.x, maxB.x) - Math.max(minA.x, minB.x);
                        const sobreposicaoZ:number = Math.min(maxA.z, maxB.z) - Math.max(minA.z, minB.z);

                        this.isMovimentoTravadoPorColisao = false;

                        if( true ){

                            // Se houver sobreposição em algum dos eixos então houve colisão
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
                                        
                                        if( posA.x <= minB.x ){
                                            this.getPosition().x -= sobreposicaoX;
                                        }

                                    } else {
                                        //this.getPosition().x += (sobreposicaoX + tolerancia);
                                        
                                        if( posA.x >= maxB.x ){
                                            this.getPosition().x += sobreposicaoX;
                                        }
                                    }
                                    //this.getVelocity().x = 0;

                                } else {
                                    // Empurra no Z
                                    if (posA.z < posB.z) {
                                        //this.getPosition().z -= (sobreposicaoZ + tolerancia);
                                        
                                        if( posA.z <= minB.z ){
                                            this.getPosition().z -= sobreposicaoZ;
                                        }

                                    } else {
                                        //this.getPosition().z += (sobreposicaoZ + tolerancia);
                                        
                                        if( posA.z >= maxB.z ){
                                            this.getPosition().z += sobreposicaoZ;
                                        }
                                    }
                                    //this.getVelocity().z = 0;
                                }

                                this.isMovimentoTravadoPorColisao = true;
                            }
                        }
                    }
                }
            }

            /**
            * Se o objeto está caindo 
            */
            if( this.isFalling === true )
            {
                /**
                * Enquanto o objeto estiver caindo, ele não tem objeto abaixo dele 
                */
                this.objectBelow = null;

                if( this.getVelocity().y != undefined ){
                    this.getVelocity().y += Math.abs( this.scene.gravity ) * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate;
                    this.getPosition().y -= this.getVelocity().y * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate;

                    this.objEvents
                    .getEventos()
                    .forEach(function(eventosObjeto:ObjectEvents){
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
                if( this.objProps.name != 'Player' ){
                    const wind:Wind = this.scene.wind;
                    const randomX = Math.random() * 0.00001;
                    const randomY = Math.random() * 0.00001;
                    const randomZ = Math.random() * 0.00001;

                    this.somarRotation({
                        x: randomX + ((wind.orientation.x  || 0 ) * ((wind.intensity || {}).x || 1) ) * Math.abs(gravity) * 4.8 * frameDelta * frameDeltaIntensification,
                        y: randomY + ((wind.orientation.y  || 0 ) * ((wind.intensity || {}).y || 1) ) * Math.abs(gravity) * 4.8 * frameDelta * frameDeltaIntensification,
                        z: randomZ + ((wind.orientation.z  || 0 ) * ((wind.intensity || {}).z || 1) ) * Math.abs(gravity) * 4.8 * frameDelta * frameDeltaIntensification
                    });

                    //O vento tambem empurra um pouco na queda
                    this.somarVelocity({
                        x: randomX + ( ((wind.deslocationTrend || {}).x || 0) + (wind.orientation.x  || 0 ) * ((wind.intensity || {}).x || 1) ),
                        y: randomY + ( ((wind.deslocationTrend || {}).y || 0) + (wind.orientation.y  || 0 ) * ((wind.intensity || {}).y || 1) ),
                        z: randomZ + ( ((wind.deslocationTrend || {}).z || 0) + (wind.orientation.z  || 0 ) * ((wind.intensity || {}).z || 1) )
                    });
                }

            // Se o objeto não está caindo
            }else{
                //Se ele já está no chão
                if( this.objectBelow != null && this.objProps.name != 'Player' ){
                    this.setRotation({x:0, y: 0, z: 0})
                }

            }

            

        }

    }

    /**
    * Atualiza a movimentação do objeto, e do objeto em relação aos outros objetos na cena, como por exemplo objetos que podem carregar ele
    */
    public updateMovement( frameDelta:number ): void{

        const objeto           : ObjectBase     = this;
        const velocidadeObjeto : ObjectVelocity = objeto.getVelocity();
        const scene            : Scene|null     = objeto.scene;
        const gravity          : number         = ((scene||{}).gravity || 0);
        const atrito           : number         = (((scene||{}).atrito || 0));
        const arrastoAr        : number         = (((scene||{}).arrastoAr || 0));
        const frameDeltaIntensification: number = (((scene||{}).frameDeltaIntensification || 1));
        const objectPhysicsUpdateRate:number    = (((scene||{}).objectPhysicsUpdateRate || 10));
        const objectPhysicsDesaceleracaoUpdateRate:number = (((scene||{}).objectPhysicsDesaceleracaoUpdateRate || 2));
        const movimentState:MovementState       = objeto.movimentState;

        const objetosCena : ObjectBase[]  =  Array<ObjectBase>(0).concat( this.scene!.objects )
                                                                 .concat( this.scene!.additionalObjects );

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
        }
        if( movimentState.backward == true ){
            objeto.subtrairPosicaoX( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
        }
        if( movimentState.left == true ){
            objeto.subtrairPosicaoZ( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
        }
        if( movimentState.right == true ){
            objeto.somarPosicaoZ( movimentState.steps * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );
        }

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
        }   

        //Se o objeto não estiver caindo e SE NÂO ESTIVER NO CHÂO OU EM CIMA DE ALGO
        //BUG: O EIXO Y NÂO CONSEGUE RECEBER UMA VELOCIDADE IGUAL NOS OUTROS POR CAUSA DA FISICA DE QUEDA QUE MANIPULA O EIXO Y
        if( velocidadeY != 0 )
        {   
            //Engine.get('CuboRef').setVelocity({x:5})
            if( objeto.isFalling == false && objeto.objectBelow == null ){
                objeto.isRecevingYMovementPhysics = true;
                objeto.somarPosicaoY( velocidadeY * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

                let novaVelocidadeY = (velocidadeObjeto.y - objectPhysicsDesaceleracaoUpdateRate * sinalY * frameDelta * frameDeltaIntensification * objectPhysicsUpdateRate );

                // Se o sinal da velocidade é diferente do sinal anterior (pra impedir de começar a andar para traz depois de a força acabar)
                if(Math.sign(novaVelocidadeY) !== sinalY){
                    novaVelocidadeY = 0;
                    objeto.isRecevingYMovementPhysics = false;
                }

                objeto.setVelocityY( novaVelocidadeY * arrastoAr );
            }

        }else{
            objeto.isRecevingYMovementPhysics = false;
        }
        
        //globalContext.get('CuboRef').somarVelocity({x:5})
        //globalContext.get('CuboRef').somarVelocity({x:1})
        //globalContext.get('CuboRef').somarVelocity({z:-50})
        //globalContext.get('CuboRef').somarVelocity({z:-30})
        //globalContext.get('CaixaRef').somarVelocity({z:-50})
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
             const massa           = esteObjeto.getMassaTotal();
             const normal          = massa * Math.abs(gravity);
             const atritoCalculado = coeficiente * normal;

             const deltaVelocidadeX = objetoAbaixoDele.getVelocity().x - esteObjeto.getVelocity().x;
             const deltaVelocidadeZ = objetoAbaixoDele.getVelocity().z - esteObjeto.getVelocity().z;

             const forcaX = Math.min(Math.abs(deltaVelocidadeX), atritoCalculado) * Math.sign(deltaVelocidadeX);
             const forcaZ = Math.min(Math.abs(deltaVelocidadeZ), atritoCalculado) * Math.sign(deltaVelocidadeZ);

             /**
             * Acompanha o movimento do objeto que ele está em baixo 
             */
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

            const deltaPosicaoX       = posicaoAtualDele.x - (posicaoAnteriorDele.x || 0);
            const deltaPosicaoZ       = posicaoAtualDele.z - (posicaoAnteriorDele.z || 0);

            /**
            * Acompanha o movimento do objeto que ele está em baixo 
            */
            esteObjeto.getPosition().x += deltaPosicaoX;
            esteObjeto.getPosition().z += deltaPosicaoZ;
        }
    
    }

    /**
    * Atualize objetos anexados/grudados 
    */
    public updateAttachments( frameDelta:number ): void{

        const objeto  : ObjectBase = this;
        const cena    : Scene|null = objeto.getScene();

        if(!cena){ return; }

        if( objeto.objProps.attachments )
        {                                                
            /**
            * Para cada objeto da cena
            */
            for( let anexo of objeto.objProps.attachments )
            {   
                let idObjetoAnexar:string = '';
                let tipoAnexo:string = '';

                //Se o anexo for uma string
                if( typeof anexo == 'string' ){
                    tipoAnexo = 'string';
                    idObjetoAnexar = anexo;

                //Se o anexo for um objeto ObjectAttachment
                }else if( typeof anexo == 'object' ){
                    tipoAnexo = 'object';

                    if( anexo.id ){
                        idObjetoAnexar = anexo.id;
                    }
                    if( anexo.name ){
                        idObjetoAnexar = anexo.name;
                    }
                }
                
                const objetoAnexar : ObjectBase|null = cena.getObjectBySomething( idObjetoAnexar );
                           
                if( objetoAnexar != undefined && objetoAnexar != null ){

                    //Se for um anexo simples, ele simplismente faz assim mesmo
                    if( typeof anexo == 'string' ) {
                        // Acompanha a posição do objeto
                        objetoAnexar.setPosition( objeto.getPosition() as ObjectPosition );
                    }

                    // Mais opções de anexo
                    if( typeof anexo == 'object' )
                    {
                        // Se tem um ajuste de posição EM RELAÇÂO AO OBJETO, aplica
                        if( anexo.position ){
                            // Acompanha a posição do objeto
                            objetoAnexar.setPosition( objeto.getPosition() as ObjectPosition );

                            // Alem disso, permite fazer um ajuste de posição
                            objetoAnexar.somarX( anexo.position.x || 0 );
                            objetoAnexar.somarY( anexo.position.y || 0 );
                            objetoAnexar.somarZ( anexo.position.z || 0 );
                        }

                        //Se vai copiar a memsa escala do objeto
                        if( anexo.sameScale == true ){
                            objetoAnexar.setScale( objeto.getScale() as ObjectScale );
                        }

                        // Se tem uma escala especifica para ele
                        if( anexo.scale ){
                            objetoAnexar.setScale( anexo.scale );
                        }
                        // Se tem redução de escala
                        if( anexo.scaleReduce ){
                            if( typeof anexo.scaleReduce == 'object' ){
                                objetoAnexar.somarEscalaX( anexo.scaleReduce.x || 0 );
                                objetoAnexar.somarEscalaY( anexo.scaleReduce.y || 0 );
                                objetoAnexar.somarEscalaZ( anexo.scaleReduce.z || 0 );

                            //Se o scaleReduce for um numero, todos os eixos sofrem igual
                            }else if(typeof anexo.scaleReduce == 'number'){
                                objetoAnexar.somarEscalaX( anexo.scaleReduce || 0 );
                                objetoAnexar.somarEscalaY( anexo.scaleReduce || 0 );
                                objetoAnexar.somarEscalaZ( anexo.scaleReduce || 0 );
                            }
                        }

                        //Se tem rotação
                        if( anexo.rotation ){
                            objetoAnexar.setRotation( anexo.rotation );
                        }
                        //Se tem incremento de rotação nos eixos
                        if( anexo.rotationIncrement ){
                            objetoAnexar.somarRotation( anexo.rotationIncrement );
                        }

                        //Se tem outras coisas
                        if( anexo.traverse ){
                            objetoAnexar.objProps.traverse = anexo.traverse;
                        }
                        if( anexo.collide ){
                            objetoAnexar.objProps.collide = anexo.collide;
                        }
                        if( anexo.havePhysics ){
                            objetoAnexar.objProps.havePhysics = anexo.havePhysics;
                            objetoAnexar.physicsState.havePhysics = anexo.havePhysics;
                        }
                        if( anexo.collisionEvents ){
                            objetoAnexar.objProps.collisionEvents = anexo.collisionEvents;
                        }
                        if( anexo.invisible ){
                            objetoAnexar.objProps.invisible = anexo.invisible;
                        }
                    }

                }
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
        const objeto  : ObjectBase       = this;
        const eventos : ObjectEventLayer = objeto.objEvents;

        //Se tem eventos
        if( eventos )
        {   
            // Para cada bloco de evento
            for( let eventosObjeto of eventos.getEventos() )
            {
                const objetosCena: ObjectBase[] = Array<ObjectBase>(0).concat( this.scene!.objects )
                                                                      .concat( this.scene!.additionalObjects );

                // Se o objeto pode colidir e Se existe o evento whenCollide
                if( (objeto.objProps.collide != false || objeto.objProps.collisionEvents == true) && 
                    eventosObjeto.whenCollide 
                ){
                    
                    // Para cada objeto na cena, verifica se colidiu com este objeto
                    for( let objetoAtualCena of objetosCena ){
            
                        //Se ESTE objeto COLIDIR com o objeto atual da cena 
                        if( 
                            // Se não for ele mesmo
                            (
                                objetoAtualCena.id != objeto.id 
                            ) &&
                            //Se o objetoAtualCena tem colisão habilitada
                            (
                                (objetoAtualCena.objProps.collide != false || objetoAtualCena.objProps.collisionEvents == true)
                            ) &&
                            //Se o objeto atual NÂO tiver uma exceção para o objetoAtualCena
                            (
                                (
                                    //Se ele inclui o ID ou se não tem ignoreColisions nem entra
                                    (objeto.objProps.ignoreCollisions?.includes( objetoAtualCena.id ) == false || !objeto.objProps.ignoreCollisions) &&
                                    //Se ele tem nome o nome é uma excessao ou se ele não tem name, nem entra
                                    (objetoAtualCena.name && objeto.objProps.ignoreCollisions?.includes( objetoAtualCena.name ) == false || !objetoAtualCena.name) &&
                                    //Se ele tem classes na excessao ou se ele não tem classes nem entra
                                    (objeto.objProps.classes?.some((classe:string)=>{ return objetoAtualCena.objProps.ignoreCollisions?.includes( classe ) == true }) == false || !objeto.objProps.classes)
                                
                                //Mais se não tiver o ignoreColissions ele não vai aplicar essa excessão
                                ) || !objeto.objProps.ignoreCollisions
                            ) &&
                            //Se o objetoAtualCena NÂO tiver uma exceção para o objeto
                            (
                                (
                                    (objetoAtualCena.objProps.ignoreCollisions?.includes( objeto.id ) == false || !objetoAtualCena.objProps.ignoreCollisions) &&
                                    (objeto.name && objetoAtualCena.objProps.ignoreCollisions?.includes( objeto.name ) == false || !objeto.name) &&
                                    (objetoAtualCena.objProps.classes && objetoAtualCena.objProps.classes.some((classe:string)=>{ return objetoAtualCena.objProps.ignoreCollisions?.includes( classe ) == true }) == false || !objetoAtualCena.objProps.classes)
                                    //Mais se não tiver o ignoreColissions ele não vai aplicar essa excessão
                                ) || !objetoAtualCena.objProps.ignoreCollisions
                            ) &&
                            /** Se houve uma colisão de fato **/
                            (
                                isCollision( objeto, objetoAtualCena, 0.5 ) == true 
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
                            (
                                objetoAtualCena.id != objeto.id 
                            ) &&
                            isProximity( objeto, objetoAtualCena, ( objeto.objProps.proximityConfig || 100) ) == true
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

    public updateObject( frameDelta:number ): void{
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
        * Atualiza os eventos do objeto 
        */
        this.updateEvents( frameDelta );

        /**
        * Atualiza os "attachments" ou "objeto anexados/grudados" ao objeto atual
        */
        this.updateAttachments( frameDelta );
    }

    /**
    * Outros métodos 
    */

    /**
    * Verifica se um objeto está colidindo com ESTE OBJETO
    * @param outroObjeto 
    * @returns {boolean}
    */
    isCollisionOf( outroObjeto:ObjectBase|string, limites?:ProximityBounds|number|undefined ): boolean{
        if(this.scene){
            return this.scene.queryIfObjectIsCollisionOf( this, outroObjeto, limites );
        }
        return false;
    }

    /**
    * Traz todos os objetos que estão colidindo com ESTE OBJETO
    */
    getCollisions( limites?:ProximityBounds|number|undefined ): ObjectBase[]{
        const esteObjeto : ObjectBase = this;

        //Se não tem limites personalizados
        if( limites == undefined ){
            return this.infoCollisions.objects;

        //Se tem limites de zona de colisão personalizado
        }else{
            if(this.scene){
                //Traz só os objetos que estão colidindo dentro da zona definida no "limites"
                return this.scene.objects.filter(
                    function( objetoAtual:ObjectBase ){ 
                        return isCollision( esteObjeto, objetoAtual, limites ) == true && esteObjeto.id !== objetoAtual.id;
                    }
                );
            }
        }

        return [];
    }

    /**
    * Traz todos os objetos que estão proximos DESTE OBJETO
    */
    getProximity( limites?:ProximityBounds|number|undefined ): ObjectBase[]{
        const esteObjeto : ObjectBase = this;

        //Se não tem limites personalizados
        if( limites == undefined ){
            return this.infoProximity.objects;

        //Se tem limites de zona de colisão personalizado
        }else{
            if(this.scene){
                //Traz só os objetos que estão colidindo dentro da zona definida no "limites"
                return this.scene.objects.filter(
                    function( objetoAtual:ObjectBase ){ 
                        return isProximity( esteObjeto, objetoAtual, limites ) && esteObjeto.id !== objetoAtual.id;
                    }
                );
            }
        }

        return [];
    }

    /**
    * Verifica se um objeto está proximo DESTE OBJETO
    * @param outroObjeto 
    * @returns {boolean}
    */
    isProximityOf( outroObjeto:ObjectBase|string, limites?:ProximityBounds|number|undefined ): boolean{
        if(this.scene){
            return this.scene.queryIfObjectIsProximityOf( this, outroObjeto, limites );
        }
        return false;
    }
}