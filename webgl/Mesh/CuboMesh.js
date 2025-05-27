/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { VisualMesh } from "../Mesh/VisualMesh.js";
import { criarCubo } from "../utils/criarCubo.js";

export class CuboMesh extends VisualMesh
{
    constructor( renderer, propriedadesMesh )
    {
        super(renderer, 
              propriedadesMesh);

        // Usa o programa para desenhar cubos
        this.tipo = 'Cubo';
        this.setProgram( renderer.getCubeProgram() );
    }

    /**
    * @implements 
    * Converte a representação desse Mesh para desenhos com WebGL
    */
    desenhar()
    {
        // Cria um cubo com WebGL
        criarCubo( 
            this.getRenderer(), 
            this.getAtributos()
        ); 
    }
}