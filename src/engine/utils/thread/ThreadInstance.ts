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
* Feito para facilitar o meu entendimento sobre Threads 
*/
export default class ThreadInstance
{
    constructor( funcaoChamar:Function, contextoFuncao:any )
    {   
        funcaoChamar.bind(contextoFuncao)();
    }

    // Permite que a Thread rode em segundo plano
    detach()
    {
        // Não faço nada, apenas ilustrativo
    }

    // Não permite que outra Thread seja executa antes que essa termine
    join()
    {
        // Não faço nada, apenas ilustrativo
    }
}