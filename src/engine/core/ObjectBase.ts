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

export default class ObjectBase extends Base{

    public name?:string|undefined;
    public id:string;
    public mesh:any;
    public objProps:ObjectProps;
    public objEvents:ObjectEventLayer;
    public movimentState:MovementState;
    public physicsState:PhysicsState;
    public scene:Scene|null;
    public isFalling:boolean;

    constructor(mesh: any, 
                objProps?:ObjectProps
            
    ){
        super()
       
        this.objProps  = objProps || ({} as ObjectProps);

        this.id          = (this.objProps.name||'objeto') + String(new Date().getTime());
        this.name        = this.objProps.name || undefined;

        this.objEvents = new ObjectEventLayer(this.objProps.events || []);

        this.scene = null;

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
    }

    public setProps( newObjProps:ObjectProps ): void{
        this.objProps = newObjProps;
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

    public getScale(): THREE.Vector3{
        return this.getMesh().scale;
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
    * Atualiza a fisica do objeto 
    */
    public updatePhysics(): void{

        const objetosCena : ObjectBase[]     = Array<ObjectBase>(0).concat( this.scene!.objects )
                                                                   .concat( this.scene!.additionalObjects );

        this.isFalling = true;

        //If this object have physics
        if( this.scene != null && this.scene.gravity && this.physicsState.havePhysics == true )
        {
            /**
            * Para cada objeto da cena
            */
            for( let objetoAtualCena of objetosCena )
            {
                /**
                * Se o ESTE OBJETO colidir com o TAL outro OBJETO, ele corrige a posição Y DESTE OBJETO, para impedir ultrapassar o TAL outro OBJETO
                */
                if( objetoAtualCena.id != this.id && isProximity( this, objetoAtualCena, 1.7 ) === true )
                {
                    //Corrige a posição Y do objeto pra não ultrapassar o Y do objeto
                    this.setPosition({
                        y: objetoAtualCena.getPosition().y + (objetoAtualCena.getScale().y/1.2) + (this.getScale().y/1.2)
                    })

                    // Zera a velocidade do objeto pois ele já caiu
                    this.getVelocity().y = 0;

                    this.isFalling = false;
                    break;

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
                if( objeto.objProps.collide != false && 
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
                                objetoAtualCena.objProps.collide != false
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
            }

        }
    }

    public updateObject(): void{
        this.updatePhysics();
        this.updateEvents();
    }
}