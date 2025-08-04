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
import Position2D from "../interfaces/main_engine/Position2D";
import Position3D from "../interfaces/main_engine/Position3D";
import ConfigCamera from "../interfaces/both_engines/CameraConfig";
import { float } from "../types/types-cpp-like";
import { calcularDirecaoCamera, calcularDireitaCamera } from "../utils/render_engine/math";

/**
* Criei a classe Camera, para armazenar informações sobre a posição, mira, e outras, como sensibilidade, limites, etc...
* Uma forma de abstrair a lógica da camera do meu renderizador para que fique mais modular, e permitir ter varias cameras 
*/

// EXEMPLO DE USO: 
/*
renderizador.criarCamera({ nome: "CameraJogador", miraCamera: {x:0, y:0, z:0}, posicaoCamera: {x:0,y:0,z:0}, sensibilidade: 0.05, limiteMiraCimaBaixo: 1.6183333333333352 }) ; renderizador.setCameraAtiva(0)
*/
export default class CameraRenderizador
{
    public nome                        : string;
    public miraCamera                  : Position3D;
    public posicaoCamera               : Position3D;
    public sensibilidade               : float;
    public limiteMiraCimaBaixo         : float;
    public passosAndar                 : float;

    public infoPosicaoMouse            : Position2D;
    public infoTeclasTeclado           : KeyDetection;

    constructor( cameraConfig:ConfigCamera )
    {
        /**
        * Configurações da camera 
        */

        this.nome = cameraConfig.nome;

        /**
        * Posição e mira 
        */
        this.miraCamera    = cameraConfig.miraCamera;
        this.posicaoCamera = cameraConfig.posicaoCamera;

        /**
        * Configurações de sensibilidade, limite de rotação, etc... 
        */
        this.sensibilidade         = cameraConfig.sensibilidade;
        this.limiteMiraCimaBaixo   = cameraConfig.limiteMiraCimaBaixo || 1.6183333333333352;
        this.passosAndar           = cameraConfig.passosAndar;

        /**
        * Configurações de movimentação da camera
        */
        this.infoPosicaoMouse = {
            x: 0,
            y: 0
        }
        this.infoTeclasTeclado = {
            SHIFT: false,
            A: false,
            W: false,
            S: false,
            D: false,
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false
        }
    }

    /**
    * Recebe do meu renderizador informações sobre o teclado e mouse 
    */
    public receberInformacoesTecladoMouse( infoPosicaoMouse:Position2D, infoTeclasTeclado: KeyDetection ): void
    {
        // Atualiza a posição do mouse
        this.infoPosicaoMouse.x = infoPosicaoMouse.x;
        this.infoPosicaoMouse.y = infoPosicaoMouse.y;

        // Atualiza as teclas do teclado
        this.infoTeclasTeclado.W = infoTeclasTeclado.W;
        this.infoTeclasTeclado.A = infoTeclasTeclado.A;
        this.infoTeclasTeclado.S = infoTeclasTeclado.S;
        this.infoTeclasTeclado.D = infoTeclasTeclado.D;
        this.infoTeclasTeclado.ArrowUp    = infoTeclasTeclado.ArrowUp;
        this.infoTeclasTeclado.ArrowDown  = infoTeclasTeclado.ArrowDown;
        this.infoTeclasTeclado.ArrowLeft  = infoTeclasTeclado.ArrowLeft;
        this.infoTeclasTeclado.ArrowRight = infoTeclasTeclado.ArrowRight;
        this.infoTeclasTeclado.SHIFT      = infoTeclasTeclado.SHIFT;
    }

    /**
    * NOTA, 04/08/2025 15:35 PM: As funções: onMoverMouse, onLimitarMiraCamera, onAndarCamera foram movidas para dentro do meu arquivo CameraInstance.ts da minha outra engine: a engine principal de logica 
    */

    /**
    * NOTA, 04/08/2025 16:37 PM: a função atualizarCamera foi removida.
    */
}