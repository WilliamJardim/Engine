/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

// Cria matriz identidade 4x4
export function CriarMatrix4x4() 
{
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

// Multiplica matrizes 4x4
export function MultiplicarMatrix4x4(resultadoMultiplicacao, a, b) 
{
    const a00 = a[0],  a01 = a[1],  a02 = a[2],  a03 = a[3];
    const a10 = a[4],  a11 = a[5],  a12 = a[6],  a13 = a[7];
    const a20 = a[8],  a21 = a[9],  a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    const b00 = b[0],  b01 = b[1],  b02 = b[2],  b03 = b[3];
    const b10 = b[4],  b11 = b[5],  b12 = b[6],  b13 = b[7];
    const b20 = b[8],  b21 = b[9],  b22 = b[10], b23 = b[11];
    const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

    resultadoMultiplicacao[0]  = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
    resultadoMultiplicacao[1]  = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
    resultadoMultiplicacao[2]  = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
    resultadoMultiplicacao[3]  = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;

    resultadoMultiplicacao[4]  = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
    resultadoMultiplicacao[5]  = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
    resultadoMultiplicacao[6]  = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
    resultadoMultiplicacao[7]  = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;

    resultadoMultiplicacao[8]  = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
    resultadoMultiplicacao[9]  = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
    resultadoMultiplicacao[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
    resultadoMultiplicacao[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;

    resultadoMultiplicacao[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
    resultadoMultiplicacao[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
    resultadoMultiplicacao[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
    resultadoMultiplicacao[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

    return resultadoMultiplicacao;
}

/**
* Cria matriz perspectiva(simula o olho humano, os objetos mais longes ficam menores)
* @param {Number} anguloVisaoY - Em radianos
* @param {Number} aspectoCamera - Aspecto da camera
* @param {Number} perto - Valor perto
* @param {Number} longe - Valor longe
*/
export function CriarMatrixPerspectiva(anguloVisaoY, aspectoCamera, perto, longe) 
{
    const fatorEscalaVertical = 1.0 / Math.tan(anguloVisaoY / 2);
    const diferencaPertoLonge = 1 / (perto - longe);
    const matrixVisualizacao  = CriarMatrix4x4();

    matrixVisualizacao[0]  = fatorEscalaVertical / aspectoCamera;
    matrixVisualizacao[5]  = fatorEscalaVertical;
    matrixVisualizacao[10] = (longe + perto) * diferencaPertoLonge;
    matrixVisualizacao[11] = -1;
    matrixVisualizacao[14] = (2 * longe * perto) * diferencaPertoLonge;
    matrixVisualizacao[15] = 0;

    return matrixVisualizacao;
}

/**
* Cria matriz ortográfica(sem profundidade), dando um efeito isométrico
*/
export function CriarMatrixOrtografica(ladoEsquerdo, ladoDireito, baixo, cima, perto, longe) 
{
    const diferencaCimaBaixo   = cima - baixo;
    const diferencaLongePerto  = longe - perto;
    const direitaMaisEsquerda  = ladoDireito + ladoEsquerdo;
    const direitaMenosEsquerda = ladoDireito - ladoEsquerdo;
    const cimaMaisBaixo        = cima + baixo;
    const longeMaisPerto       = longe + perto;

    return [
        2 / (direitaMenosEsquerda), 0, 0, 0,
        0, 2 / diferencaCimaBaixo,  0, 0,
        0, 0, -2 / diferencaLongePerto, 0,

        -(direitaMaisEsquerda) / (direitaMenosEsquerda),
        -(cimaMaisBaixo)       / diferencaCimaBaixo,
        -(longeMaisPerto)      / diferencaLongePerto,
        1
        
    ];
}

/**
* Cria uma matrix que vai representar o ponto de vista da camera
* Nesse caso, uma que aponta para um objeto, fazendo a camera orbitar ao redor dele
* Permitindo assim mover a camera para outro local na cena 
*/
export function CriarMatrixLookAt(olhoJogador, focoCamera, sentidoCamera) 
{
    // eixoZ = normaliza(olhoJogador - focoCamera)
    const diferencaFocoX   = olhoJogador[0] - focoCamera[0];
    const diferencaFocoY   = olhoJogador[1] - focoCamera[1];
    const diferencaFocoZ   = olhoJogador[2] - focoCamera[2];
    const tamanhoZ         = Math.sqrt( diferencaFocoX * diferencaFocoX + diferencaFocoY * diferencaFocoY + diferencaFocoZ * diferencaFocoZ);

    const eixoZ     = [ diferencaFocoX / tamanhoZ, 
                        diferencaFocoY / tamanhoZ, 
                        diferencaFocoZ / tamanhoZ ];

    // eixoX = normalizar( ProdutoVetorial(sentidoCamera, eixoZ) )
    const cruzamentoSentidoX  = sentidoCamera[1] * eixoZ[2] - sentidoCamera[2] * eixoZ[1];
    const cruzamentoSentidoY  = sentidoCamera[2] * eixoZ[0] - sentidoCamera[0] * eixoZ[2];
    const cruzamentoSentidoZ  = sentidoCamera[0] * eixoZ[1] - sentidoCamera[1] * eixoZ[0];
    const comprimentoX        = Math.sqrt(cruzamentoSentidoX * cruzamentoSentidoX + cruzamentoSentidoY * cruzamentoSentidoY + cruzamentoSentidoZ * cruzamentoSentidoZ);

    const eixoX     = [ cruzamentoSentidoX / comprimentoX, 
                        cruzamentoSentidoY / comprimentoX, 
                        cruzamentoSentidoZ / comprimentoX ];

    // eixoY = Produto vetorial entre Z e X
    const cruzamentoX    = eixoZ[1] * eixoX[2] - eixoZ[2] * eixoX[1];
    const cruzamentoY    = eixoZ[2] * eixoX[0] - eixoZ[0] * eixoX[2];
    const cruzamentoZ    = eixoZ[0] * eixoX[1] - eixoZ[1] * eixoX[0];
    const eixoY          = [cruzamentoX, cruzamentoY, cruzamentoZ];

    // Produto escalar para movimentação
    const movimentoX = -(eixoX[0] * olhoJogador[0] + eixoX[1] * olhoJogador[1] + eixoX[2] * olhoJogador[2]);
    const movimentoY = -(eixoY[0] * olhoJogador[0] + eixoY[1] * olhoJogador[1] + eixoY[2] * olhoJogador[2]);
    const movimentoZ = -(eixoZ[0] * olhoJogador[0] + eixoZ[1] * olhoJogador[1] + eixoZ[2] * olhoJogador[2]);

    return [
        eixoX[0],    eixoY[0],    eixoZ[0],    0,
        eixoX[1],    eixoY[1],    eixoZ[1],    0,
        eixoX[2],    eixoY[2],    eixoZ[2],    0,
        movimentoX,  movimentoY,  movimentoZ,  1
    ];
}

/**
* Cria uma matrix que vai representar o ponto de vista da camera
* Nesse caso, uma livre, que não fica restrita a orbitar em volta de um objeto, mais que pode se definir manualmente a rotação XYZ
* Permitindo assim mover a camera para outro local na cena 
*/
export function CriarMatrixFPSLivre(rotacaoAtual, posicaoAtual, sentidoAtual)
{
    const matrixRotacaoXYZ = CriarMatrixRotacaoCameraXYZ( 0, rotacaoAtual[1], rotacaoAtual[2] ); // Mexe apenas no Y e Z, que nesse caso foi o que deu certo

    const movimentoX = posicaoAtual[0]; 
    const movimentoY = posicaoAtual[1];
    const movimentoZ = posicaoAtual[2];

    const matrixMovimentacaoXYZ = [
        1,            0,          0,           0,
        0,            1,          0,           0,
        0,            0,          1,           0,
        -movimentoX, -movimentoY, -movimentoZ, 1
    ];

    return MultiplicarMatrix4x4(new Float32Array(16), matrixRotacaoXYZ, matrixMovimentacaoXYZ);
}   

/**
* Cria o ponto de vista desejado para a camera: FPS ou Orbital
*/
export function CriarMatrixPontoVista( tipo = "FPS", posicaoCamera, rotacaoCamera, sentidoCamera )
{
    if( tipo == "FPS" ){
        return CriarMatrixFPSLivre(rotacaoCamera, posicaoCamera, sentidoCamera);

    }else if( tipo == "Orbital" ){
        // Nesse caso, a rotacaoCamera vai ser o foco da camera(para qual ponto ela sempre vai orbitar) 
        return CriarMatrixLookAt(posicaoCamera, rotacaoCamera, sentidoCamera);
    }

    return null;
}

// Cria uma matriz de rotação de camera em X para girar ao redor do eixo X
export function CriarMatrixRotacaoCameraX(angulo) 
{
    const cosseno = Math.cos(angulo);
    const seno    = Math.sin(angulo);
    
    return [
        1,  0,       0,       0,
        0,  cosseno, -seno,   0,
        0,  seno,    cosseno, 0,
        0,  0,       0,       1
    ];
}

// Cria uma matriz de rotação de camera em Y para girar ao redor do eixo Y
export function CriarMatrixRotacaoCameraY(angulo) 
{
    const cosseno = Math.cos(angulo);
    const seno    = Math.sin(angulo);
    
    return [
        cosseno, 0,  seno,     0,
        0,       1,  0,        0,
        -seno,   0,  cosseno,  0,
        0,       0,  0,        1
    ];
}

// Cria uma matriz de rotação de camera em Z para girar ao redor do eixo Z
export function CriarMatrixRotacaoCameraZ(angulo) 
{
    const cosseno = Math.cos(angulo);
    const seno    = Math.sin(angulo);
    
    return [
        cosseno, -seno,   0,  0,
        seno,    cosseno, 0,  0,
        0,       0,       1,  0,
        0,       0,       0,  1
    ];
}

// Cria uma matriz de rotação de camera em XYZ
export function CriarMatrixRotacaoCameraXYZ(rotacaoX, rotacaoY, rotacaoZ) 
{
    const matrixRotacaoX = CriarMatrixRotacaoCameraX(rotacaoX);
    const matrixRotacaoY = CriarMatrixRotacaoCameraY(rotacaoY);
    const matrixRotacaoZ = CriarMatrixRotacaoCameraZ(rotacaoZ);

    return MultiplicarMatrix4x4(new Float32Array(16), MultiplicarMatrix4x4(new Float32Array(16), matrixRotacaoZ, matrixRotacaoY), matrixRotacaoX);
}



// Faz uma translação na matriz 4x4
export function DefinirTranslacao(matrixVisualizacao, vetorTranslacao) 
{
    const posicaoX = vetorTranslacao[0]; 
    const posicaoY = vetorTranslacao[1];
    const posicaoZ = vetorTranslacao[2];
    const matrixIdentidade = CriarMatrix4x4();

    matrixIdentidade[12] = posicaoX;
    matrixIdentidade[13] = posicaoY;
    matrixIdentidade[14] = posicaoZ;

    return MultiplicarMatrix4x4(new Float32Array(16), matrixVisualizacao, matrixIdentidade);
}

// Define a escala nos eixos X, Y e Z na matriz 4x4
export function DefinirEscala(matrixVisualizacao, escalaDesejada) 
{
    const escalaX = escalaDesejada[0];
    const escalaY = escalaDesejada[1];
    const escalaZ = escalaDesejada[2];

    const escalaMatrix = [
        escalaX, 0,       0,       0,
        0,       escalaY, 0,       0,
        0,       0,       escalaZ, 0,
        0,       0,       0,       1,
    ];

    return MultiplicarMatrix4x4(new Float32Array(16), matrixVisualizacao, escalaMatrix);
}

// Rotaciona no eixo X na matriz 4x4
export function RotacionarX(matrixVisualizacao, rotacaoX) 
{
    const cossenoRotacaoX  = Math.cos(rotacaoX);
    const senoRotacaoX     = Math.sin(rotacaoX);
    const matrixIdentidade = CriarMatrix4x4();

    matrixIdentidade[5]  = cossenoRotacaoX;
    matrixIdentidade[6]  = senoRotacaoX;
    matrixIdentidade[9]  = -senoRotacaoX;
    matrixIdentidade[10] = cossenoRotacaoX;

    return MultiplicarMatrix4x4(new Float32Array(16), matrixVisualizacao, matrixIdentidade);
}

// Rotaciona no eixo Y na matriz 4x4
export function RotacionarY(matrixVisualizacao, rotacaoY)
{
    const cossenoRotacaoY  = Math.cos(rotacaoY);
    const senoRotacaoY     = Math.sin(rotacaoY);
    const matrixIdentidade = CriarMatrix4x4();

    matrixIdentidade[0]  = cossenoRotacaoY;
    matrixIdentidade[2]  = -senoRotacaoY;
    matrixIdentidade[8]  = senoRotacaoY;
    matrixIdentidade[10] = cossenoRotacaoY;

    return MultiplicarMatrix4x4(new Float32Array(16), matrixVisualizacao, matrixIdentidade);
}

// Rotaciona no eixo Z na matriz 4x4
export function RotacionarZ(matrixVisualizacao, rotacaoZ)
{
    const cossenoRotacaoZ  = Math.cos(rotacaoZ);
    const senoRotacaoZ     = Math.sin(rotacaoZ);
    const matrixIdentidade = CriarMatrix4x4();

    matrixIdentidade[0]  = cossenoRotacaoZ;
    matrixIdentidade[1]  = senoRotacaoZ;
    matrixIdentidade[4]  = -senoRotacaoZ;
    matrixIdentidade[5]  = cossenoRotacaoZ;

    return MultiplicarMatrix4x4(new Float32Array(16), matrixVisualizacao, matrixIdentidade);
}

// Define a rotação XYZ
export function DefinirRotacao(matrixVisualizacao, vetorRotacao)
{
    let novaMatrix = [... matrixVisualizacao]; 
    novaMatrix     = RotacionarX( matrixVisualizacao,  vetorRotacao[0] );
    novaMatrix     = RotacionarY( matrixVisualizacao,  vetorRotacao[1] );
    novaMatrix     = RotacionarZ( matrixVisualizacao,  vetorRotacao[2] );

    return novaMatrix;
}

// Define a posição no eixo X
export function DefinirX( matrixVisualizacao, vetorPosicaoAtual, novaPosicaoX ) 
{
    // Mantem o que ja estava em Y e Z, só mudando o X
    const novoX = novaPosicaoX;
    const novoY = vetorPosicaoAtual[1];
    const novoZ = vetorPosicaoAtual[2];

    DefinirTranslacao( matrixVisualizacao, [novoX, novoY, novoZ] );
}

// Define a posição no eixo Y
export function DefinirY( matrixVisualizacao, vetorPosicaoAtual, novaPosicaoY ) 
{
    // Mantem o que ja estava em X e Z, só mudando o Y
    const novoX = vetorPosicaoAtual[0];
    const novoY = novaPosicaoY;
    const novoZ = vetorPosicaoAtual[2];

    DefinirTranslacao( matrixVisualizacao, [novoX, novoY, novoZ] );
}

// Define a posição no eixo Z
export function DefinirZ( matrixVisualizacao, vetorPosicaoAtual, novaPosicaoZ ) 
{
    // Mantem o que ja estava em Y e X, só mudando o Z
    const novoX = vetorPosicaoAtual[0];
    const novoY = vetorPosicaoAtual[1];
    const novoZ = novaPosicaoZ;

    DefinirTranslacao( matrixVisualizacao, [novoX, novoY, novoZ] );
}