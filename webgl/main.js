/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { VisualMesh } from './Mesh/VisualMesh.js';
import { Renderer }   from './Renderer/Renderer.js';

const canvas       = document.getElementById('glcanvas'); 
const renderizador = new Renderer( canvas );

// Inicia o loop de renderização
renderizador.inicializar();

// Cria um cubo
renderizador.criarObjeto({
    tipo: 'Cubo',
    invisivel: false,
    transparencia: 0.5, // 100 opaco

    /**
    * Posição do objeto 
    */
    position: {
        x: 1,
        y: 0,
        z: -6
    },

    /**
    * Escala do objeto 
    */
    scale: {
        x: 1,
        y: 1,
        z: 2
    },

    /**
    * Rotação do objeto 
    */
    rotation: {
        x: 0.5,
        y: 18,
        z: 0
    }
});

window.renderizador = renderizador;