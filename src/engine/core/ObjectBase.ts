import * as THREE from 'three';
import Base from "./Base";
import ObjectProps from '../interfaces/ObjectProps';
import PhysicsState from '../interfaces/PhysicsState';
import MovementState from '../interfaces/MovementState';
import ObjectPosition from '../interfaces/ObjectPosition';

export default class ObjectBase extends Base{

    public mesh:any;
    public objProps:ObjectProps;
    public movimentState:MovementState;
    public physicsState:PhysicsState;

    constructor(mesh: any, 
                objProps?:ObjectProps
            
    ){
        super()
        this.objProps = objProps || {};
        
        this.movimentState = {
            forward: false,
            backward: false,
            right: false,
            left: false
        };

        this.physicsState = this.movimentState.physics || {};
        this.physicsState.havePhysics = this.objProps.havePhysics;

        this.setMesh( mesh );
    }

    /**
    * Atualiza a fisica do objeto 
    */
    public updatePhysics(){

        //If this object have physics
        if( this.physicsState.havePhysics == true ){

            // Se está subindo, aplicamos a gravidade para diminuir a velocidade
            this.physicsState.velocity += this.getMesh()
                                              .getScene()
                                              .gravity;  // Acelera negativamente para reduzir a velocidade de subida

            this.getPosition().y += this.physicsState.velocity || 0;  // Move a câmera para cima
    
            // Verifica se o personagem alcançou o pico de altura e começou a cair
            if (this.getPosition().y <= (this.physicsState.posicaoYchao||0) ) { 
                this.getPosition().y = (this.physicsState.posicaoYchao||0);  // Impede de ultrapassar o chão
                this.physicsState.velocity = 0;  // Zera a velocidade vertical
            }
            
        }

    }

    public updateObject(){
        this.updatePhysics();
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