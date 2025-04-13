export default interface ObjectPosition{
    //Aceita acessar indicies
    [key: string]: any;
    
    x?: number,
    y?: number,
    z?: number
}