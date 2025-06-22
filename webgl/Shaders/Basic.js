export const basicShaders = {
    // Vertex shader
    vertexScript: `
        attribute vec3 aPosicao;
        attribute vec4 aCor;
        uniform mat4 uModeloObjetoVisual;
        uniform mat4 uMatrixVisualizacao;
        uniform float uTime;
        uniform bool uAplicarOndulacao;

        varying vec4 vColor;

        void main() {
            vec3 pos = aPosicao;

            // Se usa ondulação
            if ( uAplicarOndulacao ) 
            {
                //pos.y += 0.5 * sin(5.0 * pos.x + uTime) * cos(5.0 * pos.z + uTime);
                
                // Centraliza X e Z para gerar ondulação simétrica
                float freq = 5.0;
                float amp = 0.5;
                float x = pos.x;
                float z = pos.z;

                // Centralizando com base na largura/altura do plano (10x10)
                x -= 0.0;  // já centrado? senão tente x -= 5.0;
                z -= 0.0;  // idem

                float onda = sin(freq * x + uTime) * cos(freq * z + uTime);
                pos.y += onda * amp;
            }

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