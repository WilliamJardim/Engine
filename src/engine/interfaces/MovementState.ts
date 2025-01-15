export default interface MovementState{
    forward: boolean, 
    backward: boolean, 
    left: boolean, 
    right: boolean,

    isJumping?: boolean,      // Controle se está pulando ou não
    jumpStrength?: number,    // Força inicial do pulo
    jumpVelocityY?: number,   // Velocidade vertical (Y)
    jumpCooldown?: boolean,   // Evitar pular várias vezes rapidamente

    //Movimento diagonal
    diagonal?: MovementState
}