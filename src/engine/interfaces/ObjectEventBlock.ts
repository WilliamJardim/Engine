/**
* Um bloco de eventos, que permite ter várias intancias de ObjectEvents, 
* Permitindo agrupar vários eventos do mesmo tipo dentro do mesmo objeto.
* Ou seja, um mesmo objeto pode ter diferentes eventos de colisão por exemplo
*/
import ObjectEvents from "./ObjectEvents";

export default class ObjectEventLayer{
    private eventsArray:ObjectEvents[];

    constructor( eventsArray:ObjectEvents[] ){
        this.eventsArray = eventsArray || [];
    }

    public getEventos(){
        return this.eventsArray;
    }
}