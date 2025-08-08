import KeyDetection from "../../interfaces/both_engines/KeyDetection";
import { char } from "../../types/types-cpp-like";

/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export default function lerTeclaPrecionada( nomeTecla:char ): boolean
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
    * Irei usar a variavel global "keyDetection_geral" que eu criei no RenderizadorCena.ts
    * Em C++ eu não iria fazer dessa forma, mais como to fazendo no javascript/typescript, estou fazendo de uma forma que vou conseguir criar uma código abstrato que fica visualmente semelhante ao que eu faria em C++
    * Pra portar pra C++ basta estudar como é, e tambem ignorar a parte do Javascript, pois só serve no navegador pra ele manter o estilo parecido com o estilo que eu faria no C++
    */

    let isPrecionandoTecla : boolean = false;

    if( window.keyDetection_geral != undefined )
    {
        if( nomeTecla == "w" )
        {
            isPrecionandoTecla = window.keyDetection_geral.W == true;
        }

        if( nomeTecla == "a" )
        {
            isPrecionandoTecla =  window.keyDetection_geral.A == true;
        }

        if( nomeTecla == "s" )
        {
            isPrecionandoTecla =  window.keyDetection_geral.S == true;
        }

        if( nomeTecla == "d" )
        {
            isPrecionandoTecla =  window.keyDetection_geral.D == true;
        }
    }

    return isPrecionandoTecla;

    /*
    const keyDetection_interno : KeyDetection = { 
                                                    SHIFT      : false,
                                                    W          : false,
                                                    A          : false,
                                                    S          : false,
                                                    D          : false,
                                                    ArrowUp    : false,
                                                    ArrowDown  : false,
                                                    ArrowLeft  : false,
                                                    ArrowRight : false 
                                                };

    const onKeyDown = function (event: KeyboardEvent){
    
        if(event.code == "ArrowUp")
        {
            keyDetection_interno.ArrowUp = true;
        }

        if(event.code == "KeyW")
        {
            keyDetection_interno.W = true;
        }      

        if(event.code == "ArrowDown")
        {
            keyDetection_interno.ArrowDown = true;
        }

        if(event.code == "KeyS")
        {
            keyDetection_interno.S = true;
        }

        if(event.code == "ArrowLeft")
        {
            keyDetection_interno.ArrowLeft = true;
        }

        if(event.code == "KeyA")
        {
            keyDetection_interno.A = true;
        }

        if(event.code == "ArrowRight")
        {
            keyDetection_interno.ArrowRight = true;
        }

        if(event.code == "KeyD")
        {
            keyDetection_interno.D = true;
        }

        if( event.shiftKey == true ){
            keyDetection_interno.SHIFT = true;
        }
        
    };

    const onKeyUp = function(event: KeyboardEvent) {

        if(event.code == "ArrowUp")
        {
            keyDetection_interno.ArrowUp = false;
        }

        if(event.code == "KeyW")
        {
            keyDetection_interno.W = false;
        }      

        if(event.code == "ArrowDown")
        {
            keyDetection_interno.ArrowDown = false;
        }

        if(event.code == "KeyS")
        {
            keyDetection_interno.S = false;
        }

        if(event.code == "ArrowLeft")
        {
            keyDetection_interno.ArrowLeft = false;
        }

        if(event.code == "KeyA")
        {
           keyDetection_interno.A = false;
        }

        if(event.code == "ArrowRight")
        {
            keyDetection_interno.ArrowRight = false;
        }

        if(event.code == "KeyD")
        {
            keyDetection_interno.D = false;
        }

        if( event.shiftKey == true ){
            keyDetection_interno.SHIFT = false;
        }

        // Mesmo que não seja o Shift, se eu soltar qualquer tecla, ele ja para de dar sinal de Shift, pra ajudar na minha de logica de correr com a camera
        if( event.shiftKey == false ){
            keyDetection_interno.SHIFT = false;
        }
        
    };

    // Remove o evento de keydown anterior
    document.removeEventListener("keydown", onKeyDown);
    // Cria um novo evento de keydown
    document.addEventListener("keydown", onKeyDown);

    // Remove o evento de keyup anterior
    document.removeEventListener("keyup", onKeyUp);
    // Cria um novo evento de keyup
    document.addEventListener("keyup",   onKeyUp);
    */

}   