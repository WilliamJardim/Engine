/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { criarGL }    from './cube/funcoesBase.js';
import { criarCubo }  from './cube/cube.js';
import { VisualMesh } from './cube/VisualMesh.js';

const canvas       = document.getElementById('glcanvas');
const canvasWidth  = window.innerWidth;
const canvasHeight = window.innerHeight;

const gl = criarGL( canvas );  

criarCubo( gl, canvasWidth, canvasHeight, 
    new VisualMesh({
        position: {
            x: 1,
            y: 0,
            z: -6
        },
        rotation: {
            x: 0.5,
            y: 18,
            z: 0
        }
    }) 
);