import * as THREE from 'three';
import Base from "./Base";

export default class ObjectBase extends Base{

    public mesh:any;

    constructor(mesh: any){
        super()
        this.setMesh( mesh );
    }

    getMesh(): any{
        return this.mesh;
    }

    setMesh(newMesh:any): void{
        this.mesh = newMesh;
    }
}