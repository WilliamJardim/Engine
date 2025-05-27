export const cuboShaders = {
    // Vertex shader
    vertexScript: `
        attribute vec4 aPosicao;
        attribute vec4 aCor;
        uniform mat4 uMatrixVisualizacao;
        uniform mat4 uModeloObjetoVisual;
        varying lowp vec4 vColor;

        void main(void) {
        gl_Position = uMatrixVisualizacao * uModeloObjetoVisual * aPosicao;
        vColor = aCor;
        }
    `,

    // Fragment shader
    fragmentScript: `
        varying lowp vec4 vColor;

        void main(void) {
        gl_FragColor = vColor;
        }
    `
}