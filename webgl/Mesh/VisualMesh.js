/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export class VisualMesh
{
    constructor( renderer, meshConfig )
    {
        this.renderer   = renderer;
        this.meshConfig = meshConfig;

        this.programUsado = null; // Vai ser um ponteiro, eu vou definir em cada tipo de Mesh

        // Os shaders da renderização dele
        this.vertexScript   = '';
        
        this.fragmentScript = ''; 

        // Atributos visuais
        this.tipo     = meshConfig.tipo || 'Nenhum';
        this.position = meshConfig.position;
        this.rotation = meshConfig.rotation;
    }

    /**
    * Obtem a instancia do renderizador
    */
    getRenderer()
    {
        return this.renderer;
    }

    /**
    * Obtem os atributos desse objeto 
    */
    getAtributos()
    {
        return this.meshConfig;
    }

    /**
    * Função que desenha o objeto 
    * Se implementa ela em cada objeto
    */
    desenhar()
    {
        
    }

    // Muda o valor do ponteiro "this.programUsado"
    setProgram( programUsar )
    {
        this.programUsado = programUsar;
    }

    getProgram()
    {
        return this.programUsado;
    }

    getVertex()
    {
        return this.vertexScript;
    }

    getFragment()
    {
        return this.fragmentScript;
    }
}