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
import ConfigCamera from "../interfaces/render_engine/CameraConfig";
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


export default class Camera
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
        this.sensibilidade = cameraConfig.sensibilidade;
        this.limiteMiraCimaBaixo   = cameraConfig.limiteMiraX || 1.6183333333333352;
        this.passosAndar   = cameraConfig.passosAndar;

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
    receberInformacoesTecladoMouse( infoPosicaoMouse:Position2D, infoTeclasTeclado: KeyDetection ): void
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
    * Quando o jogador mover o mouse pra alguma direção, com o intuito de movimentar a direção da camera 
    */
    onMoverMouse(): void
    {
        // Detecta se virou pra esquerda ou direita, da origem
        const viradaEsquerdaOrigem : boolean  = this.miraCamera.x >= 1.4918051575931215  ? true : false;
        const viradaDireitaOrigem  : boolean  = this.miraCamera.y <= -1.4918051575931215 ? true : false;

        // OBS: ele ja tem as informações sobre a posição X e Y do mouse, pois nesse momento, ja recebeu pela chamada da função receberInformacoesTecladoMouse que é feita no meu renderizador

        // Atualiza a mira X e Y da camera
        this.miraCamera.x -= this.sensibilidade * this.infoPosicaoMouse.y;
        this.miraCamera.y += this.sensibilidade * this.infoPosicaoMouse.x;
    }

    /**
    * Limita a mira da camera 
    */
    onLimitarMiraCamera(): void
    {
        // Mantem a rotação Y da camera estavel( o X nesse caso representa o Y por que eu criei invertido na logica )
        if( this.miraCamera.x > this.limiteMiraCimaBaixo )
        {
            this.miraCamera.x = this.limiteMiraCimaBaixo;
        }
        if( this.miraCamera.x < -this.limiteMiraCimaBaixo )
        {
            this.miraCamera.x = -this.limiteMiraCimaBaixo;
        }
    }

    /**
    * Quando o jogador precionar as teclas do teclado, com o intuito de fazer a camera andar
    */
    onAndarCamera( frameDelta:float ): void
    {
        // Se está correndo
        if( this.infoTeclasTeclado.SHIFT == true )
        {
            this.passosAndar = 3.5;

        // Se está andando
        }else{
            this.passosAndar = 0.9;
        }
        
        // Calcula a direção da câmera com base na rotação
        const vetorMiraCamera: Array<float> = [
                                                this.miraCamera.x,  // X
                                                this.miraCamera.y,  // Y
                                                this.miraCamera.z   // Z
                                              ];

        const direcao : Array<float>   = calcularDirecaoCamera(vetorMiraCamera);

        // Calcula o vetor "direita" (eixo X local)
        const direita : Array<float>   = calcularDireitaCamera(direcao);

        // Aplica movimentação com base em eixos locais
        const velocidadeFinal : float  = this.passosAndar * frameDelta;

        if (this.infoTeclasTeclado.W == true) 
        {
            this.posicaoCamera.x += direcao[0] * velocidadeFinal;
            this.posicaoCamera.y += direcao[1] * velocidadeFinal;
            this.posicaoCamera.z += direcao[2] * velocidadeFinal;
        }
        if (this.infoTeclasTeclado.S == true) 
        {
            this.posicaoCamera.x -= direcao[0] * velocidadeFinal;
            this.posicaoCamera.y -= direcao[1] * velocidadeFinal;
            this.posicaoCamera.z -= direcao[2] * velocidadeFinal;
        }
        if (this.infoTeclasTeclado.A == true) 
        {
            this.posicaoCamera.x += direita[0] * velocidadeFinal;
            this.posicaoCamera.y += direita[1] * velocidadeFinal;
            this.posicaoCamera.z += direita[2] * velocidadeFinal;
        }
        if (this.infoTeclasTeclado.D == true) 
        {
            this.posicaoCamera.x -= direita[0] * velocidadeFinal;
            this.posicaoCamera.y -= direita[1] * velocidadeFinal;
            this.posicaoCamera.z -= direita[2] * velocidadeFinal;
        }
    }

    /**
    * Atualiza essa camera 
    */
    atualizarCamera( frameDelta:float )
    {
        /** 
        * Obtem as informações atualizadas sobre o mouse e o teclado, que a camera recebeu do meu renderizador, 
        * que por sua vez, recebeu da minha camada de entrada
        */

        // OBS: ele ja tem as informações sobre a posição X e Y do mouse, pois nesse momento, ja recebeu pela chamada da função receberInformacoesTecladoMouse que é feita no meu renderizador

        // Atualiza a posição da camera quando o jogador mover o mouse
        this.onMoverMouse();
        
        // Limita o mouse
        this.onLimitarMiraCamera();

        // Faz o movimento da camera, controlada pelo jogador
        this.onAndarCamera( frameDelta );

    }
}