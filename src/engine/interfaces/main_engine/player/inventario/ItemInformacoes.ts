/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { float, int } from "../../../../types/types-cpp-like";

export default interface ItemInformacoes
{
    nome       : string;
    quantidade : float;   // Ela pode ser numero inteiro ou decimal para liquidos tambem
    vidaUtil   : float;   // Ela pode ser numero inteiro ou decimal para liquidos tambem
    valor      : float;   // O item pode ser um valor de venda
    massa      : float;   // O item pode ser um massa que pode servir para "pesar" no jogador
    espaco     : float;   // O item pode ocupar mais espaço que outros no inventario
}