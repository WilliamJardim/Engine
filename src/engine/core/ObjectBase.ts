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

export default class ObjectBase extends Base{

    public name?:string|undefined;
    public id:string;
    public mesh:any;
    public objProps:ObjectProps;
    public objEvents:ObjectEventLayer;
    public movimentState:MovementState;
    public physicsState:PhysicsState;
    public scene:Scene|null;

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

        this.physicsState = this.movimentState.physics || {};
        this.physicsState.havePhysics = (this.objProps || {}).havePhysics || false;

        this.setMesh( mesh );
    }

    /**
    * Atualiza a fisica do objeto 
    */
    public updatePhysics(): void{

        //If this object have physics
        if( this.scene != null && this.physicsState.havePhysics == true ){

            // Se está subindo, aplicamos a gravidade para diminuir a velocidade
            this.physicsState.velocity! += this.getScene()!
                                              .gravity;  // Acelera negativamente para reduzir a velocidade de subida

            this.getPosition().y += this.physicsState.velocity || 0;  // Move a câmera para cima
    
            // Verifica se o personagem alcançou o pico de altura e começou a cair
            if (this.getPosition().y <= (this.physicsState.posicaoYchao||0) ) { 
                this.getPosition().y = (this.physicsState.posicaoYchao||0);  // Impede de ultrapassar o chão
                this.physicsState.velocity = 0;  // Zera a velocidade vertical
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
                // Se existe o evento whenCollide
                if( eventosObjeto.whenCollide )
                {
                    const objetosCena = Array<ObjectBase>(0).concat( this.scene!.objects )
                                                            .concat( this.scene!.additionalObjects );

                    // Para cada objeto na cena, verifica se colidiu com este objeto
                    for( let objetoAtualCena of objetosCena ){
                        
                        //Se não for ele mesmo
                        //E Se ESTE objeto COLIDIR com o objeto atual da cena 
                        if( objetoAtualCena.id != objeto.id &&
                            isCollision( objeto, objetoAtualCena ) == true 
                        ) {
                            objeto.callEvent( eventosObjeto.whenCollide, {
                                self     : objeto,
                                target   : objetoAtualCena,
                                instante : new Date().getTime(),
                                subjects : [ objeto.id, objetoAtualCena.id ]
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
}