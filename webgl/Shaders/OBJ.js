export const OBJShaders = {
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
        variavelUV: 'aUV', // NOVO
        variavelMatrixVisualizacao: 'uMatrixVisualizacao',
        variavelModeloObjeto: 'uModeloObjetoVisual',
        variavelCorFragment: 'vColor',
        variavelUVFragment: 'vUV' // NOVO
    },

    // Fragment shader
    fragmentScript: `
        precision mediump float; 

        varying lowp vec4 vColor;
        varying vec2 vUV;

        uniform sampler2D uSampler;
        uniform bool uUsarTextura;

        void main(void) {
            if (uUsarTextura) {
                gl_FragColor = texture2D(uSampler, vUV);
            } else {
                gl_FragColor = vColor;
            }
        }
    `,

    /**
    * Contém informações sobre as variáveis usadas no fragment
    */
    fragmentExtraInfo: {
        variavelCorFragment: 'vColor',
        variavelUVFragment: 'vUV',
        variavelSampler: 'uSampler',
        variavelUsarTextura: 'uUsarTextura'
    }
}