/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectEventLayer from "../interfaces/ObjectEventBlock";
import ObjectProps from "../interfaces/ObjectProps";
import ObjectBase from "./ObjectBase";
import Scene from "./Scene";

/**
* My Camera class
*/
export default class Camera extends ObjectBase{
    public tipo:string = 'Camera';
    public name:string|undefined;
    public objEvents:ObjectEventLayer;
    public id:string;
    public objProps:ObjectProps;
    public scene:Scene|null;
    public ativo:boolean = true;
    public mainCamera:boolean = false;

    constructor(objProps?:ObjectProps){
        super( null, objProps );
        this.objProps    = objProps || {} as ObjectProps;
        this.id          = (this.objProps.name||'imaginario') + String(new Date().getTime());
        this.name        = this.objProps.name || undefined;
        this.scene       = null;
        this.objEvents   = new ObjectEventLayer(this.objProps.events || []);

        // Uma camera não pode colidir nem receber colisão nem fisica
        this.objProps.havePhysics = false;
        this.objProps.collide = false;
        this.objProps.invisible = true;
    }

    setAsMain(): void
    {
        this.mainCamera = true;
    }

    isMainCamera(): boolean
    {
        return this.mainCamera;
    }

    getStatus(): boolean
    {
        return this.ativo;
    }

    setActivo(): void
    {
        this.ativo = true;
    }

    setDesativo(): void
    {
        this.ativo = false;
    }

    /**
    * Atualiza a camera dentro da cena 
    */
    updateCamera( firstRender: boolean, renderizadorPronto: boolean, frameDelta:number, frameNumber: number ): void
    {
        // atualiza o objeto base
        this.updateObject( firstRender, renderizadorPronto, frameDelta, frameNumber );
    }
}