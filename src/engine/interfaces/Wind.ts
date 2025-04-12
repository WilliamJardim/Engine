import ObjectPosition from "./ObjectPosition";

export default interface Wind{
    orientation       : ObjectPosition; // Orientação do vento
    deslocationTrend? : ObjectPosition; // Tendencia de deslocamento de objetos
    intensity?        : ObjectPosition; // Intensidade de ambos
}