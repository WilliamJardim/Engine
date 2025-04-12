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
    public groundY:number; // A posição Y do chão atual em relação a este objeto
    public objectBelow: ObjectBase|null; //O objeto cujo o objeto atual está em cima dele. Ou seja, objectBelow é o objeto que esta abaixo do objeto atual. Pode ser o chao ou outro objeto
    public infoCollisions:CollisionsData;
    public isMovimentoTravadoPorColisao:boolean;
    public onCreate:Function|null;

    constructor(mesh: any, 
                objProps?:ObjectProps
            
    ){
        super()
    
        this.objProps  = objProps || ({} as ObjectProps);

        this.onCreate  = this.objProps.onCreate || null;

        this.groundY = 0;
        this.objectBelow = null;
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

        this.movimentState = {
            forward: false,
            backward: false,
            right: false,
            left: false
        };

        this.physicsState = this.movimentState.physics || {

            //Define a velocidade inicial do objeto
            velocity: { x: 0, y: 0, z: 0 } as ObjectVelocity

        };

        this.physicsState.havePhysics = (this.objProps || {}).havePhysics || false;

        this.setMesh( mesh );

        this.isFalling = false;

        //Se tem posição
        if( this.objProps.position ){
            this.setPosition( this.objProps.position );
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

    public getPosition(): THREE.Vector3{
        return this.getMesh().position;
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
        this.getPosition().x += x;
    }
    
    public somarY( y:number ): void{
        this.getPosition().y += y;
    }

    public somarZ( z:number ): void{
        this.getPosition().z += z;
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

    public getVelocity(): ObjectVelocity{
        return this.physicsState.velocity;
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
    public updateCollisionState(): void{

        const esteObjeto  : ObjectBase       = this;

        const objetosCena : ObjectBase[]     = Array<ObjectBase>(0).concat( this.scene!.objects )
                                                                   .concat( this.scene!.additionalObjects );

        // Zera as informações de colisão
        this.infoCollisions = {
            objectNames: [],
            objectIDs: [],
            objectClasses: [],
            objects: []
        };

        //If this object have physics
        if( (this.objProps.traverse != true) &&
            (this.objProps.collide == true || this.objProps.collide == undefined ) && 
            this.scene != null && 
            this.scene.gravity && 
            this.physicsState.havePhysics == true 
        ){
            for( let objetoAtualCena of objetosCena )
            {
                /**
                * Se o ESTE OBJETO tiver colisão habilitada e colidir com o TAL outro OBJETO
                */
                if( (objetoAtualCena.objProps.traverse != true) &&
                    (objetoAtualCena.objProps.collide == true || objetoAtualCena.objProps.collide == undefined ) && 
                     objetoAtualCena.id != esteObjeto.id && 
                     isCollision( esteObjeto, objetoAtualCena, 0.5 ) === true 
                ){
                    // Registra as colisões detectadas
                    if(objetoAtualCena.name){
                        esteObjeto.infoCollisions.objectNames.push( objetoAtualCena.name );
                    }
                    if(objetoAtualCena.id){
                        esteObjeto.infoCollisions.objectIDs.push( objetoAtualCena.id );
                    }
                    if(objetoAtualCena.objProps.classes){
                        objetoAtualCena.objProps.classes.forEach(function(){
                            esteObjeto.infoCollisions.objectClasses.push( objetoAtualCena.id );
                        });
                    }
                    esteObjeto.infoCollisions.objects.push( objetoAtualCena );
                }
            }
        }   
    }

    /**
    * Atualiza a fisica do objeto 
    */
    public updatePhysics(): void{

        const esteObjeto  : ObjectBase       = this;

        const objetosCena : ObjectBase[]     = Array<ObjectBase>(0).concat( this.scene!.objects )
                                                                   .concat( this.scene!.additionalObjects );
        
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
                     isProximity( this, objetoAtualCena, 0.8, true, false ) === true 
                ){
                    //Corrige a posição Y do objeto pra não ultrapassar o Y do objeto
                    //BUG: Se o cubo ficar em baixo da caixa e subir um pouquinho Y dele, a caixa corrige sua posição e FICA EM CIMA DO CUBO
                    if( this.getPosition().y > objetoAtualCena.getPosition().y )
                    {
                        this.setPosition({
                            y: objetoAtualCena.getPosition().y + (objetoAtualCena.getScale().y/1.4) + (this.getScale().y/1.4)
                        });

                        //Diz que o objeto parou de cair
                        this.isFalling = false;
                        this.groundY = this.getPosition().y; // A posição da ultima colisão
                        this.objectBelow = objetoAtualCena;
                    }

                    //Impede que o objeto suba em cima de outro objeto
                    if( this.isMovimentoTravadoPorColisao == false && this.getPosition().y < objetoAtualCena.getPosition().y ){
                        this.setPosition({
                            y: objetoAtualCena.getPosition().y - objetoAtualCena.getScale().y - this.getScale().y
                        })
                    }

                    /**
                    * A linha que estava comentada: objetoAtualCena.objProps.havePhysics === false , é desnecessaria, pois, o objeto não precisa ser estatico para nao poder ultrapassar
                    * Porem é mais dificil de testar se objetos tiverem fisica, por que ficam caindo. Mais eu fiz um teste movendo o chao para baixo, e a caixa e o cubo cairam certinho como esperado, e o cubo não conseguiu ultrapassar a caixa por baixo
                    *
                    * DETALHE: Mais se não mover o chao pra baixo não deu pra testar pois quando eu tentei mover o cubo pra ficar em baixo da caixa ele ficou no meio da caixa,
                    * mais isso não é por causa da logica de correação da posição do cubo, mais sim, por que, o cubo a onde ele tava não pode ultrassar a caixa, ai a logica de correção dele jogou ele pra baixo da caixa, porém, isso fez ele ultrapassar o chão, então, ele corrigiu a posição e ficou em cima do chão, o que fez ele ficar no meio da caixa
                    * Eu sei disso por que testei varias vezes, e ao fazer ess teste de mover o chao pra baixo, os dois objetos cairam corretamente como eu queria, e quando cairam no chao, o cubo ficou em baixo da caixa, e quando eu tentei forçar o cubo a ultrapassar a caixa por baixo, ele permaneceu lá em baixo da caixa, então a posição foi corrigida certa, e mesmo assim continuou em cima do chão, o que também é otimo, msotra que ta certo.
                    */

                    // Zera a velocidade do objeto pois ele já caiu
                    this.getVelocity().y = 0;

                    break;
                    
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
                     isProximity( this, objetoAtualCena, 0.5, true, false ) === true
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

                        // Se houver sobreposição em algum dos eixos então houve colisão
                        if (sobreposicaoX > 0 && sobreposicaoZ > 0) 
                        {
                            // Corrigir no eixo de menor sobreposição (para evitar "grudar" no canto)
                            if (sobreposicaoX < sobreposicaoZ) {
                                // Empurra no X
                                if (posA.x < posB.x) {
                                    this.getPosition().x -= sobreposicaoX;
                                } else {
                                    this.getPosition().x += sobreposicaoX;
                                }
                                this.getVelocity().x = 0;

                            } else {
                                // Empurra no Z
                                if (posA.z < posB.z) {
                                    this.getPosition().z -= sobreposicaoZ;
                                } else {
                                    this.getPosition().z += sobreposicaoZ;
                                }
                                this.getVelocity().z = 0;
                            }

                            this.isMovimentoTravadoPorColisao = true;
                        }
                    }
                }
            }

            /**
            * Se o objeto está caindo 
            */
            if( this.isFalling === true )
            {
                if( this.getVelocity().y != undefined ){
                    this.getVelocity().y += Math.abs( this.scene.gravity );
                    this.getPosition().y -= this.getVelocity().y;

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
            }

        }

    }

    /**
    * Atualiza a movimentação do objeto, e do objeto em relação aos outros objetos na cena, como por exemplo objetos que podem carregar ele
    */
    public updateMovement(): void{

        const objeto  : ObjectBase = this;

        const objetosCena : ObjectBase[]  =  Array<ObjectBase>(0).concat( this.scene!.objects )
                                                                 .concat( this.scene!.additionalObjects );

        // Se o objeto atual estiver em cima de outro objeto, este objeto o carrega junto ao ser mover
        if( objeto.objectBelow ){
            //Se o objeto se moveu
            if( objeto.objectBelow ){
                //
            }
        }                                
    
    }

    /**
    * Atualize objetos anexados/grudados 
    */
    public updateAttachments(): void{

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
    public updateEvents(): void{
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
                                isCollision( objeto, objetoAtualCena ) == true 
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

    public updateObject(): void{
        /**
        * Principal: Fisica, Movimentação e Eventos 
        */
        this.updatePhysics();

        /**
        * Igualmente importante, atualiza quais objetos estão colidindo/e os que estão proximos com quais objetos 
        */
        this.updateCollisionState();

        this.updateMovement();
        this.updateEvents();

        /**
        * Atualiza os "attachments" ou "objeto anexados/grudados" ao objeto atual
        */
        this.updateAttachments();
    }
}