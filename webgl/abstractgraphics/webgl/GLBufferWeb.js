export class GLBufferWeb {
    constructor(gl, data, type = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW) {
        this.buffer = gl.createBuffer();
        this.type = type;
        gl.bindBuffer(type, this.buffer);
        gl.bufferData(type, data, usage);
    }

    bind(gl) {
        gl.bindBuffer(this.type, this.buffer);
    }
}
/*
export class GLBufferWeb {
    constructor(gl, data, type) {
        this.buffer = gl.createBuffer();
        this.type = type;
        gl.bindBuffer(type, this.buffer);
        gl.bufferData(type, data, gl.STATIC_DRAW);
    }

    bindBuffer(gl) {
        gl.bindBuffer(this.type, this.buffer);
    }

    bufferData(gl, type, data, mode = gl.STATIC_DRAW){
        gl.bufferData(type, data, mode);
    }
}
*/