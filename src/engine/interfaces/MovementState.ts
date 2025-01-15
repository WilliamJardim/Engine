export default interface MovementState{
    forward: boolean, 
    backward: boolean, 
    left: boolean, 
    right: boolean,

    //Movimento diagonal
    diagonal?: MovementState
}