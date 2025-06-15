import { GLShader } from './GLShader.js';

export class GLProgram {
    constructor(gl, vertexSource, fragmentSource) {
        const vertexShader = new GLShader(gl, gl.VERTEX_SHADER, vertexSource).shader;
        const fragmentShader = new GLShader(gl, gl.FRAGMENT_SHADER, fragmentSource).shader;

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(this.program));
        }
    }

    use(gl) {
        gl.useProgram(this.program);
    }
}