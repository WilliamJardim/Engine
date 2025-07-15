/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import InputListener from "../../input/InputListener";

export default interface SceneConfig
{
    inputListener                  : InputListener;
    haveWind                       : boolean;
    enable_advanced_frame_tracking : boolean, //Se ativado, vai capturar os dados do objeto a cada frame. Por padrão é ativado
}