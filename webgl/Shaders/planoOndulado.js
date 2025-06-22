export const planoOnduladoShaders = {
    // Vertex shader
    vertexScript: `
        attribute vec3 aPosicao;
        attribute vec4 aCor;
        uniform mat4 uModeloObjetoVisual;
        uniform mat4 uMatrixVisualizacao;
        uniform float uTime;
        varying vec4 vColor;

        void main() {
            vec3 pos = aPosicao;

            // Aplica uma onda simples baseada na posição X e Z
            pos.y += 0.5 * sin(5.0 * pos.x + uTime) * cos(5.0 * pos.z + uTime);

            gl_Position = uMatrixVisualizacao * uModeloObjetoVisual * vec4(pos, 1.0);
            vColor = aCor;
        }
    `,

    /**
    * Contem informações sobre as variaveis usadas no vertex 
    */
    vertexExtraInfo: {
        variavelPosicaoCubo: 'aPosicao', // Representa a posição do objeto na GPU do WebGL
        variavelCorCubo: 'aCor', // Representa a cor do objeto na GPU do WebGL
        variavelMatrixVisualizacao: 'uMatrixVisualizacao', // Representa a matrix de visualização do renderizador na GPU do WebGL
        variavelModeloObjeto: 'uModeloObjetoVisual', // Representa a matrix do modelo do objeto na GPU do WebGL
        variavelCorFragment: 'vColor' // Representa a cor usada no fragment logo abaixo:
    },

    // Fragment shader
    fragmentScript: `
        varying lowp vec4 vColor;

        void main(void) {
           gl_FragColor = vColor;
        }
    `,

    /**
    * Contem informações sobre as variaveis usadas no fragment 
    */
    fragmentExtraInfo: {
        variavelCorFragment: 'vColor'
    }
}