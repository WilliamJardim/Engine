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
import { carregarTextura, carregarTxt } from './utils/funcoesBase.js';
import {calcularDirecaoCamera, calcularDireitaCamera} from './utils/math.js';

const canvas       = document.getElementById('glcanvas'); 
const renderizador = new Renderer( canvas, "perspectiva" );

// Inicia o loop de renderização
renderizador.inicializar();

// Cria um cubo
renderizador.criarObjeto({
    tipo: 'Cubo',
    nome: 'Cubo',
    invisivel: false,
    transparencia: 0.5, // 100 opaco

    // Iluminação
    alwaysUpdateLights: true,
    brilho: 32,
    ambient: 0.6,
    diffuse: 0.8,
    specular: 0.8,

    childrenIndividualLights: true,
    useAccumulatedLights: true,
    staticAccumulatedLights: false,

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

// Cria um plano que pode se deformar
renderizador.criarObjeto({
    tipo: 'CuboDeformavel',
    nome: 'CuboDeformavel',
    invisivel: false,
    transparencia: 0.5, // 100 opaco

    childrenIndividualLights: true,
    useAccumulatedLights: true,
    staticAccumulatedLights: false,

    /**
    * Posição do objeto 
    */
    position: {
        x: -25,
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

// Cria um plano que pode se deformar
renderizador.criarObjeto({
    tipo: 'PlanoOndulado',
    nome: 'PlanoOndulado',
    invisivel: false,
    usarOndulacao: true,
    usarOndulacaoSimples: true,
    transparencia: 0.999, // Para o plano, por algum motivo, se for 1 ele fica todo branco, é alguma coisa no shader

    childrenIndividualLights: true,
    useAccumulatedLights: true,
    staticAccumulatedLights: false,

    /**
    * Posição do objeto 
    */
    position: {
        x: -12,
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


// Cria um cilindro
renderizador.criarObjeto({
    tipo: 'Cilindro',
    nome: 'Cilondro',
    invisivel: false,
    transparencia: 100, // 100 opaco

    childrenIndividualLights: true,
    useAccumulatedLights: true,
    staticAccumulatedLights: false,

    /**
    * Posição do objeto 
    */
    position: {
        x: -6,
        y: 8,
        z: 0
    },

    /**
    * Escala do objeto 
    */
    scale: {
        x: 1,
        y: 1.2,
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

// Cria um cubo
renderizador.criarObjeto({
    tipo: 'TexturedFacesCubo',
    nome: 'CuboDemo',

    // Carrega as texturas de cada face
    texturasFaces: [
        carregarTextura( renderizador.gl, "../images/nostalgic.png" ),
        carregarTextura( renderizador.gl, "../images/nostalgic.png" ),
        carregarTextura( renderizador.gl, "../images/nostalgic.png" ),
        carregarTextura( renderizador.gl, "../images/sky.jpg" ),
        carregarTextura( renderizador.gl, "../images/sky.jpg" ),
        carregarTextura( renderizador.gl, "../images/sky.jpg" )
    ],

    useColors: false,
    invisivel: false,
    transparencia: 1, // 100 opaco

    childrenIndividualLights: true,
    useAccumulatedLights: true,
    staticAccumulatedLights: false,

    /**
    * Posição do objeto 
    */
    position: {
        x: -2,
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
    tipo: 'Esfera',
    nome: 'Esfera',
    invisivel: false,
    transparencia: 100, // 100 opaco

    childrenIndividualLights: true,
    useAccumulatedLights: true,
    staticAccumulatedLights: false,

    /**
    * Posição do objeto 
    */
    position: {
        x: 4,
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
    tipo: 'Triangulo3D',
    nome: 'Triangulo1',
    invisivel: false,
    transparencia: 100, // 100 opaco

    childrenIndividualLights: true,
    useAccumulatedLights: true,
    staticAccumulatedLights: false,

    /**
    * Posição do objeto 
    */
    position: {
        x: 10,
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
        x: 1,
        y: 0,
        z: 5
    }
});

renderizador.criarObjeto({
    tipo: 'Cubo',
    nome: 'CuboAleatorio',
    invisivel: false,
    transparencia: 100, // 100 opaco

    childrenIndividualLights: true,
    useAccumulatedLights: true,
    staticAccumulatedLights: false,

    /**
    * Posição do objeto 
    */
    position: {
        x: 10,
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
    nome: 'CuboAleatorio2',
    invisivel: false,
    transparencia: 100, // 100 opaco

    childrenIndividualLights: true,
    useAccumulatedLights: true,
    staticAccumulatedLights: false,

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

const sensibilidade = 0.03;
const limiteX       = 10; 
const limiteY       = 10; 
let passos        = 0.5;

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
    const viradaEsquerdaOrigem = renderizador.miraCamera[0] >= 1.4918051575931215  ? true : false;
    const viradaDireitaOrigem  = renderizador.miraCamera[0] <= -1.4918051575931215 ? true : false;

    // Normaliza a posição do mouse para o intervalo de -1 a 1
    contexto.mousePosition.x =  (event.clientX / window.innerWidth)  * 2 - 1;
    contexto.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

    renderizador.miraCamera[0] -= sensibilidade * contexto.mousePosition.y;
    renderizador.miraCamera[1] += sensibilidade * contexto.mousePosition.x;
}

// Adiciona o evento de movimento do mouse
window.addEventListener('mousemove', onMouseMove, false);

function onAndar()
{
    if( contexto.keyDetection.SHIFT )
    {
        passos = 3.5;
    }else{
        passos = 0.9;
    }

    const frameDelta = renderizador.lastFrameDelta;
   
    // Calcula a direção da câmera com base na rotação
    const direcao = calcularDirecaoCamera(renderizador.miraCamera);

    // Calcula o vetor "direita" (eixo X local)
    const direita = calcularDireitaCamera(direcao);

    // Aplica movimentação com base em eixos locais
    const velocidadeFinal = passos * frameDelta;

    if (contexto.keyDetection.W) {
        renderizador.posicaoCamera[0] += direcao[0] * velocidadeFinal;
        renderizador.posicaoCamera[1] += direcao[1] * velocidadeFinal;
        renderizador.posicaoCamera[2] += direcao[2] * velocidadeFinal;
    }
    if (contexto.keyDetection.S) {
        renderizador.posicaoCamera[0] -= direcao[0] * velocidadeFinal;
        renderizador.posicaoCamera[1] -= direcao[1] * velocidadeFinal;
        renderizador.posicaoCamera[2] -= direcao[2] * velocidadeFinal;
    }
    if (contexto.keyDetection.A) {
        renderizador.posicaoCamera[0] += direita[0] * velocidadeFinal;
        renderizador.posicaoCamera[1] += direita[1] * velocidadeFinal;
        renderizador.posicaoCamera[2] += direita[2] * velocidadeFinal;
    }
    if (contexto.keyDetection.D) {
        renderizador.posicaoCamera[0] -= direita[0] * velocidadeFinal;
        renderizador.posicaoCamera[1] -= direita[1] * velocidadeFinal;
        renderizador.posicaoCamera[2] -= direita[2] * velocidadeFinal;
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

    if( event.shiftKey ){
        contexto.keyDetection.SHIFT = true;
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

    if( event.shiftKey ){
        contexto.keyDetection.SHIFT = false;
    }

    onAndar();
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup',   onKeyUp);

function loopTeste(){
    requestAnimationFrame(loopTeste)

    //renderizador.getObjetos()[2].rotation.x+= 0.01;

    // Mantem a rotação Y da camera estavel
    if( renderizador.miraCamera[0] > 1.6183333333333352 ){
        renderizador.miraCamera[0] = 1.6183333333333352;
    }
    if( renderizador.miraCamera[0] < -1.6183333333333352 ){
        renderizador.miraCamera[0] = -1.6183333333333352;
    }

    /*
    if( renderizador.miraCamera[1] < -1.12611111111111148 ){   
        renderizador.miraCamera[1] = -1.12611111111111148;
    }
    if( renderizador.miraCamera[1] > 1.12611111111111148 ){
        renderizador.miraCamera[1] = 1.12611111111111148;
    }*/
    
    // Condicoes especiais anti bug
    /*
    const ultrapassouLimiteAgradavel1 = renderizador.miraCamera[0] <= -0.189661835748794 && renderizador.miraCamera[1] >= 0.74836297357529475;

    if( ultrapassouLimiteAgradavel1 == true )
    {
        renderizador.miraCamera[0] = -0.189661835748794;
        renderizador.miraCamera[1] = 0.74836297357529475;
    }
    */

}
loopTeste();

// FUNÇÂO QUE CARREGA O MODELO 3D DA CAIXA
async function criarCaixa() 
{
    const objString = await carregarTxt('./objs/box.obj');
    const mtlString = await carregarTxt('./objs/box.mtl');

    // Cria um plano que pode se deformar
    renderizador.criarObjeto({
        tipo: 'OBJ',
        nome: 'Caixa',
        objString: objString,
        mtlString: mtlString,
        
        invisivel: false,
        transparencia: 1, 

        childrenIndividualLights: true,
        useAccumulatedLights: true,
        staticAccumulatedLights: false,

        /**
        * Posição do objeto 
        */
        position: {
            x: -34,
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
}

window.criarCaixa = criarCaixa;
criarCaixa();

// FUNÇÂO QUE CARREGA O MODELO 3D DA CAIXA
async function criarCarro() 
{
    const objString = await carregarTxt('./objs/carros/classic-car.obj');
    const mtlString = await carregarTxt('./objs/carros/classic-car.mtl');

    // Cria um plano que pode se deformar
    renderizador.criarObjeto({
        tipo: 'OBJ',
        nome: 'Carro',
        objString: objString,
        mtlString: mtlString,
        
        invisivel: false,
        transparencia: 1, 

        childrenIndividualLights: true,
        useAccumulatedLights: true,
        staticAccumulatedLights: false,

        /**
        * Posição do objeto 
        */
        position: {
            x: -34,
            y: -12,
            z: 0
        },

        /**
        * Escala do objeto 
        */
        scale: {
            x: 5,
            y: 5,
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
}

window.criarCarro = criarCarro;
criarCarro();

// FUNÇÂO QUE CARREGA O MODELO 3D DA CAIXA
async function carregarMapa() 
{
    const objString = await carregarTxt('./MAPS/theroom2/map.obj');
    const mtlString = await carregarTxt('./MAPS/theroom2/map.mtl');

    // Cria um plano que pode se deformar
    renderizador.criarObjeto({
        tipo: 'OBJ',
        nome: 'Mapa novo',
        objString: objString,
        mtlString: mtlString,

        invisivel: false,
        transparencia: 1, 

        childrenIndividualLights: true,
        useAccumulatedLights: true,
        staticAccumulatedLights: false,

        /**
        * Posição do objeto 
        */
        position: {
            x: -50,
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
}

window.carregarMapa = carregarMapa;
carregarMapa();

// Carregando o mesmo obj denovo pra testar se tem limitações de importação
async function carregarMapa2() 
{
    const objString = await carregarTxt('./MAPS/theroom/map.obj');
    const mtlString = await carregarTxt('./MAPS/theroom/map.mtl');

    // Cria um plano que pode se deformar
    renderizador.criarObjeto({
        tipo: 'OBJ',
        nome: 'Mapa antigo',
        objString: objString,
        mtlString: mtlString,
        
        invisivel: false,
        transparencia: 1, 

        childrenIndividualLights: true,
        useAccumulatedLights: true,
        staticAccumulatedLights: false,

        /**
        * Posição do objeto 
        */
        position: {
            x: -200,
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
}

window.carregarMapa2= carregarMapa2;
carregarMapa2();

// Carregando o mesmo obj denovo pra testar se tem limitações de importação
async function carregarMapa3() 
{
    const objString = await carregarTxt('./MAPS/theroom2/map.obj');
    const mtlString = await carregarTxt('./MAPS/theroom2/map.mtl');

    // Cria um plano que pode se deformar
    renderizador.criarObjeto({
        tipo: 'OBJ',
        nome: 'Mapa novo 2',
        objString: objString,
        mtlString: mtlString,
        
        invisivel: false,
        transparencia: 1, 

        childrenIndividualLights: true,
        useAccumulatedLights: true,
        staticAccumulatedLights: false,

        /**
        * Posição do objeto 
        */
        position: {
            x: -300,
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
}

window.carregarMapa3= carregarMapa3;
carregarMapa3();

function criarTexturaBranca(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const whitePixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, whitePixel);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return texture;
}

window.texturaBranca = criarTexturaBranca(renderizador.gl);