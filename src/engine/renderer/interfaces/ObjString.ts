/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export default interface ObjString{
    obj_string : string;
    mtl_string : string;
    foi_lido   : boolean;
    concluido  : boolean;
    carregando : boolean; // Se o OBJ já está sendo carregado por uma Thread
}