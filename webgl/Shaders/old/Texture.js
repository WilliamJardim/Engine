/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export const textureShaders = {
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
        variavelUV: 'aUV', 
        variavelMatrixVisualizacao: 'uMatrixVisualizacao',
        variavelModeloObjeto: 'uModeloObjetoVisual',
        variavelCorFragment: 'vColor',
        variavelUVFragment: 'vUV' 
    },

    // Fragment shader
    fragmentScript: `
        precision mediump float;

        varying lowp vec4 vColor;
        varying vec2 vUV;

        uniform sampler2D uSampler;  
        uniform bool uUsarTextura;
        uniform float uOpacidade;

        void main(void) 
        {
            vec4 corBase = vColor;
            
            // Se tem textura
            if ( uUsarTextura ) 
            {
                corBase *= texture2D(uSampler, vUV);
            }
            
            // Aplica a opacidade
            corBase.a *= uOpacidade;
            
            gl_FragColor = corBase;
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