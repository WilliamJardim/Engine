/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { float } from "../../types/types-cpp-like";
import ObjectPosition from "./ObjectPosition";

export default interface LocalSoundProps
{
   audioPath     : string,            // The audio file path
   autoplay      : boolean,           // If the sound will start automatically
   startDelay    : float,             // How will await for play first time
   begin         : float,             // The secounds that will start(in the audio position)
   end           : float,             // The secounds that will end(in the audio position)
   isLooping     : boolean,           // If the sound will play forever
   position      : ObjectPosition,    // The position of the sound origin 
   reachrate     : float,             // How far the sounds will go from the origin position
   initialVolume : float,
   maxVolume     : float
}   