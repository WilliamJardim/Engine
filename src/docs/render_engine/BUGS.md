(CORRIGIDO) Na camera ortografica, Em qualquer objeto,
O eixo Z parece funcionar com uma escala diferente de X e Y, pois valores pequenos não afetam em nada.
PIOR: E quando eu tento alterar o eixo Z, ao invez de mover o objeto em Z, a renderização buga e objeto perde parte de sua visualização
se eu ir somando gradualmente, o efeito é que o objeto vai sumindo gradualmente, poligno por poligno,
MAIS A CAMERA ORTOGRAFICA NÂO TEM PROFUNDIDADE


BUG: As cameras ortograficas e perspectiva o eixo Y vão pra uma direção diferente.
é como se o Z na perspetiva fosse o Y


BUG: Posições incorretas e imprevisiveis:

    BUG: Na camera perspectiva, o eixo Z é o Y,
    e o eixo Y é o Z

    BUG: O eixo Z por exemplo faz o objeto subir pra cima porém não reto, perfeito.
    Ele sobe meio diagonal. Depende da posição do objeto
    MAIS NEM SEMPRE, DEPENDE MUITO DA POSIÇÂO DO OBJETO

    * TUDO ISSO È CAUSADO PELA ROTAÇÂO DOS OBJETOS, QUE BUGA TUDO, DEIXANDO DESALINHADO NAO SEI POR QUE
    TIPO SE EU ALTERO A ROTAÇÂO DOS OBJETOS DE CIMA PARECE QUE NADA DE RUIM ACONTECE
    MAIS SE EU ALTERO A ROTAÇÂO DO CHÂO, TUDO FICA DESALINHADO
    TEM BUG AI!


BUG: Na camera perspectiva, o eixo Z e Y realizam o mesmo movimento
QUANDO A CAMERA ESTÀ NA POSIÇÂO DE ORIGEM, ELA OLHA PRA CIMA PRA BAIXO
Mais quando eu vou pro lado com ela, e olho do sentido esquerdo dos cubos, quando eu tento olhar pra cima ou pra baixo, ela olha pro lado tambem, como se fosse Z


BUG: ROTAÇÂO XYZ NÂO BATE COM A POSIÇÂO XYZ
Por exemplo, ao somar +0.01 a POSIÇÂO X, o Cilindro vai pra direita
Mais ao somar +0.01 na ROTAÇÂO X, o Cilindro gira pra traz.
Quero que seja consistente




(RESOLVIDO) BUG: NO OBJMesh
Quando eu exporto um objeto modelado pelo Blender em .obj COM ELE TODO JUNTADO(COM TUDO JUNTO EM UM SÒ USANDO A OPÇÂO CTRL + P DO BLENDER),  a minha Engine ao ler esse .obj aplica uma unica textura para o objeto inteiro.
Agora quando o objeto está inteiramente separado, ai não dá problema nenhum.

SOLUÇÔES: Na minha Engine, criar um sistema pra unir os Meshs do objeto, mesmo estando separados, permitindo mover eles como um só.
OU TENTAR CORRIGIR ISSO NO CÒDIGO DO OBJMesh

(RESOLVIDO) BUG: Janelas em modelos 3d, com opacidade, não permitem ver o mundo a fora, elas ficam transparentes e permitem ver o céu, mais não os objetos do mundo de fora...
EXCETO ALGUNS OBJETOS DO LADO DE DENTRO DO MAPA, QUE APARECEM.



BUG: Por causa do gl.depthMask(false);, na hora de renderizar objetos transparentes,
Se um modelo 3d grande como o do MAPA DO QUARTO for focado pela camera, qualquer outro objeto transparente que estiver na frente dele, na mesma direção que a camera está apontando, ESSE OBJETO SOME
SOMENTE QUANDO OLHA EM DIREÇÂO PRO OBJETO GRANDE,.. mais para direções contrarias isso não ocorre. Ele meio que "ocupa" uma area da visão desse objeto


BUG: No código do Light, a cor não está funcionando ainda quando eu passo uma cor 
em: renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 10, raio: 1 , cor: [0,255,0]} )




12/07/2025 - 15:23 PM (RESOLVIDO)
positions dos objetos ficando NaN
    A cena cria o objeto da engine de fisica normalmente, com as posicoes certinho
    Ao chamar meu mini renderizador webgl pra criar os objeto VisualMesh tambem vai certinho

    No primeiro frame, e até no segundo, fica tudo normal, com a position igual eu defini no EngineMain

    Porém, depois do terceiro frame, aproximadamente, positions dos objetos da engine de fisica ficando NaN

    E o efeito visual que tem é que, aparece um cubo no meu mini renderizador webgl, e menos de um segundo depois ele some.

    ESSE BUG acontece na função "updateObjects"
    na verdade, dentro da função updateObject do ObjectBase

    dentro da função "updateMovement" e tambem da função "updateRotation" do ObjectBase


