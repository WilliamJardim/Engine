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
* Ele cria uma camera na posição do objeto, para criar as texturas a partir do ponto de vista do objeto
*/
export class ReflectionDrawer
{
    constructor( gl, renderizador, posicaoObjeto )
    {
        this.gl = gl;
        this.renderizador  = renderizador;
        this.posicaoObjeto = posicaoObjeto;

        this.alwaysReflection     = true;
        this._jaRefletiu          = false;

        this.texturaAtualReflexo  = null; // Ponteiro para a textura atual do reflexo

        // Parametros da visão do reflexo
        this.anguloVisaoY    = 60 * Math.PI / 180;
        this.aspectoCamera   = this.width / this.height;
        this.pPerto          = 0.1;
        this.pLonge          = 100;

        /**
        * Define o ponto de vista do objeto que vai ser usado para criar o reflexo
        * a posição dessa camera de reflexo é igual a posição do objeto
        */
        this.posicaoCamera      = [ posicaoObjeto.x, posicaoObjeto.y, posicaoObjeto.z ];
        this.sentidoCamera      = [0, 0.1, 0];
        this.miraCamera         = [-1, -5, -5];
    }   

    // Calcula a visão que o objeto tem do mundo ao seu redor 
    calculateObjectPerspective()
    {
        const frameDelta = this.renderizador.lastFrameDelta;

        // Cria a camera
        this.matrixCamera = CriarMatrixPerspectiva(this.anguloVisaoY, 
                                                   this.aspectoCamera, 
                                                   this.pPerto, 
                                                   this.pLonge);
        // Define o ponto de vista
        this.matrixPontoVista   = CriarMatrixPontoVista( frameDelta, "FPS", this.posicaoCamera, this.miraCamera, this.sentidoCamera );

        // Cria a visualização a partir do ponto de vista do objeto
        this.matrixVisualizacao = MultiplicarMatrix4x4( new Float32Array(16), this.matrixCamera, this.matrixPontoVista );
        
        return this.matrixVisualizacao;
    }

    // Gera a textura
    createTexture( larguraTextura, alturaTextura )
    {
        const renderizador  = this.renderizador;

        const xOrigem       = 0;
        const yOrigem       = 0;
        const largura       = renderizador.width;
        const altura        = renderizador.height;

        // 4 = RGBA (1 byte por cor). Deve ser Uint8Array(ou então Float32Array caso seja OpenGL moderno)
        const bufferImagem = new Uint8Array(largura * altura * 4); 

        gl.readPixels(
            xOrigem, 
            yOrigem,               
            
            // Altura e largura do canvas a ser lido
            largura, 
            altura,    
            
            gl.RGBA,            
            gl.UNSIGNED_BYTE,   
            bufferImagem      
        );

        // Cria a textura do reflexo
        const texturaReflexo = gl.createTexture();
    
        // Seleciona a textura pra inserir os pixels nela
        gl.bindTexture(gl.TEXTURE_2D, texturaReflexo);
        gl.texImage2D(
            gl.TEXTURE_2D,      
            0,                  
            gl.RGBA,            
            
            // Resolução da textura a ser criada
            larguraTextura, 
            alturaTextura,      
            
            0,                  
            gl.RGBA,            
            gl.UNSIGNED_BYTE,   
            bufferImagem        
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        return texturaReflexo;
    }

    // Desenha os reflexos
    drawRefractions()
    {
        const renderizador  = this.renderizador;

        // Muda pra um frame outscreen pra não causar sobreposição (invisivel ao jogador)   
        const frameBufferOffscreen = gl.createFramebuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferOffscreen);
        gl.viewport(0, 0, larguraTextura, alturaTextura);
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        /**
        * Desenha toda a cena novamente POREM DO PONTO DE VISTA DO OBJETO
        */

        const matrixPontoVistaObjeto = this.calculateObjectPerspective();

        // Define o ponto de vista para o renderizador
        //renderizador.setMatrixPontoVista( matrixPontoVistaObjeto );
        renderizador.desenharTudo();

        // Resolução da textura do reflexo a ser criada
        const larguraTexturaReflexo = 256;
        const alturaTexturaReflexo  = 256;

        // Cria a textura do reflexo e armazena dentro desse objeto
        this.texturaAtualReflexo = this.createTexture( larguraTexturaReflexo, alturaTexturaReflexo );

        // Volta para o contexto original (que será visivel ao jogador)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, renderizador.width, renderizador.height);

        // Restaura o ponto de vista original
        //renderizador.setMatrixPontoVistaOriginal();
    }

} 