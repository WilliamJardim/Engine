import ObjectEventLayer from "../interfaces/ObjectEventBlock";
import ObjectProps from "../interfaces/ObjectProps";
import ObjectBase from "./ObjectBase";
import Scene from "./Scene";

/**
* My Player class
*/
export default class Player extends ObjectBase{
    public tipo:string = 'Player';
    public name:string|undefined;
    public objEvents:ObjectEventLayer;
    public id:string;
    public objProps:ObjectProps;
    public scene:Scene|null;

    constructor(objProps?:ObjectProps){
        super( null, objProps );
        this.objProps    = objProps || {} as ObjectProps;
        this.id          = (this.objProps.name||'imaginario') + String(new Date().getTime());
        this.name        = this.objProps.name || undefined;
        this.scene       = null;
        this.objEvents   = new ObjectEventLayer(this.objProps.events || []);
    }
}