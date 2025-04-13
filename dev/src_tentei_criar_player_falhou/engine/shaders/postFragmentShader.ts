export default function postFragmentShader(): string
{
    return `
        precision mediump float;

        varying vec2 vUv;
        uniform sampler2D tDiffuse;

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);

            // Separação dos canais de cor para dar um efeito cinematográfico
            float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
            vec3 bloomColor = vec3(0.1, 0.3, 0.8) * pow(luminance, 0.45); // Azul brilhante

            // Mistura o bloom com a imagem original
            vec3 finalColor = mix(color.rgb, bloomColor, 0.4);

            // Aplicação de tom escuro cinematográfico
            finalColor = finalColor * vec3(0.8, 0.9, 1.2); // Azul sutil
            finalColor = mix(finalColor, vec3(0.0, 0.0, 0.2), 0.001); // Fundo mais escuro

            gl_FragColor = vec4(finalColor, color.a);
        }
    `;
}