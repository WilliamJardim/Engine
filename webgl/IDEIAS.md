Criar movimento de camera que leva em conta a rotação da camera

Corrigir o bug da rotação


CALCULAR POSIÇÂO DA CAMERA EM RELAÇÂO A ROTAÇÂO:
(AINDA NÂO TERMINADO)

    let passosCamera = 0.5;
    let passosLateralCamera = 0.5;
    let posicaoAtualRelacaoDirecao = [0, 0, 0];

    // Calcula o movimento de andar pra frente/traz
    const direcaoFrente = calcularDirecaoCamera(rotacaoCamera);
    
    // Calcula o movimento de andar na lateral
    const direcaoDireita = calcularDireitaCamera(rotacaoCamera);
    
    // Ajusta a posição da camera de acordo com a rotação da camera, no sentido frente/traz
    posicaoAtualRelacaoDirecao[0] = posicaoCamera[0] + direcaoFrente[0] * passosCamera * frameDelta;
    posicaoAtualRelacaoDirecao[1] = posicaoCamera[1] + direcaoFrente[1] * passosCamera * frameDelta;
    posicaoAtualRelacaoDirecao[2] = posicaoCamera[2] + direcaoFrente[2] * passosCamera * frameDelta;

    // Ajusta a posição da camera de acordo com a rotação da camera, no sentido lateral
    posicaoAtualRelacaoDirecao[0] = posicaoCamera[0] + direcaoDireita[0] * passosLateralCamera * frameDelta;
    posicaoAtualRelacaoDirecao[2] = posicaoCamera[2] + direcaoDireita[2] * passosLateralCamera * frameDelta;

OUTRA IDEIA DISSO:

function onAndar()
{
    let frameDelta = renderizador.lastFrameDelta;
    let posicaoAtualRelacaoDirecao = [0, 0, 0];

    // Calcula o movimento de andar pra frente/traz
    const direcaoFrente = calcularDirecaoCamera(renderizador.miraCamera);
    
    // Calcula o movimento de andar na lateral
    const direcaoDireita = calcularDireitaCamera(renderizador.miraCamera);
    
    // Ajusta a posição da camera de acordo com a rotação da camera, no sentido frente/traz
    posicaoAtualRelacaoDirecao[0] = renderizador.posicaoCamera[0] + direcaoFrente[0] * passos * frameDelta;
    posicaoAtualRelacaoDirecao[1] = renderizador.posicaoCamera[1] + direcaoFrente[1] * passos * frameDelta;
    posicaoAtualRelacaoDirecao[2] = renderizador.posicaoCamera[2] + direcaoFrente[2] * passos * frameDelta;

    // Ajusta a posição da camera de acordo com a rotação da camera, no sentido lateral
    posicaoAtualRelacaoDirecao[0] = renderizador.posicaoCamera[0] + direcaoDireita[0] * passos * frameDelta;
    posicaoAtualRelacaoDirecao[2] = renderizador.posicaoCamera[2] + direcaoDireita[2] * passos * frameDelta;


    // ANDAR 
    if( contexto.keyDetection.W ){
        renderizador.posicaoCamera[2] -= posicaoAtualRelacaoDirecao[2];
    }
    if( contexto.keyDetection.A ){
        renderizador.posicaoCamera[0] -= posicaoAtualRelacaoDirecao[0];
    }
    if( contexto.keyDetection.D ){
        renderizador.posicaoCamera[0] += posicaoAtualRelacaoDirecao[0];
    }
    if( contexto.keyDetection.S ){
        renderizador.posicaoCamera[2] += posicaoAtualRelacaoDirecao[2];
    }
    if( contexto.keyDetection.ArrowUp ){
        renderizador.posicaoCamera[1] += posicaoAtualRelacaoDirecao[1];
    }
    if( contexto.keyDetection.ArrowDown ){
        renderizador.posicaoCamera[1] -= posicaoAtualRelacaoDirecao[1];
    }
}

AO RODAR: renderizador.getObjetos()[1].elevarPico(0.5, 2.0, 10.8, 5.3); no PlanoOndular, dá pra criar uma "tenda" para um jogo de sobrevivencia



# TODO LIST 23/06/2025
LUZ:
Adicionar cor de luz, cor de luz na iluminação ambiente do Renderizador, e dos objetos. E cor de luz na iluminação das partes individuais do OBJ 

OBJ:
adicionar controle visual por material individual, exemplo:
Iluminação, brilho, visibilidade(visível ou não), o que vai permitir afetar vários objetos de uma só vez dentro de um modelo OBj.

PATCHs
Criar sistema de PATCHs que permite substituir ou modificar, adicionar objetos de um OBJ, como se fosse um arquivo OBJ a parte que serve apenas pra complementar e modificar o primeiro.

CONTROLE DAS PARTES OBJ
para cada parte individual do OBJ, poder alterar posição, rotação e escala, também visibilidade

Adicionar intensidade da luz de volta


SISTEMA DE ILUMINAÇÂO:
Criar um sistema de iluminação interna da Engine, que chama setIluminacaoTotal ou o setIluminacaoParte em cada parte do objeto, 
Com o intuito de aplicar iluminação gradual e local nas regiões onde tiver pontos de iluminação. Vai simular de forma crua luzes com diferentes cores, intensidades, e alcances. Calculando a distância de cada objeto com os pontos de iluminação


EDITOR DE OBJETOS DA ENGINE
Criar um sistema que permite exportar o OBJ carregado de volta para um novo OBJ, por que aí abre portas pra eu começar a criar meu editor de mapas e objetos embutido


01/07/2025
Aplicar a iluminação tambem nas partes individuais dos OBJ 
pra isso ver os vertices na região da luz, para poder identificar os nomes das partes, para poder aplicar iluminação

05/07/2025
Documentar melhor o verticesObjetosOnlyNomeParte, e outros, pra ficar bem claro

Tambem, padronizar melhor os {} pra ser Map:

    materiais
    objetos
    objetosInfo
    verticesObjetos
    verticesObjetosOnlyNomeParte
    verticesComecaObjetos
    iluminationInfo
    iluminationAcumuladaInfo


