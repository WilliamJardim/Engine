import * as THREE from 'three';
import Base from "./Base";
import ObjectProps from './interfaces/ObjectProps';

export default class ObjectBase extends Base{

    public mesh:any;
    public objProps:ObjectProps;

    constructor(mesh: any, 
                objProps?:ObjectProps
            
    ){
        super()
        this.objProps = objProps || {};
        this.setMesh( mesh );
    }

    setProps( newObjProps:ObjectProps ): void{
        this.objProps = newObjProps;
    }

    getProps(): ObjectProps{
        return this.objProps;
    }

    getMesh(): any{
        return this.mesh;
    }

    setMesh(newMesh:any): void{
        this.mesh = newMesh;
    }
}