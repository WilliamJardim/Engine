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

    constructor( cameraConfig:ConfigCamera )
    {
        /**
        * Configurações da camera 
        */

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
        this.sensibilidade = cameraConfig.sensibilidade;
        this.limiteMiraCimaBaixo   = cameraConfig.limiteMiraCimaBaixo || 1.6183333333333352;
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

    // Retorna as propriedades da camera que o meu renderizador vai precisar
    getPropriedadesCamera() : ConfigCamera
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