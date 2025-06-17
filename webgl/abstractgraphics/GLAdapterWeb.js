export class GLAdapterWeb 
{
    constructor(gl) 
    {
        this.gl = gl;
    }

    createBuffer() {
        return this.gl.createBuffer();
    }

    bindBuffer(target, buffer) {
        this.gl.bindBuffer(target, buffer);
    }

    bufferData(target, data, usage) {
        this.gl.bufferData(target, data, usage);
    }

    createShader(type) {
        return this.gl.createShader(type);
    }

    shaderSource(shader, source) {
        this.gl.shaderSource(shader, source);
    }

    compileShader(shader) {
        this.gl.compileShader(shader);
    }

    getShaderParameter(shader, pname) {
        return this.gl.getShaderParameter(shader, pname);
    }

    getShaderInfoLog(shader) {
        return this.gl.getShaderInfoLog(shader);
    }

    // ... e assim por diante, com todos os comandos que quiser suportar
}