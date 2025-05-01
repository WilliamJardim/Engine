export default interface InputKeyMap{
    //Aceita acessar indicies
    [key: string]: any;
    
    W: boolean,
    A: boolean,
    S: boolean,
    D: boolean,
    ArrowUp: boolean,
    ArrowDown: boolean,
    ArrowLeft: boolean,
    ArrowRight: boolean
}