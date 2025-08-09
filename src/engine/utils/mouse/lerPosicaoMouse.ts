/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export default function lerPosicaoMouse()
{
    // IDEIAS CASO EU VÁ MIGRAR ISSO PRA C++

    //ifdef _WIN32
        // implementação para windows

    //else
        // implementação para linux

    /**
    * POR ENQUANTO VOU SEGUIR UM UNICO FLUXO NO TYPESCRIPT:
    * mais seria completamente diferente em C++, de acordo se for Linux ou Windows
    * 
    * A IMPLANTAÇÂO ABAIXO VAI SER SOMENTE PRA TYPESCRIPT
    * Irei usar a variavel global "mousePosition_geral" que eu criei no RenderizadorCena.ts
    * Em C++ eu não iria fazer dessa forma, mais como to fazendo no javascript/typescript, estou fazendo de uma forma que vou conseguir criar uma código abstrato que fica visualmente semelhante ao que eu faria em C++
    * Pra portar pra C++ basta estudar como é, e tambem ignorar a parte do Javascript, pois só serve no navegador pra ele manter o estilo parecido com o estilo que eu faria no C++
    */

    // OBS: essa informação de mouse: "mousePosition_geral" ela vem do arquivo "src\engine\entrada-navegador.ts", que eu criei especificamente pra isso.

    return [ 
             window.mousePosition_geral.x, 
             window.mousePosition_geral.y
           ];
}