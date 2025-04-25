import PhysicsState from "./PhysicsState"

export default interface MovementState{
    forward: boolean, 
    backward: boolean, 
    left: boolean, 
    right: boolean,
    up?:boolean,
    down?:boolean,
    steps?: number; //Número de passos que o objeto dá(o tento que ele vai andar por movimentação baisca, em qualquer eixo)

    isJumping?: boolean,      // Controle se está pulando ou não
    stopJumpStartFallAgain?: boolean,
    jumpStrength?: number,    // Força inicial do pulo
    jumpVelocityY?: number,   // Velocidade vertical (Y)
    jumpCooldown?: boolean,   // Evitar pular várias vezes rapidamente

    physics?: PhysicsState,
}