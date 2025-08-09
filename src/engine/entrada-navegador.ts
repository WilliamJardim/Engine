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
* Script para capturar entrada de teclado e mouse em javascript no navegador
* OBS: Esse arquivo não deve ser portado para C++, visto que é um código que usa coisas que só existem no ambiente javascript.
* Esse script tem como objetivo abstrair códigos javascript para poder capturar a entrada do teclado e mouse, armazenando elas em variaveis globais, para então, eu poder usar isso em funções abstratas que fazem "leitura" do teclado e mouse.
* Escrevi "leitura" entre aspas por que quem vai ler de fato é esse script aqui, porém, as funções abstratas vão ser mais diretas e só vão ler as informações de teclado e mouse que esse script tornou disponivel para a engine. 
* Isso vai me permitir escrever códigos mais parecidos com a forma como eu escreveria em C++, facilitando a portabilidade de minhas funções, visto que não terei de me preocupar com detalhes de como essa captura de entrada é feita.  
*/

/**
* ESPECIFICO PARA O JAVSCRIPT( em C++ não iria precisar disso ):
* 
* Estou fazendo isso para ele capturar informações do teclado e armazenar globalmente,
* eu vou usar as informações do keyDetection_geral dentro de minhas funções abstratas da minha pasta utils, para acessar o teclado por meio disso
* PORÈM SIMULANDO UM ESTILO VISUAL QUE LEMBRA O ESTILO QUE EU FARIA EM C++, pra compatibilidade, pra mim sempre lembrar como eu faria em C++
*/
export default function injetarScriptCapurarEntradaNavegador()
{
    // CAPTURAR ENTRADA TECLADO
    window.keyDetection_geral  = { 
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

    window.onKeyDown_geral = (event: KeyboardEvent) => {
        
        if( window.keyDetection_geral != undefined )
        {
            if(event.code == "ArrowUp")
            {
                window.keyDetection_geral.ArrowUp = true;
            }

            if(event.code == "KeyW")
            {
                window.keyDetection_geral.W = true;
            }      

            if(event.code == "ArrowDown")
            {
                window.keyDetection_geral.ArrowDown = true;
            }

            if(event.code == "KeyS")
            {
                window.keyDetection_geral.S = true;
            }

            if(event.code == "ArrowLeft")
            {
                window.keyDetection_geral.ArrowLeft = true;
            }

            if(event.code == "KeyA")
            {
                window.keyDetection_geral.A = true;
            }

            if(event.code == "ArrowRight")
            {
                window.keyDetection_geral.ArrowRight = true;
            }

            if(event.code == "KeyD")
            {
                window.keyDetection_geral.D = true;
            }

            if( event.shiftKey == true ){
                window.keyDetection_geral.SHIFT = true;
            }
        }
        
    };

    window.onKeyUp_geral = (event: KeyboardEvent) => {

        if( window.keyDetection_geral != undefined )
        {
            if(event.code == "ArrowUp")
            {
                window.keyDetection_geral.ArrowUp = false;
            }

            if(event.code == "KeyW")
            {
                window.keyDetection_geral.W = false;
            }      

            if(event.code == "ArrowDown")
            {
                window.keyDetection_geral.ArrowDown = false;
            }

            if(event.code == "KeyS")
            {
                window.keyDetection_geral.S = false;
            }

            if(event.code == "ArrowLeft")
            {
                window.keyDetection_geral.ArrowLeft = false;
            }

            if(event.code == "KeyA")
            {
                window.keyDetection_geral.A = false;
            }

            if(event.code == "ArrowRight")
            {
                window.keyDetection_geral.ArrowRight = false;
            }

            if(event.code == "KeyD")
            {
                window.keyDetection_geral.D = false;
            }

            if( event.shiftKey == true ){
                window.keyDetection_geral.SHIFT = false;
            }

            // Mesmo que não seja o Shift, se eu soltar qualquer tecla, ele ja para de dar sinal de Shift, pra ajudar na minha de logica de correr com a camera
            if( event.shiftKey == false ){
                window.keyDetection_geral.SHIFT = false;
            }
        }
        
    };

    document.addEventListener("keydown", window.onKeyDown_geral);
    document.addEventListener("keyup",   window.onKeyUp_geral);

    // CAPTURAR ENTRADA MOUSE
    window.mousePosition_geral = { 
                             x: 0, 
                             y: 0 
                           };
                           
    // Atualiza a posição do mouse
    window.onMouseMove_geral = (event: MouseEvent) => {
        // Normaliza a posição do mouse para o intervalo de -1 a 1
        window.mousePosition_geral.x =  (event.clientX / window.innerWidth)  * 2 - 1;
        window.mousePosition_geral.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Adiciona o evento de movimento do mouse
    window.addEventListener("mousemove", window.onMouseMove_geral, false);
    

    // FIM DAS FUNÇÔES ESPECIFICAS DO JAVASCRIPT.
}