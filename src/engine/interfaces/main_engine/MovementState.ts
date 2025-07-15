/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import PhysicsState from "./PhysicsState"

export default interface MovementState
{
    forward   : boolean, 
    backward  : boolean, 
    left      : boolean, 
    right     : boolean,
    up        : boolean,
    down      : boolean,
    steps     : number,       //Número de passos que o objeto dá(o tento que ele vai andar por movimentação baisca, em qualquer eixo)
    isJumping : boolean,      // Controle se está pulando ou não
}