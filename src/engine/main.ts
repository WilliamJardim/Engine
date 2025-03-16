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

// Objeto usado para armazenar qualquer coisa que o jogo precisar
export const globalContext = new GlobalContext({});

/** Função que vai ser executada quanto a Engine for iniciada */
export function EngineMain( scene: Scene, 
                            renderer: THREE.WebGLRenderer,
                            canvasRef: React.RefObject<HTMLDivElement>,
                            camera: GameCamera, 
                            cameraControls: PointerLockControls 
): void{

    /**
    * Define algumas coisas uteis
    */
    globalContext.set('sceneCameraControls', cameraControls);
    globalContext.set('gameScene', scene); //A cena que o jogo está rodando em si

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
            ignoreCollisions: [
                "OtherCube",
                "AnotherCubo"
            ],
            weight: 40,
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: {
                x: 0,
                y: 0,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            }
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
            name: 'Caixa'
        },

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
                                  camera: GameCamera, 
                                  cameraControls: PointerLockControls 
): void{

}

/** Loop que vai ser executado a todo momento depois que a função de atualização rodar */
export function EngineLoop( scene: Scene, 
                            renderer: THREE.WebGLRenderer,
                            canvasRef: React.RefObject<HTMLDivElement>,
                            camera: GameCamera, 
                            cameraControls: PointerLockControls 
): void{

    //Faz a caixa ficar proximo do jogador
    //if( globalContext.avaliable('caixaRef') )
    //{

        //globalContext.get('caixaRef').setPosition({
        //    z: camera.getCamera().position.x-50
        //});

    //}

    //Detecta colisão
    if( globalContext.avaliable('CaixaRef') && globalContext.avaliable('CuboRef') )
    {
        if( isCollision( globalContext.get('CaixaRef'), globalContext.get('CuboRef') ) ){
            console.log('Cubo Colidiou com Caixa');
        }
    }

}