/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import {createShader, createBuffer, createProgram} from '../funcoesBase.js';

import {CriarMatrix4x4, 
        MultiplicarMatrix4x4, 
        CriarMatrixPerspectiva, 
        DefinirTranslacao, 
        RotacionarX, 
        RotacionarY, 
        RotacionarZ, 
        DefinirRotacao, 
        DefinirX, 
        DefinirY, 
        DefinirZ} from '../math.js';

export function criarCubo(gl, width, height, visualMesh) 
{
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

  const positionBuffer = createBuffer(gl, positions, gl.ARRAY_BUFFER,       gl.STATIC_DRAW);
  const colorBuffer    = createBuffer(gl, colors, gl.ARRAY_BUFFER,          gl.STATIC_DRAW);
  const indexBuffer    = createBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);

  const rotation = visualMesh.rotation;
  const position = visualMesh.position;

  function drawScene() {
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const anguloVisaoY  = 45 * Math.PI / 180;
    const aspectoCamera = width / height;
    const pPerto        = 0.1;
    const pLonge        = 100;

    // Cria uma matrix que vai ser usada pra projetar o cubo no espaço 3d
    const matrixVisualizacao = CriarMatrixPerspectiva(anguloVisaoY, aspectoCamera, pPerto, pLonge);

    // Cria uma matrix para a representação visual do objeto 3d
    let modeloObjetoVisual = CriarMatrix4x4();
    modeloObjetoVisual     = DefinirTranslacao(modeloObjetoVisual, [position.x, position.y, position.z]);
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

    drawScene();
  }

  render(); 
}

