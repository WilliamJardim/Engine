/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

/**
* Um bloco de eventos, que permite ter várias intancias de ObjectEvents, 
* Permitindo agrupar vários eventos do mesmo tipo dentro do mesmo objeto.
* Ou seja, um mesmo objeto pode ter diferentes eventos de colisão por exemplo
*/
import ObjectEvents from "./ObjectEvents";

export default class ObjectEventLayer{
    private eventsArray: Array<ObjectEvents>;

    constructor( eventsArray: Array<ObjectEvents> ){
        this.eventsArray = eventsArray;
    }

    public getEventos(){
        return this.eventsArray;
    }
}