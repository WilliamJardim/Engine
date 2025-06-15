/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export function criarGL( canvas )
{
    const gl = canvas.getContext('webgl');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    return gl;
}

export function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function createBuffer(gl, data, target, usage) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, new (target === gl.ARRAY_BUFFER ? Float32Array : Uint16Array)(data), usage);
    return buffer;
}

export function createProgram(gl, vertexScript, fragmentScript) 
{
    const vertexShader   = createShader(gl, gl.VERTEX_SHADER, vertexScript);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentScript);

    // Se nao tem os shaders, retorna null
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(program));
        return;
    }

    return program;
}

export function carregarTextura(gl, urlTextura) 
{
    const textura = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textura);

    // Placeholder enquanto a imagem carrega
    const nivel   = 0;
    const interno = gl.RGBA;
    const largura = 1;
    const altura  = 1;
    const borda   = 0;
    const formato = gl.RGBA;
    const tipo    = gl.UNSIGNED_BYTE;
    const pixel   = new Uint8Array([255, 255, 255, 255]);
    
    gl.texImage2D(gl.TEXTURE_2D, nivel, interno, largura, altura, borda, formato, tipo, pixel);

    const imagem = new Image();
    imagem.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, textura);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagem);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    imagem.src = urlTextura;

    return textura;
}