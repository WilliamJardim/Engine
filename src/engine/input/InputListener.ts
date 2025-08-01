/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import KeyDetection from "../interfaces/both_engines/KeyDetection";
import Position2D   from "../interfaces/main_engine/Position2D";

export default class InputListener
{
    public mousePosition : Position2D;
    public keyDetection  : KeyDetection;

    constructor(){
        const contexto = this;

        this.keyDetection  = { 
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

        this.mousePosition = { x: 0, y: 0 }; 
                    
        // Atualiza a posição do mouse
        function onMouseMove(event: MouseEvent) {
            // Normaliza a posição do mouse para o intervalo de -1 a 1
            contexto.mousePosition.x =  (event.clientX / window.innerWidth)  * 2 - 1;
            contexto.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    
        // Adiciona o evento de movimento do mouse
        window.addEventListener("mousemove", onMouseMove, false);

        const onKeyDown = (event: KeyboardEvent) => {
            
            if(event.code == "ArrowUp")
            {
                contexto.keyDetection.ArrowUp = true;
            }

            if(event.code == "KeyW")
            {
                contexto.keyDetection.W = true;
            }      
        
            if(event.code == "ArrowDown")
            {
                contexto.keyDetection.ArrowDown = true;
            }

            if(event.code == "KeyS")
            {
                contexto.keyDetection.S = true;
            }

            if(event.code == "ArrowLeft")
            {
                contexto.keyDetection.ArrowLeft = true;
            }

            if(event.code == "KeyA")
            {
                contexto.keyDetection.A = true;
            }

            if(event.code == "ArrowRight")
            {
                contexto.keyDetection.ArrowRight = true;
            }

            if(event.code == "KeyD")
            {
                contexto.keyDetection.D = true;
            }

            if( event.shiftKey == true ){
                contexto.keyDetection.SHIFT = true;
            }
            
        };
        
        const onKeyUp = (event: KeyboardEvent) => {
        
            if(event.code == "ArrowUp")
            {
                contexto.keyDetection.ArrowUp = false;
            }

            if(event.code == "KeyW")
            {
                contexto.keyDetection.W = false;
            }      
        
            if(event.code == "ArrowDown")
            {
                contexto.keyDetection.ArrowDown = false;
            }

            if(event.code == "KeyS")
            {
                contexto.keyDetection.S = false;
            }

            if(event.code == "ArrowLeft")
            {
                contexto.keyDetection.ArrowLeft = false;
            }

            if(event.code == "KeyA")
            {
                contexto.keyDetection.A = false;
            }

            if(event.code == "ArrowRight")
            {
                contexto.keyDetection.ArrowRight = false;
            }

            if(event.code == "KeyD")
            {
                contexto.keyDetection.D = false;
            }

            if( event.shiftKey == true ){
                contexto.keyDetection.SHIFT = false;
            }
            
        };
        
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup",   onKeyUp);
    }

    /**
    * Verifica se uma tecla está sendo precionada 
    */
    public isKey( keyName:string ): boolean
    {
        let isPrecionada:boolean = false;

        if( keyName == "W" )
        {
            isPrecionada = this.keyDetection.W == true;
        }

        if( keyName == "A" )
        {
            isPrecionada = this.keyDetection.A == true;
        }
            
        if( keyName == "S" )
        {
            isPrecionada = this.keyDetection.S == true;
        }
            
        if( keyName == "D" )
        {
            isPrecionada = this.keyDetection.D == true;
        }
            
        if( keyName == "ArrowUp" )
        {
            isPrecionada = this.keyDetection.ArrowUp == true;
        }
            
        if( keyName == "ArrowDown" )
        {
            isPrecionada = this.keyDetection.ArrowDown == true;
        }
            
        if( keyName == "ArrowLeft" )
        {
            isPrecionada = this.keyDetection.ArrowLeft == true;
        }

        if( keyName == "ArrowRight" )
        {
            isPrecionada = this.keyDetection.ArrowRight == true;
        }
        
        if( keyName == "SHIFT" ){
            isPrecionada = this.keyDetection.SHIFT == true;
        }

        return isPrecionada;
    }
}