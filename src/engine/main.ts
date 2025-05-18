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
import createMaterialByImage from './utils/render/createMaterialByImage';
import createCube from './utils/createCube';
import ObjectBase from './core/ObjectBase';
import GlobalContext from './core/GlobalContext';
import Scene from './core/Scene';
import isCollision from './utils/logic/isCollision';
import ProximityBounds from './utils/interfaces/ProximityBounds';
import ObjectVelocity from './interfaces/ObjectVelocity';
import Player from './core/Player';
import ObjectProps from './interfaces/ObjectProps';

// Objeto usado para armazenar qualquer coisa que o jogo precisar
export const globalContext = new GlobalContext({});

/** Função que vai ser executada quanto a Engine for iniciada */
export function EngineMain( scene: Scene, firstRender: boolean, renderizadorPronto: boolean, frameDelta: number, frameNumber: number ): void{

    /**
    * Define algumas coisas uteis
    */
    globalContext.set('gameScene', scene); //A cena que o jogo está rodando em si
    globalContext.set('htmlCanvas', document.querySelector("canvas") );

    // Cria um chao simples para testar
    const cuboChao = createCube( 
        //The attributes
        {
            type: 'Cube',
            mass: 5,
            material: createMaterialByImage('/textures/grama.jpg'), //The material,
            name: 'Chao',
            classes: ['ground'],
            isNPC: false,
            havePhysics: false,
            invisible: false,
            opacity: 1,
            collide: true,
            traverse: false,
            position: {
                x: 0,
                y: -50,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: {
                x: 510,
                y: 1,
                z: 500
            }
        }
    );

    scene.add(cuboChao);
    globalContext.set('ChaoRef', cuboChao);

    var f = 0;

    // Cria um cubo simples para testar
    const cubo = createCube( 
        //The attributes
        {
            type: 'Cube',
            mass: 5,
            material: createMaterialByImage('/textures/1piso.png'), //The material,
            name: 'MyCube',
            isNPC: false,
            havePhysics: true,
            kick_rate: 2,
            invisible: false,
            opacity: 1,
            collide: true,
            scaleReduce: 3.4,
            ignoreCollisions: [
                "OtherCube",
                "AnotherCubo",
            ],
            position: {
                x: 0,
                y: 10,
                z: -0.5
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
            events: [
                {
                    //Cubo ficar rodando
                    loop: function( propioObjeto:ObjectBase ){
                        //propioObjeto.somarPosicaoX(0.005);
                        console.log(propioObjeto.getVelocity())

                        if( propioObjeto.objectBelow != null ){
                            //console.log(propioObjeto.getVelocity().x)
                            
                            if( f <= 1 ){
                                propioObjeto.somarVelocity({ x: 20.5 } as ObjectVelocity);
                                f++;
                            }
                        }
                        
                        
                    }
                }
            ]
        }
    );

    // Adiciona o cubo na cena
    scene.add(cubo);
    globalContext.set('CuboRef', cubo);

    // Cria um cubo simples para testar
    const cubo3 = createCube( 
        //The attributes
        {
            type: 'Cube',
            mass: 5,
            material: createMaterialByImage('/textures/1piso.png'), //The material,
            name: 'Parede',
            isNPC: false,
            havePhysics: false,
            kick_rate: 2,
            invisible: false,
            opacity: 1,
            collide: true,
            scaleReduce: 3.4,
            ignoreCollisions: [
                "OtherCube",
                "AnotherCubo",
            ],
            position: {
                x: 40,
                y: -40,
                z: -0.5
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: {
                x: 1,
                y: 20,
                z: 50
            },
            events: [
                {
                    //Cubo ficar rodando
                    loop: function( propioObjeto:ObjectBase ){
                        //propioObjeto.somarPosicaoX(0.005);
                        //console.log(propioObjeto.getVelocity())

                        if( propioObjeto.objectBelow != null ){
                            //console.log(propioObjeto.getVelocity().x)
                            
                            if( f <= 10 ){
                                //propioObjeto.somarVelocity({ x: 1.5 } as ObjectVelocity);
                                //f++;
                            }
                        }
                        
                        
                    }
                }
            ]
        }
    );

    // Adiciona o cubo na cena
    //scene.add(cubo3);
    globalContext.set('CuboRef3', cubo3);

    // Cria um cubo simples para testar
    const cuboN = createCube( 
        //The attributes
        {
            type: 'Cube',
            mass: 5,
            material: createMaterialByImage('/textures/1piso.png'), //The material,
            name: 'MyCubeN',
            isNPC: false,
            havePhysics: true,
            kick_rate: 2,
            invisible: false,
            opacity: 1,
            collide: true,
            scaleReduce: 4.4,
            ignoreCollisions: [
                "OtherCube",
                "AnotherCubo",
            ],
            position: {
                x: 0,
                y: -35,
                z: -0.5
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
    scene.add(cuboN);
    globalContext.set('CuboRefN', cuboN);

    // Cria um cubo simples para testar
    const cubo2 = createCube( 
        //The attributes
        {
            type: 'Cube',
            mass: 5,
            material: createMaterialByImage('/textures/1piso.png'), //The material,
            name: 'MyCube2',
            isNPC: false,
            havePhysics: false,
            invisible: false,
            opacity: 1,
            collide: false,
            scaleReduce: 1.5,
            ignoreCollisions: [
                "OtherCube",
                "AnotherCubo",
            ],
            weight: 40,
            position: {
                x: 0,
                y: -140,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: {
                y: 1,
                z: 10,
                x: 10
            },
            events: [
                {
                    //Cubo ficar rodando
                    loop: function( propioObjeto:ObjectBase ){
                        //console.log(propioObjeto.getPosition(), propioObjeto.getVelocity())
                    }
                }
            ]
        }
    );

    // Adiciona o cubo na cena
    scene.add(cubo2);
    globalContext.set('Cubo2Ref', cubo2);

    //Cria o jogador
    /*
    const player = new Player({
        position: {
            x: 0,
            y: -40,
            z: 0
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        scale: {
            y: 1,
            z: 1,
            x: 1
        }
    } as ObjectProps);
    
    scene.add(player);
    globalContext.set('Jogador', player);
    */
}


/** Loop que vai ser executado ANTES da função de atualização */
export function EngineBeforeLoop( scene: Scene, frameDelta: number, frameNumber: number, firstRender: boolean, renderizadorPronto: boolean ): void{

}

/** Loop que vai ser executado a todo momento depois que a função de atualização rodar */
export function EngineLoop( scene: Scene, firstRender: boolean, renderizadorPronto: boolean, frameDelta: number, frameNumber: number ): void{

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