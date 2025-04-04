export default function postVertexShader(): string
{
    return `
        precision mediump float;

        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;
}