/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { criarGL }   from './funcoesBase.js';
import { criarCubo } from './cube.js';

const canvas       = document.getElementById('glcanvas');
const canvasWidth  = canvas.width;
const canvasHeight = canvas.height;

const gl = criarGL( canvas );  

criarCubo( gl, canvasWidth, canvasHeight );