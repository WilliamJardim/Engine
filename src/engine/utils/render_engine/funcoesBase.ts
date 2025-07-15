/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { Ponteiro } from "../../types/types-cpp-like";

export function criarGL( canvas:React.RefObject<HTMLCanvasElement>, version:string="auto" ): any
{
    let gl;
    let v = 'N';
    
    let elementoCanvas = canvas.current;
    if ( !elementoCanvas ) 
    {
        throw new Error("Canvas ainda é null.");
    }

    if( version != '1' && version != '2' && version != 'auto' )
    {
        throw Error("Versão invalida do WebGL!");
    }

    if( version == 'auto' )
    {
        // Tenta WebGL 2
        gl = elementoCanvas!.getContext('webgl2');

        if (gl) {
            console.log('WebGL 2 está disponível!');
            v = "2";

        } else {
            // Tenta WebGL 1
            gl = elementoCanvas!.getContext('webgl');

            if (gl) {
                console.log('WebGL 1 está disponível!');
                v = "1";

            } else {
                console.log('WebGL não está disponível neste navegador.');
                v = "N";
            }
        }

    }else{
        gl = elementoCanvas!.getContext('webgl' + (version == "1" ? '' : version) );
        v = version;
    }

    elementoCanvas!.width  = window.innerWidth;
    elementoCanvas!.height = window.innerHeight;
    
    return {
        gl      : gl as WebGL2RenderingContext,
        version : v  as string
    };
}

export function createShader(gl:WebGL2RenderingContext, type:GLenum, source:string) : WebGLShader 
{
    const shader:WebGLShader = gl.createShader(type)!; //forçei apenas pra nao dar erro
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if ( gl.getShaderParameter(shader, gl.COMPILE_STATUS) == null ) 
    {
        console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    return shader;
}

export function createBuffer(gl:WebGL2RenderingContext, data:Array<any>, target:GLenum, usage:GLenum) 
{
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, new (target === gl.ARRAY_BUFFER ? Float32Array : Uint16Array)(data), usage);
    return buffer;
}

export function createProgram(gl:WebGL2RenderingContext, vertexScript:string, fragmentScript:string) : WebGLProgram
{
    const vertexShader   = createShader(gl, gl.VERTEX_SHADER, vertexScript);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentScript);

    const program        = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(program));
    }

    return program;
}

export function carregarTextura(gl:WebGL2RenderingContext, urlTextura:string) 
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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    imagem.src = urlTextura;

    return textura;
}

// Função para carregar arquivos de texto (OBJ e MTL)
export async function carregarTxt(path:string) 
{
    const response = await fetch(path);
    return await response.text();
}

// Função para carregar imagens
export function carregarImagem(texturePath:string) 
{
    const img = new Image();
    img.src = `./textures/${texturePath.split('\\').pop()}`;
    return img;
}