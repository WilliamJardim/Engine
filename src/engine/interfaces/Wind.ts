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

export default interface Wind{
    orientation       : ObjectPosition; // Orientação do vento
    deslocationTrend? : ObjectPosition; // Tendencia de deslocamento de objetos
    intensity?        : ObjectPosition; // Intensidade de ambos
}