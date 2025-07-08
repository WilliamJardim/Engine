/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

/**
* Representa o reflexo do mundo do ponto de vista de um unico objeto 
*/
export class RefractionDrawer
{
    constructor( gl, renderizador, posicaoObjeto )
    {
        this.gl = gl;
        this.renderizador  = renderizador;
        this.posicaoObjeto = posicaoObjeto;

        this.alwaysRefraction = true;
        this._jaRefletiu      = false;
    }   

    // Calcula a visão que o objeto tem do mundo ao seu redor 
    calculateObjectPerspective()
    {
        
    }

    // Gera as texturas
    createTextures()
    {

    }

    // Desenha os reflexos
    drawRefractions()
    {

    }

} 