13/07/2025 - 13:32 AM (RESOLVIDO)
Meu sistema de carregamento de OBJs está em partes funcionando
ele já le os .obj e .mtl apenas uma vez, e consegue controlar quais ja foram carregados e quais precisam carregar
PORÈM, POR ALGUM MOTIVO DESCONHECIDO, MESMO COM AS VERIFICAÇÔES, o erro ainda persiste nos primeiros frames:

    OBJMesh.ts:178 Uncaught TypeError: Cannot read properties of undefined (reading 'split')
        at OBJMesh.carregarMTL (OBJMesh.ts:178:32)
        at new OBJMesh (OBJMesh.ts:134:14)
        at Renderer.criarObjeto (Renderer.ts:385:36)
        at RenderizadorCena.updateObjectsVisually (RenderizadorCena.ts:412:68)
        at animate (RenderizadorCena.ts:497:21)

Quanto mais objetos OBJ eu instancio na cena, mais esse erro acontece nos primeiros frames.
No momento São 6 erros.
Esses erros param nos proximos frames.

porém indicam algo de errado. E também, o OBJ NÂO È CARREGADO.



13/07/2025 14:20 PM (RESOLVIDO)
    Quando eu crio a luz usando meu método: scene.criarLuz, funciona como eu queria, PORÈM
    PORÈM O CHAO FICA PRETO, SOMENTE AO CRIAR A LUZ
    SE EU NAO CRIAR A LUZ O CHÂO NAO FICA PRETO

    mais isso não acontece quando eu crio a luz diretamente pelo contexto do meu mini renderizador:
    renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 0.5, raio: 0.1 , cor: [255,0,0]} )

    acontece somente quando eu crio pela minha engine de logica, que usa a minha camada de comunicação entre minhas duas engines(a minha engine de logica e minha engine de renderização: ou seja, meu mini renderizador webgl)

    E esse BUG só acontece por que, por algum motivo, ao criar a luz com a função criarLuz da minha engine de logica
    as variaveis de acumulaçã de luz ficam Infinity:

        ambientLocalAcumulado fica Infinty
        brilhoLocalAcumulado fica Infinty
        brilho fica 16 (OK)
        brilhoObjeto fica 32 (OK)
        ambient fica 0.5(OK)
        ambientObjeto fica 0.6 (OK)
        corLocalAcumulado fica [Infinity, NaN, NaN]
        corLuz fica [Infinity, NaN, NaN]
        corLuzObjeto fica [0,0,0]
        diffuseLocalAcumulado fica Infinity
        intensidadeLocalAcumulado fica NaN
        intensidadeLuz fica NaN
        intensidadeLuzObjeto fica 0
        specularLocalAcumulado fica Infinity

        e ele não está usando luzes estaticas: staticAccumulatedLights está false, OK ISSO È ESPERADO

    PRECISO ENTENDER ESSE BUG

    Eu analisei mais um pouco

    [22:04 PM]
        e descobri que isso é um bug no meu mini renderizador webgl
        Onde a posição X,Y e Z da luz altera a posição do Chão
        E isso ocorre por que o Chão é o ultimo objeto a ser desenhado.
        Esse na verdade é bem parecido com um bug antigo que eu tinha ignorado faz um tempo atraz, onde o ultimo objeto poderia ser afetado ou iriar afetar os outros...
        MAIS O PONTO È: ALTERAR A POSIÇÂO DA LUZ NO  no meu mini renderizador webgl AFETA O ULTIMO OBJETO dentro de "objetos" do meu mini renderizador webgl

        COMO TESTAR?
        acesse: renderizador.objetos e renderizador.luzes, altere a luz e a posição do Chão(o ultimo objeto) também vai mudar... vai ser igual a ela....

        OU SEJA: O chão sempre vai ser igual a posição da luz
    

13/07/2025 14:33 RELACIONADO AO BUG ANTERIOR: (RESOLVIDO)
Ao usar: engineContext.dados.scene.lights[0].cor, não afeta em nada a cor da luz do renderizador
o mesmo vale para ambient, e todos os outros parametros da luz....
Isso significa que existe um problema com minha função updateLightsVisually, que faz com que as luzes só sejam atualizadas uma unica vez, e depois as minhas duas engines(a minha engine de logica e minha engine de renderização: ou seja, meu mini renderizador webgl) param de sincronizar as luzes.

13/07/2025 22:07 (JA RESOLVIDO)
ALTERAR O ambient da luz da minha engine de logica não altera o ambient da luz do meu mini renderizador web.
PARECE QUE A COPIA DE VALORES NÂO ESTÀ ACONTECENDO


# 18/07/2025 17:05 PM - OBJETOS QUE NÂO APARECEM 
BUG: Os OBJs renderizam certo
porém o Cubo(e com certeza os outros) não renderizam. Eles não aparecem na renderização

