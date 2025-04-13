//Importações
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import createTexturedObject from './utils/createTexturedObject';
import createMaterialByImage from './utils/createMaterialByImage';
import createCube from './utils/createCube';
import createPlane from './utils/createPlane';
import { GameCamera } from './core/GameCamera';
import ObjectBase from './core/ObjectBase';
import importObjectFrom from './utils/importObject';
import GlobalContext from './core/GlobalContext';
import Scene from './core/Scene';
import isCollision from './utils/logic/isCollision';
import ProximityBounds from './utils/interfaces/ProximityBounds';
import { Player } from './core/Player';

// Objeto usado para armazenar qualquer coisa que o jogo precisar
export const globalContext = new GlobalContext({});

/** Função que vai ser executada quanto a Engine for iniciada */
export function EngineMain( scene: Scene, 
                            renderer: THREE.WebGLRenderer,
                            canvasRef: React.RefObject<HTMLDivElement>,
                            player: Player
): void{

    /**
    * Define algumas coisas uteis
    */
    globalContext.set('gameScene', scene); //A cena que o jogo está rodando em si
    globalContext.set('htmlCanvas', document.querySelector("canvas") );
    globalContext.set('PlayerRef',  player);

    // Cria um chao simples para testar
    const cuboChao = createCube( 
        //The attributes
        {
            material: createMaterialByImage('/textures/grama.jpg'), //The material,
            name: 'Chao',
            isNPC: false,
            havePhysics: false,
            invisible: false,
            opacity: 1,
            collide: true,
            weight: 40,
            traverse: false,
            position: {
                x: 0,
                y: -50,
                z: 0
            },
            scale: {
                x: 510,
                y: 1,
                z: 500
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            }
        }
    );

    scene.add(cuboChao);
    globalContext.set('ChaoRef', cuboChao);

    // Cria um cubo simples para testar
    const cubo = createCube( 
        //The attributes
        {
            material: createMaterialByImage('/textures/1piso.png'), //The material,
            name: 'MyCube',
            isNPC: false,
            havePhysics: true,
            invisible: false,
            opacity: 1,
            collide: true,
            scaleReduce: 1.5,
            ignoreCollisions: [
                "OtherCube",
                "AnotherCubo",
            ],
            weight: 40,
            events: [
                {
                    //Cubo ficar rodando
                    loop: function( propioObjeto:ObjectBase ){
                        
                    }
                }
            ]
        }
    );

    // Adiciona o cubo na cena
    scene.add(cubo);
    globalContext.set('CuboRef', cubo);

    //Importa uma caixa
    importObjectFrom({
        caminho: 'objs/box.obj',
        haveMTL: true,
        
        objectProps: {
            name: 'Caixa',
            collide: true,
            havePhysics: true,

            //Define configuraçao de detecção de proximidade
            proximityConfig: {
                x: 3,
                y: 3,
                z: 3
            }as ProximityBounds,
                        
            // Cria um bloco de eventos para esse objeto
            events: [
                {
                    loop: function( propioObjeto:ObjectBase ){
                        //console.log( propioObjeto.infoProximity )
                    },

                    whenFall: function(){
                        console.log('Objeto caindo');
                    },

                    whenDestroy: function( objeto:ObjectBase ){
                        console.log('Objeto destruido');
                    },

                    whenCollide: function( parametrosColisao:any ){

                        // Se a Caixa colidir com o Cubo
                        if( parametrosColisao.target.name == 'MyCube' ){
                            console.log('Cubo Colidiou com Caixa');
                        }
                    },

                    whenProximity: function( parametrosProximidade:any ){

                        // Se a Caixa colidir com o Cubo
                        if( parametrosProximidade.target.name == 'MyCube' ){
                            console.log('Cubo próximo da Caixa');
                        }

                    }
                }
            ]
        },

        // Depois que o objeto for carregado
        callback: function(objetoCarregado: ObjectBase){

            //Define a posição do objeto
            objetoCarregado.setPosition({
                x: -5,
                y: 0,
                z: 0
            });

            //Adiciona o objeto na cena
            scene.add( objetoCarregado );

            globalContext.set('CaixaRef', objetoCarregado);
        }
    })

    const light = new THREE.AmbientLight(0xffffff, 1); // Luz ambiente
    scene.add( light );

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direcional
    directionalLight.position.set(5, 10, 7.5);
    scene.add( directionalLight );

    

}


/** Loop que vai ser executado ANTES da função de atualização */
export function EngineBeforeLoop( scene: Scene, 
                                  renderer: THREE.WebGLRenderer,
                                  canvasRef: React.RefObject<HTMLDivElement>,
                                  player: Player
): void{

}

/** Loop que vai ser executado a todo momento depois que a função de atualização rodar */
export function EngineLoop( scene: Scene, 
                            renderer: THREE.WebGLRenderer,
                            canvasRef: React.RefObject<HTMLDivElement>,
                            player: Player
): void{

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

    /*
    if( globalContext.avaliable('CaixaRef') ){
        if( globalContext.get('CaixaRef').scene ){
            console.log( globalContext.get('CaixaRef').scene.proximityBinaryTable );
            if( globalContext.get('CaixaRef').scene.proximityBinaryTable.byName['Caixa'] ){
                if( globalContext.get('CaixaRef').scene.proximityBinaryTable.byName['Caixa']['MyCube'] == true ){
                    debugger
                }
            }
            //
        }
    }*/

    // Outra forma melhor que inventei para verificar colisao e proximidade
    /*
    if( globalContext.avaliable('CaixaRef') && globalContext.avaliable('CuboRef') ){
        if( globalContext.get('CaixaRef').scene ){
            if( globalContext.get('CaixaRef').isProximityOf( globalContext.get('CuboRef') ) ){
                debugger
            }

            if( globalContext.get('CaixaRef').isProximityOf( 'MyCube' ) ){
                debugger
            }
        }
    }
    */

    //console.log( scene.proximityTable );

    // Verificar se o isFalling está marcando certo
    //if( globalContext.avaliable('CaixaRef') ){
    //    if( globalContext.get('CaixaRef').isFalling ){
    //       
    //    }
    //}

    //Faz a caixa ficar proximo do jogador
    //if( globalContext.avaliable('caixaRef') )
    //{

        //globalContext.get('caixaRef').setPosition({
        //    z: camera.getCamera().position.x-50
        //});

    //}

    //Detecta colisão
    /*
    if( globalContext.avaliable('CaixaRef') && globalContext.avaliable('CuboRef') )
    {
        if( isCollision( globalContext.get('CaixaRef'), globalContext.get('CuboRef') ) ){
            console.log('Cubo Colidiou com Caixa');
        }
    }
    */

}