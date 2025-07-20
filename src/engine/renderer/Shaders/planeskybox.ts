/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export const skyboxPlaneShaders = {
    // Vertex shader
    vertexScript: `
        attribute vec2 aPosicao;
        varying vec2 v_uv;

        void main() {
            v_uv = aPosicao * 0.5 + 0.5; // converte de [-1,1] para [0,1]
            gl_Position = vec4(aPosicao, 0.0, 1.0);
        }
    `,

    /**
    * Contem informações sobre as variaveis usadas no vertex 
    */
    vertexExtraInfo: {
        
    },

    // Fragment shader
    fragmentScript: `
        precision mediump float;

        varying vec2 v_uv;
        uniform sampler2D uTextura;

        void main() {
            gl_FragColor = texture2D(uTextura, v_uv);
        }
    `,

    /**
    * Contem informações sobre as variaveis usadas no fragment 
    */
    fragmentExtraInfo: {
        
    }
}