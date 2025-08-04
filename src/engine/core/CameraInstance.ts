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
import { float, int } from "../types/types-cpp-like";
import { calcularDirecaoCamera, calcularDireitaCamera } from "../utils/render_engine/math";

export default class CameraInstance
{
    public nome                        : string;
    public id                          : string;
    public miraCamera                  : Position3D;
    public posicaoCamera               : Position3D;
    public sensibilidade               : float;
    public limiteMiraCimaBaixo         : float;
    public passosAndar                 : float;

    public infoPosicaoMouse            : Position2D;
    public infoTeclasTeclado           : KeyDetection;

    public LimiteFPS                   : int; // Vai receber do Scene.ts, apenas pra consulta

    constructor( cameraConfig:ConfigCamera )
    {
        /**
        * Configurações da camera 
        */

        this.LimiteFPS = 0; // Vai receber do Scene.ts, apenas pra consulta

        this.nome = cameraConfig.nome;
        this.id   = (this.nome) + String(new Date().getTime());

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
    * Quando o jogador mover o mouse pra alguma direção, com o intuito de movimentar a direção da camera 
    */
    public onMoverMouse(): void
    {
        // Detecta se virou pra esquerda ou direita, da origem
        const viradaEsquerdaOrigem : boolean  = this.miraCamera.x >= 1.4918051575931215  ? true : false;
        const viradaDireitaOrigem  : boolean  = this.miraCamera.y <= -1.4918051575931215 ? true : false;

        // OBS: ele ja tem as informações sobre a posição X e Y do mouse, pois nesse momento, ja recebeu pela chamada da função receberInformacoesTecladoMouse que é feita no meu renderizador
        
        // OBS: Pra evitar problemas com camera muito rapida, eu reduzo a sensibilidade de acordo com o FPS
        let amortecedorSensibilidadeMouse = 1;

        if( this.LimiteFPS < 16 )
        {
            amortecedorSensibilidadeMouse = 0.13 * this.LimiteFPS;
        }

        if( this.LimiteFPS >= 16 && this.LimiteFPS < 40 )
        {
            amortecedorSensibilidadeMouse = 0.05 * this.LimiteFPS;
        }

        if( this.LimiteFPS >= 40 && this.LimiteFPS <= 100 )
        { 
            amortecedorSensibilidadeMouse = 0.016 * this.LimiteFPS; // Baseado na diferença da sensibilidade que eu usava antes pra agora vezes o FPS atual
        
        }else if( this.LimiteFPS > 100 && this.LimiteFPS <= 120 ){
            amortecedorSensibilidadeMouse = 0.007 * this.LimiteFPS;

        }else if( this.LimiteFPS > 120 ){
            amortecedorSensibilidadeMouse = 0.003 * this.LimiteFPS;
        }

        // Atualiza a mira X e Y da camera
        this.miraCamera.x -= (this.sensibilidade * amortecedorSensibilidadeMouse) * this.infoPosicaoMouse.y;
        this.miraCamera.y += (this.sensibilidade * amortecedorSensibilidadeMouse) * this.infoPosicaoMouse.x;
    }

    /**
    * Limita a mira da camera 
    */
    public onLimitarMiraCamera(): void
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
    public onAndarCamera( frameDelta:float ): void
    {
        // Se está correndo
        if( this.infoTeclasTeclado.SHIFT == true )
        {
            this.passosAndar = 60.5;

        // Se está andando
        }else{
            this.passosAndar = 15.9;
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
    public atualizarCamera( frameDelta:float )
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

    // Retorna as propriedades da camera que o meu renderizador vai precisar
    public getPropriedadesCamera() : ConfigCamera
    {
        const nomeCamera          : string        = this.nome;
        const idCamera            : string        = this.id;
        const miraCamera          : Position3D    = this.miraCamera;
        const posicaoCamera       : Position3D    = this.posicaoCamera;
        const sensibilidade       : float         = this.sensibilidade;
        const limiteMiraCimaBaixo : float         = this.limiteMiraCimaBaixo;
        const passosAndar         : float         = this.passosAndar;

        return {
            nome                 : nomeCamera,
            miraCamera           : miraCamera,
            posicaoCamera        : posicaoCamera,
            sensibilidade        : sensibilidade,
            limiteMiraCimaBaixo  : limiteMiraCimaBaixo,
            passosAndar          : passosAndar
        }
    }
}