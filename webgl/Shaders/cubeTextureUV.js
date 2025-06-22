export const cuboTextureUVShaders = {
    // Vertex shader
    vertexScript: `
        attribute vec4 aPosicao;
        attribute vec4 aCor;
        attribute vec2 aUV;
        uniform mat4 uMatrixVisualizacao;
        uniform mat4 uModeloObjetoVisual;
        varying lowp vec4 vColor;
        varying vec2 vUV;

        void main(void) {
            gl_Position = uMatrixVisualizacao * uModeloObjetoVisual * aPosicao;
            vColor = aCor;
            vUV = aUV;
        }
    `,

    /**
    * Contém informações sobre as variáveis usadas no vertex
    */
    vertexExtraInfo: {
        variavelPosicaoCubo: 'aPosicao',
        variavelCorCubo: 'aCor',
        variavelMatrixVisualizacao: 'uMatrixVisualizacao',
        variavelModeloObjeto: 'uModeloObjetoVisual',
        variavelCorFragment: 'vColor'
    },

    // Fragment shader
    fragmentScript: `
        precision mediump float;

        varying lowp vec4 vColor;
        varying vec2 vUV;

        uniform sampler2D u_textura;

        void main(void) {
            vec4 texColor = texture2D(u_textura, vUV);
            gl_FragColor = texColor * vColor;
        }
    `,

    fragmentExtraInfo: {
        variavelCorFragment: 'vColor'
    }
};
