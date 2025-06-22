/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export const baseShaders = {
    // Vertex shader
    vertexScript: `
        attribute vec4 aPosicao;
        attribute vec4 aCor;
        attribute vec2 aUV;
        attribute vec3 aNormal;

        uniform mat4 uMatrixVisualizacao;
        uniform mat4 uModeloObjetoVisual;
        uniform float uTime;
        uniform bool uAplicarOndulacao;
        uniform bool uUsarOndulacaoSimples;

        varying lowp vec4 vColor;
        varying vec2 vUV;
        varying vec3 vNormal;
        varying vec3 vFragPos;

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

            // transformar normal
            vNormal = mat3(uModeloObjetoVisual) * aNormal; 

            vColor = aCor;
            vUV = aUV;
            vFragPos = pos;
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

        #define QUANTIDADE_LUZES 4

        uniform vec3 uPosicaoLuz[QUANTIDADE_LUZES];
        uniform vec3 uCorLuz[QUANTIDADE_LUZES];
        uniform vec3 uPosicaoVisualizacao;

        varying vec3 vNormal;
        varying vec3 vFragPos;

        void main(void) 
        {
            vec3 norm = normalize(vNormal);
            vec3 direcaoVisualizacao = normalize(uPosicaoVisualizacao - vFragPos);

            vec3 luminanciaObjeto = vec3(0.0);

            // ----- Blinn-Phong -----
            float brilho = 32.0;
            float intensidadeAmbient = 0.1;
            float intensidadeDiffuse = 0.8;
            float intensidadeSpecular = 0.6;

            for (int i = 0; i < QUANTIDADE_LUZES; i++) 
            {
                vec3 direcaoLuz = normalize(uPosicaoLuz[i] - vFragPos);
                vec3 metadeDirecao = normalize(direcaoLuz + direcaoVisualizacao);

                // COEFICIENTES:

                // Diffuse
                float diff = max(dot(norm, direcaoLuz), 0.0);

                // Specular
                float spec = pow(max(dot(norm, metadeDirecao), 0.0), brilho);

                // Soma de tudo isso pra calcular a luminancia do objeto
                vec3 ambient = intensidadeAmbient * vColor.rgb;
                vec3 diffuse = intensidadeDiffuse * diff * vColor.rgb;
                vec3 specular = intensidadeSpecular * spec * uCorLuz[i]; // branco

                // Define a luminancia do objeto
                luminanciaObjeto += (ambient + diffuse + specular);
            }

            vec4 corBase = vColor;
            
            // Se tem textura
            if ( uUsarTextura ) 
            {
                // Aplica a luz
                corBase = vec4(luminanciaObjeto, corBase.a);

                // Aplica a textura por cima
                corBase *= texture2D(uSampler, vUV);

                // Aplica a opacidade
                corBase.a *= uOpacidade;
                 
                // Aplica isso
                gl_FragColor = corBase;
            
            // Se não tem textura, aplica apenas cor
            }else{
                // Aplica a luz
                corBase = vec4(luminanciaObjeto, corBase.a);

                // Aplica a opacidade
                corBase.a *= uOpacidade;

                // Aplica isso
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