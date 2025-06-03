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
import { Ponteiro } from "../types/types-cpp-like";
import ObjectBase from "./ObjectBase";
import Scene from "./Scene";

/**
* Objeto imaginário, usado somente como marcador, ou como parte da lógica da Engine ou do jogo
* Em tese, ele é um objeto, porém ele não tem malha carregada, apenas um objeto imaginario.
*/
export default class ImaginaryObject extends ObjectBase{

    public tipo      : string = 'ImaginaryObject';
    public name      : string;
    public objEvents : ObjectEventLayer;
    public id        : string;
    public objProps  : ObjectProps;
    public scene     : Ponteiro<Scene>;
    
    constructor(objProps:ObjectProps){
        super( null, objProps );
        this.objProps    = objProps || {};
        this.id          = (this.objProps.name||'imaginario') + String(new Date().getTime());
        this.name        = this.objProps.name;
        this.scene       = null;
        this.objEvents   = new ObjectEventLayer(this.objProps.events);

        //Objetos imaginarios não tem fisica
        this.objProps.havePhysics = false;
        this.physicsState.havePhysics = false;

        //Objetos imaginarios não causam colisão em outros objetos(mais isso não significa que eu não possa ter eventos de colisão ou proximidade mesmo sem colidir fisicamente)
        this.objProps.collide = false;
    }
}