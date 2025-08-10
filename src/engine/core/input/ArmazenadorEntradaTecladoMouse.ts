/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import KeyDetection from "../../interfaces/both_engines/KeyDetection";
import Position2D   from "../../interfaces/main_engine/Position2D";

/**
* Armazena informações de teclado e mouse obtidas pela minha Engine
*/
export default class ArmazenadorEntradaTecladoMouse
{
    public mousePosition : Position2D;
    public keyDetection  : KeyDetection;

    constructor()
    {
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

        this.mousePosition = { 
                               x: 0, 
                               y: 0 
                             }; 
    }

    /**
    * Verifica se uma tecla está sendo precionada 
    */
    public isTeclando( keyName:string ): boolean
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