export default function criarCubo(canvas) 
{
  const gl = canvas.getContext('webgl');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Vertex shader
  const vertexScript = `
    attribute vec4 aPosicao;
    attribute vec4 aCor;
    uniform mat4 uMatrixVisualizacao;
    uniform mat4 uModeloObjetoVisual;
    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uMatrixVisualizacao * uModeloObjetoVisual * aPosicao;
      vColor = aCor;
    }
  `;

  // Fragment shader
  const fragmentScript = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createBuffer(data, target, usage = gl.STATIC_DRAW) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, new (target === gl.ARRAY_BUFFER ? Float32Array : Uint16Array)(data), usage);
    return buffer;
  }

  function createProgram(gl, vertexScript, fragmentScript) 
  {
    const vertexShader   = createShader(gl, gl.VERTEX_SHADER, vertexScript);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentScript);

    // Se nao tem os shaders, retorna null
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(program));
      return;
    }

    return program;
  }

  const program = createProgram(gl, vertexScript, fragmentScript);
  if (!program) return;

  const informacoesPrograma = {
    program : program,
    
    atributosObjeto: {
      posicao   : gl.getAttribLocation(program, 'aPosicao'),
      cor       : gl.getAttribLocation(program, 'aCor'),
    },

    atributosVisualizacaoObjeto: {
      matrixVisualizacao : gl.getUniformLocation(program, 'uMatrixVisualizacao'),
      modeloObjetoVisual : gl.getUniformLocation(program, 'uModeloObjetoVisual'),
    },
  };

  const positions = [
    // Front
    -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,
    // Back
    -1, -1, -1,  -1,  1, -1,   1,  1, -1,   1, -1, -1,
    // Top
    -1,  1, -1,  -1,  1,  1,   1,  1,  1,   1,  1, -1,
    // Bottom
    -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,
    // Right
     1, -1, -1,   1,  1, -1,   1,  1,  1,   1, -1,  1,
    // Left
    -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1,
  ];

  const faceColors = [
    [1, 0, 0, 1],    // red
    [0, 1, 0, 1],    // green
    [0, 0, 1, 1],    // blue
    [1, 1, 0, 1],    // yellow
    [1, 0, 1, 1],    // magenta
    [0, 1, 1, 1],    // cyan
  ];

  let colors = [];
  for (const c of faceColors) {
    colors = colors.concat(c, c, c, c);
  }

  const indices = [
    0, 1, 2,    0, 2, 3,     // front
    4, 5, 6,    4, 6, 7,     // back
    8, 9,10,    8,10,11,     // top
   12,13,14,   12,14,15,     // bottom
   16,17,18,   16,18,19,     // right
   20,21,22,   20,22,23,     // left
  ];

  const positionBuffer = createBuffer(positions, gl.ARRAY_BUFFER);
  const colorBuffer    = createBuffer(colors, gl.ARRAY_BUFFER);
  const indexBuffer    = createBuffer(indices, gl.ELEMENT_ARRAY_BUFFER);

  // Cria matriz identidade 4x4
  function CriarMatrix4x4() 
  {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  // Multiplica matrizes 4x4
  function MultiplicarMatrix4x4(resultadoMultiplicacao, a, b) 
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
  * Cria matriz perspectiva 
  * @param {Number} anguloVisaoY - Em radianos
  * @param {Number} aspectoCamera - Aspecto da camera
  * @param {Number} perto - Valor perto
  * @param {Number} longe - Valor longe
  */
  function CriarMatrixPerspectiva(anguloVisaoY, aspectoCamera, perto, longe) 
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

  // Faz uma translação na matriz 4x4
  function DefinirTranslacao(matrixVisualizacao, vetorTranslacao) 
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

  // Rotaciona no eixo X na matriz 4x4
  function RotacionarX(matrixVisualizacao, rotacaoX) 
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
  function RotacionarY(matrixVisualizacao, rotacaoY)
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
  function RotacionarZ(matrixVisualizacao, rotacaoZ)
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

  // Define a posição no eixo X
  function DefinirX( matrixVisualizacao, vetorPosicaoAtual, novaPosicaoX ) 
  {
    // Mantem o que ja estava em Y e Z, só mudando o X
    let novaPosicao = { x: novaPosicaoX, 
                        y: vetorPosicaoAtual.y, 
                        z: vetorPosicaoAtual.z };

    DefinirTranslacao( matrixVisualizacao, novaPosicao );
  }

  // Define a posição no eixo Y
  function DefinirY( matrixVisualizacao, vetorPosicaoAtual, novaPosicaoY ) 
  {
    // Mantem o que ja estava em X e Z, só mudando o Y
    let novaPosicao = { x: vetorPosicaoAtual.x, 
                        y: novaPosicaoY, 
                        z: vetorPosicaoAtual.z };

    DefinirTranslacao( matrixVisualizacao, novaPosicao );
  }

  // Define a posição no eixo Z
  function DefinirZ( matrixVisualizacao, vetorPosicaoAtual, novaPosicaoZ ) 
  {
    // Mantem o que ja estava em Y e X, só mudando o Z
    let novaPosicao = { x: vetorPosicaoAtual.x, 
                        y: vetorPosicaoAtual.y, 
                        z: novaPosicaoZ };

    DefinirTranslacao( matrixVisualizacao, novaPosicao );
  }

  let rotation = {
    x: 0,
    y: 0,
    z: 0
  }

  function drawScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const anguloVisaoY  = 45 * Math.PI / 180;
    const aspectoCamera = canvas.width / canvas.height;
    const pPerto        = 0.1;
    const pLonge        = 100;

    // Cria uma matrix que vai ser usada pra projetar o cubo no espaço 3d
    const matrixVisualizacao = CriarMatrixPerspectiva(anguloVisaoY, aspectoCamera, pPerto, pLonge);

    // Cria uma matrix para a representação visual do objeto 3d
    let modeloObjetoVisual = CriarMatrix4x4();
    modeloObjetoVisual     = DefinirTranslacao(modeloObjetoVisual, [0, 0, -6]);
    modeloObjetoVisual     = RotacionarX(modeloObjetoVisual,  rotation.x);
    modeloObjetoVisual     = RotacionarY(modeloObjetoVisual,  rotation.y);
    modeloObjetoVisual     = RotacionarZ(modeloObjetoVisual,  rotation.z);

    // Atualiza os buffers do objeto 3d com os dados calculados
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.posicao, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.posicao);
    

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.cor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.cor);
    

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Usa o programa criado
    gl.useProgram(informacoesPrograma.program);
    // Usa as informações do cubo(que criamos e calculamos acima)
    gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.matrixVisualizacao, false, matrixVisualizacao);
    gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, modeloObjetoVisual);

    // Desenha o cubo
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  }

  // Fica desenhando o cubo na tela
  function render(now) {
    requestAnimationFrame(render);

    now *= 0.001;

    rotation.x -= 0.005;
    rotation.z -= 0.005;

    drawScene();
  }

  render(); 
}

