/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectPosition from "./ObjectPosition";

export default interface LocalSoundProps
{
   audioPath: string         // The audio file path
   position: ObjectPosition, // The position of the sound origin 
   reachrate: 10,            // How far the sounds will go from the origin position
   initialVolume: 0.1,
   maxVolume: 1
}   