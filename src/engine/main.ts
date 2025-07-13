/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

//Importações
import GlobalContext from './core/GlobalContext';
import ObjectBase    from './core/ObjectBase';
import Scene         from './core/Scene';
import LocalSound    from './core/LocalSound';
import { carregarTxt } from './renderer/utils/funcoesBase';
import { Light } from './core/Light';

// Objeto usado para armazenar qualquer coisa que o jogo precisar
export const globalContext = new GlobalContext({});

/** Função que vai ser executada quanto a Engine for iniciada */
export function EngineMain( scene: Scene, firstRender: boolean, renderizadorPronto: boolean, frameDelta: number, frameNumber: number ): void
{
    // Importa o modelo do meu quarto 1
    // Cria um plano que pode se deformar
    scene.criarObjeto(new ObjectBase({
        type : 'OBJ',
        name : 'Mapa antigo',
        obj  : '/MAPS/theroom/map.obj',
        mtl  : '/MAPS/theroom/map.mtl',
        
        isInvisible: false,
        opacity: 1, 

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
        },

        mass: 1,
        classes: [],
        havePhysics: false,
        scaleReduce: {
            x: 0,
            y: 0,
            z: 0
        },
        collide: false,
        collisionEvents: false,
        podeAtravessar: false,
        ignoreCollisions: [],
        proximityConfig: {
            x: 0,
            y: 0,
            z: 0
        },
        events: [],
        kick_rate: 4,
        enable_advanced_frame_tracking: false,
        attachments: [],
        onCreate: function(){

        },
    }));
    
    // Cria um plano que pode se deformar
    scene.criarObjeto( new ObjectBase({
        type : 'OBJ',
        name : 'Mapa novo 2',
        obj  : '/MAPS/theroom2/map.obj',
        mtl  : '/MAPS/theroom2/map.mtl',
        
        isInvisible: false,
        opacity: 1, 

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
        },

        mass: 1,
        classes: [],
        havePhysics: false,
        scaleReduce: {
            x: 0,
            y: 0,
            z: 0
        },
        collide: false,
        collisionEvents: false,
        podeAtravessar: false,
        ignoreCollisions: [],
        proximityConfig: {
            x: 0,
            y: 0,
            z: 0
        },
        events: [],
        kick_rate: 4,
        enable_advanced_frame_tracking: false,
        attachments: [],
        onCreate: function(){

        },
    }));

    // Cria um carro
    scene.criarObjeto( new ObjectBase({
        type : 'OBJ',
        name : 'Carro',
        obj  : '/objs/carros/classic-car.obj',
        mtl  : '/objs/carros/classic-car.mtl',
        
        isInvisible: false,
        opacity: 1, 

        childrenIndividualLights: true,
        useAccumulatedLights: true,
        staticAccumulatedLights: false,

        /**
        * Posição do objeto 
        */
        position: {
            x: 0,
            y: -10,
            z: 0
        },

        /**
        * Escala do objeto 
        */
        scale: {
            x: 2,
            y: 2,
            z: 2
        },

        /**
        * Rotação do objeto 
        */
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },

        mass: 1,
        classes: [],
        havePhysics: true,
        scaleReduce: {
            x: 0,
            y: 0,
            z: 0
        },
        collide: true,
        collisionEvents: true,
        podeAtravessar: false,
        ignoreCollisions: [],
        proximityConfig: {
            x: 0,
            y: 0,
            z: 0
        },
        events: [],
        kick_rate: 4,
        enable_advanced_frame_tracking: false,
        attachments: [],
        onCreate: function(){

        },
    }));

    // Cria um objeto na Engine de fisica
    scene.criarObjeto( new ObjectBase({
        mass: 1,
        name: "Cubo",
        type: "Cubo",
        obj  : '',
        mtl  : '',
        classes: [],
        havePhysics: true,
        position: {
            x: 0,
            y: 8,
            z: 0
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        scale: {
            x: 1,
            y: 1,
            z: 1
        },
        scaleReduce: {
            x: 0,
            y: 0,
            z: 0
        },
        collide: true,
        collisionEvents: true,
        podeAtravessar: false,
        ignoreCollisions: [],
        proximityConfig: {
            x: 0,
            y: 0,
            z: 0
        },
        isInvisible: false,
        opacity: 1,
        events: [],
        kick_rate: 4,
        enable_advanced_frame_tracking: false,
        attachments: [],
        onCreate: function(){

        },
        //Iluminação
        childrenIndividualLights: true,
        useAccumulatedLights: true,
        staticAccumulatedLights: false
    }) );

    // Cria um objeto na Engine de fisica
    scene.criarObjeto( new ObjectBase({
        mass: 1,
        name: "Cubo1",
        type: "Cubo",
        obj  : '',
        mtl  : '',
        classes: [],
        havePhysics: true,
        position: {
            x: -10,
            y: 0,
            z: 0
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        scale: {
            x: 1,
            y: 1,
            z: 1
        },
        scaleReduce: {
            x: 0,
            y: 0,
            z: 0
        },
        collide: true,
        collisionEvents: true,
        podeAtravessar: false,
        ignoreCollisions: [],
        proximityConfig: {
            x: 0,
            y: 0,
            z: 0
        },
        isInvisible: false,
        opacity: 1,
        events: [],
        kick_rate: 4,
        enable_advanced_frame_tracking: false,
        attachments: [],
        onCreate: function(){

        },
        //Iluminação
        childrenIndividualLights: true,
        useAccumulatedLights: true,
        staticAccumulatedLights: false
    }) );

    // Cria um objeto na Engine de fisica
    scene.criarObjeto( new ObjectBase({
        mass: 1,
        name: "Cubo2",
        type: "Cubo",
        obj  : '',
        mtl  : '',
        classes: [],
        havePhysics: true,
        position: {
            x: 0,
            y: 0,
            z: -5
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        scale: {
            x: 1,
            y: 1,
            z: 1
        },
        scaleReduce: {
            x: 0,
            y: 0,
            z: 0
        },
        collide: true,
        collisionEvents: true,
        podeAtravessar: false,
        ignoreCollisions: [],
        proximityConfig: {
            x: 0,
            y: 0,
            z: 0
        },
        isInvisible: false,
        opacity: 1,
        events: [],
        kick_rate: 4,
        enable_advanced_frame_tracking: false,
        attachments: [],
        onCreate: function(){

        },
        //Iluminação
        childrenIndividualLights: true,
        useAccumulatedLights: true,
        staticAccumulatedLights: false
    } ) );

    // Chão
    scene.criarObjeto( new ObjectBase({
        mass: 1,
        name: "Chao",
        type: "Cubo",
        obj  : '',
        mtl  : '',
        classes: [],
        havePhysics: false,
        position: {
            x: 0,
            y: -16,
            z: 0
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        scale: {
            x: 2000,
            y: 0.1,
            z: 2000
        },
        scaleReduce: {
            x: 0,
            y: 0,
            z: 0
        },
        collide: true,
        collisionEvents: true,
        podeAtravessar: false,
        ignoreCollisions: [],
        proximityConfig: {
            x: 0,
            y: 0,
            z: 0
        },
        isInvisible: false,
        opacity: 1,
        events: [],
        kick_rate: 1,
        enable_advanced_frame_tracking: false,
        attachments: [],
        onCreate: function(){

        },
        //Iluminação
        childrenIndividualLights: true,
        useAccumulatedLights: true,
        staticAccumulatedLights: false
    }) );

    // Ponto de luz
    scene.criarLuz( new Light({ tipo: "Light", position: {x: 1.556491508391181, y: 29.92973285780118, z: -16.441060668107095 }, ambient: 0.5, raio: 0.1 , cor: [255,0,0]}) )

    globalContext.set("scene", scene);
}


/** Loop que vai ser executado ANTES da função de atualização */
export function EngineBeforeLoop( scene: Scene, frameDelta: number, frameNumber: number, firstRender: boolean, renderizadorPronto: boolean ): void
{

}

/** Loop que vai ser executado a todo momento depois que a função de atualização rodar */
export function EngineLoop( scene: Scene, firstRender: boolean, renderizadorPronto: boolean, frameDelta: number, frameNumber: number ): void
{

    const htmlCanvas = globalContext.get('htmlCanvas');

    if(htmlCanvas)
    {
        /**
        * Eventos do canvas 
        */
        document.addEventListener("click", (event) => {

            if( event.target === htmlCanvas ){
                globalContext.set('isDentroCanvas', true);

            }else{
                globalContext.set('isDentroCanvas', false);
            }

        });
    }

}

window.engineContext = globalContext;