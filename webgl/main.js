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
const renderizador = new Renderer( canvas, "perspectiva" );

// Inicia o loop de renderização
renderizador.inicializar();

// Cria um cubo
renderizador.criarObjeto({
    tipo: 'Cubo',
    invisivel: false,
    transparencia: 100, // 100 opaco

    /**
    * Posição do objeto 
    */
    position: {
        x: 0,
        y: 8,
        z: 0
    },

    /**
    * Escala do objeto 
    */
    scale: {
        x: 1,
        y: 1,
        z: 1
    },

    /**
    * Rotação do objeto 
    */
    rotation: {
        x: 0,
        y: 0,
        z: 0
    }
});

renderizador.criarObjeto({
    tipo: 'Cubo',
    invisivel: false,
    transparencia: 100, // 100 opaco

    /**
    * Posição do objeto 
    */
    position: {
        x: 0,
        y: -3,
        z: 0
    },

    /**
    * Escala do objeto 
    */
    scale: {
        x: 1,
        y: 1,
        z: 1
    },

    /**
    * Rotação do objeto 
    */
    rotation: {
        x: 0,
        y: 0,
        z: 0
    }
});

renderizador.criarObjeto({
    tipo: 'Cubo',
    invisivel: false,
    transparencia: 100, // 100 opaco

    /**
    * Posição do objeto 
    */
    position: {
        x: 0,
        y: -8,
        z: 0
    },

    /**
    * Escala do objeto 
    */
    scale: {
        x: 5,
        y: 0.2,
        z: 5
    },

    /**
    * Rotação do objeto 
    */
    rotation: {
        x: 0,
        y: 0,
        z: 0
    }
});

window.renderizador = renderizador;

const sensibilidade = 0.01;
const limiteX       = 10; 
const limiteY       = 10; 
const passos        = 0.5;

const contexto = {
    mousePosition: {
        x: 0,
        y: 0
    },
    keyDetection: {

    }
}

renderizador.miraCamera[0] = 0;
renderizador.miraCamera[1] = 0;
renderizador.miraCamera[2] = 0;

// Atualiza a posição do mouse
function onMouseMove(event) 
{
    // Normaliza a posição do mouse para o intervalo de -1 a 1
    contexto.mousePosition.x =  (event.clientX / window.innerWidth)  * 2 - 1;
    contexto.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Atualiza a camera
    renderizador.miraCamera[0] += sensibilidade * contexto.mousePosition.y;
    renderizador.miraCamera[1] -= sensibilidade * contexto.mousePosition.x;
    
    //if( renderizador.miraCamera[0] > limiteX * Math.sign(renderizador.miraCamera[0]) )
    //{
    //    renderizador.miraCamera[0] = limiteX * Math.sign(renderizador.miraCamera[0]);
    //}

    //renderizador.miraCamera[1] += sensibilidade * contexto.mousePosition.y;
    //if( renderizador.miraCamera[2] > limiteY * Math.sign(renderizador.miraCamera[2]) )
    //{
    //    renderizador.miraCamera[2] = limiteY * Math.sign(renderizador.miraCamera[2]);
    //}
}

// Adiciona o evento de movimento do mouse
window.addEventListener('mousemove', onMouseMove, false);

function onAndar()
{
    // ANDAR 
    if( contexto.keyDetection.W ){
        renderizador.posicaoCamera[2] -= passos;
    }
    if( contexto.keyDetection.A ){
        renderizador.posicaoCamera[0] -= passos;
    }
    if( contexto.keyDetection.D ){
        renderizador.posicaoCamera[0] += passos;
    }
    if( contexto.keyDetection.S ){
        renderizador.posicaoCamera[2] += passos;
    }
}

const onKeyDown = (event) => {
            
    switch (event.code) {
        case 'ArrowUp':
            contexto.keyDetection.ArrowUp = true;
            break;
        case 'KeyW':
            contexto.keyDetection.W = true;
            break;
        case 'ArrowDown':
            contexto.keyDetection.ArrowDown = true;
            break;
        case 'KeyS':
            contexto.keyDetection.S = true;
            break;
        case 'ArrowLeft':
            contexto.keyDetection.ArrowLeft = true;
            break;
        case 'KeyA':
            contexto.keyDetection.A = true;
            break;
        case 'ArrowRight':
            contexto.keyDetection.ArrowRight = true;
            break;
        case 'KeyD':
            contexto.keyDetection.D = true;
            break;
    }

    onAndar();
};

const onKeyUp = (event) => {

    switch (event.code) {
        case 'ArrowUp':
            contexto.keyDetection.ArrowUp = false;
            break;
        case 'KeyW':
            contexto.keyDetection.W = false;
            break;
        case 'ArrowDown':
            contexto.keyDetection.ArrowDown = false;
            break;
        case 'KeyS':
            contexto.keyDetection.S = false;
            break;
        case 'ArrowLeft':
            contexto.keyDetection.ArrowLeft = false;
            break;
        case 'KeyA':
            contexto.keyDetection.A = false;
            break;
        case 'ArrowRight':
            contexto.keyDetection.ArrowRight = false;
            break;
        case 'KeyD':
            contexto.keyDetection.D = false;
            break;
    }

    onAndar();
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup',   onKeyUp);

function loopTeste(){
    requestAnimationFrame(loopTeste)

    //renderizador.getObjetos()[2].rotation.x+= 0.01;
}
loopTeste();
