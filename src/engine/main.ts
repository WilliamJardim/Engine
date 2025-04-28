//Importações
import createMaterialByImage from './utils/render/createMaterialByImage';
import createCube from './utils/createCube';
import ObjectBase from './core/ObjectBase';
import GlobalContext from './core/GlobalContext';
import Scene from './core/Scene';
import isCollision from './utils/logic/isCollision';
import ProximityBounds from './utils/interfaces/ProximityBounds';
import ObjectVelocity from './interfaces/ObjectVelocity';

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
            material: createMaterialByImage('/textures/grama.jpg'), //The material,
            name: 'Chao',
            classes: ['ground'],
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
            material: createMaterialByImage('/textures/1piso.png'), //The material,
            name: 'MyCube',
            isNPC: false,
            havePhysics: true,
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
                y: 1,
                z: 1
            },
            weight: 40,
            events: [
                {
                    //Cubo ficar rodando
                    loop: function( propioObjeto:ObjectBase ){
                        //propioObjeto.somarPosicaoX(0.005);
                        //console.log(propioObjeto.getPosition())

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
    scene.add(cubo);
    globalContext.set('CuboRef', cubo);

    // Cria um cubo simples para testar
    const cuboN = createCube( 
        //The attributes
        {
            type: 'Cube',
            material: createMaterialByImage('/textures/1piso.png'), //The material,
            name: 'MyCubeN',
            isNPC: false,
            havePhysics: true,
            invisible: false,
            opacity: 1,
            collide: true,
            scaleReduce: 1.4,
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
    scene.add(cuboN);
    globalContext.set('CuboRefN', cuboN);

    // Cria um cubo simples para testar
    const cubo2 = createCube( 
        //The attributes
        {
            type: 'Cube',
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
                z: 10,
                x: 10
            },
            events: [
                {
                    //Cubo ficar rodando
                    loop: function( propioObjeto:ObjectBase ){
                        console.log(propioObjeto.getPosition(), propioObjeto.getVelocity())
                    }
                }
            ]
        }
    );

    // Adiciona o cubo na cena
    scene.add(cubo2);
    globalContext.set('Cubo2Ref', cubo2);
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