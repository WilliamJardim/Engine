//Cria a arma
const arma = createCube({
    material: createMaterialByImage('/itens/1person/pistol.png', null),
    name: 'Pistol',
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
});

scene.add( arma.getMesh() );