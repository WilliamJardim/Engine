export class GLShader {
    constructor(gl, type, source) {
        this.shader = gl.createShader(type);
        gl.shaderSource(this.shader, source);
        gl.compileShader(this.shader);

        if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(this.shader));
        }
    }
}