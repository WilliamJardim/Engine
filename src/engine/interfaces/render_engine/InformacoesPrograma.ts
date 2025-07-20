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

export default interface InformacoesPrograma 
{
    atributosObjeto: {
        posicao    : GLint;     // A variavel que armazena a posicao do objeto na renderização WebGL na GPU
        cor        : GLint;     // A variavel que armazena a cor do objeto na renderização WebGL na GPU
        uv         : GLint;     // A variavel que armazena a UV do objeto na renderização WebGL na GPU

        // Iluminação
        brilho         : Ponteiro<WebGLUniformLocation>;
        ambient        : Ponteiro<WebGLUniformLocation>;
        diffuse        : Ponteiro<WebGLUniformLocation>;
        specular       : Ponteiro<WebGLUniformLocation>;
        corLuz         : Ponteiro<WebGLUniformLocation>;
        intensidadeLuz : Ponteiro<WebGLUniformLocation>;
    };
    
    atributosVisualizacaoObjeto: {
        matrixVisualizacao : Ponteiro<WebGLUniformLocation>; // A variavel que armazena a matrix de visualização do renderizador na renderização WebGL na GPU
        modeloObjetoVisual : Ponteiro<WebGLUniformLocation>; // A variavel que armazena a matrix do modelo do objeto na renderização WebGL na GPU
    };

    uniformsCustomizados: {
        usarTextura: Ponteiro<WebGLUniformLocation>;
        opacidade  : Ponteiro<WebGLUniformLocation>;
        textura    : Ponteiro<WebGLUniformLocation>;
    };
}