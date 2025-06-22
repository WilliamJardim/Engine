export const baseShaders = {
    // Vertex shader
    vertexScript: `
        attribute vec4 aPosicao;
        attribute vec4 aCor;
        attribute vec2 aUV;

        uniform mat4 uMatrixVisualizacao;
        uniform mat4 uModeloObjetoVisual;
        uniform float uTime;
        uniform bool uAplicarOndulacao;
        uniform bool uUsarOndulacaoSimples;

        varying lowp vec4 vColor;
        varying vec2 vUV;

        void main() 
        {
            //Extraindo apenas os tres componenentes: X,Y e Z
            vec3 pos = vec3( aPosicao ); 

            // Se usa ondulação
            if ( uAplicarOndulacao ) 
            {
                if( uUsarOndulacaoSimples ) {
                    // Aplica uma onda simples baseada na posição X e Z
                    pos.y += 0.5 * sin(5.0 * pos.x + uTime) * cos(5.0 * pos.z + uTime);

                }else{
                
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
            }

            gl_Position = uMatrixVisualizacao * uModeloObjetoVisual * vec4(pos, 1.0);
            vColor = aCor;
            vUV = aUV;
        }
    `,

    /**
    * Contem informações sobre as variaveis usadas no vertex 
    */
    vertexExtraInfo: {
        variavelPosicaoCubo: 'aPosicao', // Representa a posição do objeto na GPU do WebGL
        variavelCorCubo: 'aCor', // Representa a cor do objeto na GPU do WebGL
        variavelUV: 'aUV', 
        variavelUVFragment: 'vUV', 
        variavelMatrixVisualizacao: 'uMatrixVisualizacao', // Representa a matrix de visualização do renderizador na GPU do WebGL
        variavelModeloObjeto: 'uModeloObjetoVisual', // Representa a matrix do modelo do objeto na GPU do WebGL
        variavelCorFragment: 'vColor' // Representa a cor usada no fragment logo abaixo:
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

                // Aplica a opacidade
                corBase.a *= uOpacidade;
                
                gl_FragColor = corBase;
            
            // Se não tem textura, aplica apenas cor
            }else{
                // Aplica a opacidade
                corBase.a *= uOpacidade;

                gl_FragColor = corBase;
            }

            
            
            
        }
    `,

    /**
    * Contem informações sobre as variaveis usadas no fragment 
    */
    fragmentExtraInfo: {
        variavelCorFragment: 'vColor',
        variavelUVFragment: 'vUV',
        variavelSampler: 'uSampler',
        variavelUsarTextura: 'uUsarTextura'
    }
}