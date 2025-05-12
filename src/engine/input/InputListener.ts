/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import InputKeyMap from "../interfaces/InputKeyMap";
import Position2D from "../interfaces/Position2D";

export default class InputListener{
    public mousePosition:Position2D;
    public keyDetection:InputKeyMap;

    constructor(){
        const contexto = this;

        this.keyDetection  = {}             as InputKeyMap;
        this.mousePosition = { x: 0, y: 0 } as Position2D; 
                    
        // Atualiza a posição do mouse
        function onMouseMove(event: MouseEvent) {
            // Normaliza a posição do mouse para o intervalo de -1 a 1
            contexto.mousePosition.x =  (event.clientX / window.innerWidth)  * 2 - 1;
            contexto.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    
        // Adiciona o evento de movimento do mouse
        window.addEventListener('mousemove', onMouseMove, false);

        const onKeyDown = (event: KeyboardEvent) => {
            
            switch (event.code) {
                case 'ArrowUp':
                    contexto.keyDetection.ArrowUp = true;
                    break;
                case 'KeyW':
                    contexto.keyDetection.W = true;
                    break;
                case 'ArrowDown':
                    contexto.keyDetection.ArrowDown = true;
                    break;
                case 'KeyS':
                    contexto.keyDetection.S = true;
                    break;
                case 'ArrowLeft':
                    contexto.keyDetection.ArrowLeft = true;
                    break;
                case 'KeyA':
                    contexto.keyDetection.A = true;
                    break;
                case 'ArrowRight':
                    contexto.keyDetection.ArrowRight = true;
                    break;
                case 'KeyD':
                    contexto.keyDetection.D = true;
                    break;
            }
        };
        
        const onKeyUp = (event: KeyboardEvent) => {
        
            switch (event.code) {
                case 'ArrowUp':
                    contexto.keyDetection.ArrowUp = false;
                    break;
                case 'KeyW':
                    contexto.keyDetection.W = false;
                    break;
                case 'ArrowDown':
                    contexto.keyDetection.ArrowDown = false;
                    break;
                case 'KeyS':
                    contexto.keyDetection.S = false;
                    break;
                case 'ArrowLeft':
                    contexto.keyDetection.ArrowLeft = false;
                    break;
                case 'KeyA':
                    contexto.keyDetection.A = false;
                    break;
                case 'ArrowRight':
                    contexto.keyDetection.ArrowRight = false;
                    break;
                case 'KeyD':
                    contexto.keyDetection.D = false;
                    break;
            }
        };
        
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup',   onKeyUp);
    }

    /**
    * Verifica se uma tecla está sendo precionada 
    */
    public isKey( keyName:string ): boolean{
        return this.keyDetection[ keyName ] === true ? true : false;
    }
}