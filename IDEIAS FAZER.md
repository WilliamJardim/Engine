# Renderização otimizada
Criar um sistema de renderização mais avançado

Por regiões, por exemplo, os objetos só vão ser atualizados quando estiverem dentro de um range de coordenadas*
Eu posso incluir ir ocultando objetos distantes
Mais quero focar principalmente em parar de atualizar objetos ao longe(fora do Range de coordenadas), para ficar uma atualização de objetos mais optimizada
EXCLUIR COLISÕES 
Adicionar que o objeto só vai colidir se a propriedade collide for true, e se o target dessa colisão não estiver na lista ignoreCollisions
Adicionar propriedade "solid" que se for false, os objetos vão poder passar por aquele aquele objeto não sólido, desativando completamente colisões
Claro, adicionar que, ao colidir com um Objeto, o movimento dele é interrompido, ou seja, ele não pode atravessar objetos
Exceto se tiver "solid:false"

# GRUPOS DE COLISÂO E GRUPOS DE FISICA
Criar regras mais genéricas de colisão, criando um conceito de "Grupos de Colisão"
Basicamente, vou criar grupos de colisão, que vão controlar a colisão dos objetos como um grupo 
Ou seja, vamos ter relações de colisão específicas para cada grupo 
Ele vai gerenciar as excessões de colisão e outras configurações de coalisao de forma mais simples e intuitiva
Pode ter o grupo vegetação, o grupo líquido, etc...
Posso colocar mais características que o grupo vai controlar, como se os objetos serão sólidos ou não
Também posso ter grupos de física
E posso incluir combinar os dois
Um mesmo objeto poderá fazer parte de mais de um grupo de Colisão.
Ou seja, múltiplas condições grupais poderão ser aplicadas
Eu posso unificar tudo isso em Grupos, onde eu posso dizer que os objetos podem ter grupos, e ao fazer parte desses grupos, eles trazem lógicas, físicas, regras de colisões, dentre outras regras

(FEITO) Criar também eventos whenDestroy

whenFall

whenMove

# Historico de eventos
Adicionar propriedade storeEvents, que se tiver True, vai gravar todo o histórico de eventos dos objetos que tem elas


# Refatorar código
Refatorar o código do Scene updateJump, 

Fazer ele numa estrutura que suporta multijogadores


# Subir escadas
criar lógica de subir escadas automaticamente, escadas inclinadas

# Novo método de verificação de colisão e fisica otimizado por regiao
Criar verificação de colisão por região 

Agrupando objeto por região próximo pra verificar a colisão


# Detectar objetos proximos ao jogador
Criar um sistema que traz todos os objetos que o jogador está perto
Inclusive o objeto mais próximo

# Eventos de teclas e clique em objetos
E nos objetos criar evento de keyPress e click

Que ao definir esses atributos, se o jogador estiver próximo o suficiente do objeto em questão, e atender a tecla ou clique, ele executa uma função
Isso pode ter evento de keyPress no Objeto, ou de outras formas, como um keyEvents específico pra colisão ou proximidade


# Objeto imaginario
Fazer: Continuar o objeto imaginário 

(JA FIZ) Criar um atributo collisionEvents, para ser usado como alternativa.

(JA FIZ )Por padrão se um objeto não tem colisão, ele também não pode receber nem enviar eventos de Colisão. Porém com o collisionEvents habilitado, isso vai ser possível mesmo que o objeto não colida fisicamente


# (FEITO) Colisão
As outras lógicas de Colisão, para por exemplo, o cubo não poder ultrapassar e passar por cima da caixa, ou seja, se ele está em baixo da caixa e tentar subir, ao colidir com a caixa, ele trava ali.
O mesmo para as demais direções, em X e Z, para se o cubo colidir com os lados, ele travar também
Uma outra opção para fazer isso seria: Se ele colidir com o objeto, para qualquer direção, ele trava e não ultrapassa


# Empurrar objetos
a lógica de empurrar objetos.

Levando em conta a velocidade e peso dos objetos 

Cada objeto vai ter um getInpacto, e ao colidir,  se o impacto do objeto A for maior que o do objeto B, então, o objeto B vai ser empurrado para a direção oposta que A está se movendo, em função do impacto

Quanto mais forte for o impacto, mais o objeto vai se mover. E esse movimento vai ser um movimento complexo levando em conta a velocidade e a gravidez, pra ir perdendo velocidade aos poucos

# BUG
(RESOLVIDO) Bug no whenFall: A função whenFall só detecta queda no inicio do jogo, ou quando o chão é movido para baixo e os objetos começam a cair.
O problema é que quando ela não detecta, o isFalling do objeto não está como true

Bug: O jogador não está incluido na lista de atualizações de objetos da cena, por isso, ele não aparece em verificações de colisão
IDEIA RESOLVER: Colocar que o crosshair é um objeto ObjectBase, com configuração de seguir. E ignorar colisão, ele é apenas visual.

Bug: o callEvent não está funcionando em certos momentos,
ver se da pra corrigir ou substituir por chamada direita

Bug: o código de corrigir posição dos objetos que caem está afetando a lógica de pulo

Bug: ao destruir objetos, eles continuam colidindo, mesmo que sumam da cena

Bug: as vezes, dependendo da escala, os objetos ficam quicando sem parar no chão

Bug: esse trecho
<code>
if( this.getPosition().y < objetoAtualCena.getPosition().y ){
                        this.setPosition({
                            //y: objetoAtualCena.getPosition().y - objetoAtualCena.getScale().y - this.getScale().y
                        })
                    }
</code>
ele faz com que se o cubo estiver um pouco pra cima do chao, e o jogador estiver colidindo com ele e pular, ele cai no void, pois a logica de nao deixar ele ultrapassar o objeto joga ele pra baixo, e ultrapassa o chao


# Objetos podem carregar outros objetos em cima dele
criar uma lógica que quando um objeto estiver em cima de ouro objeto, .. se o objeto na qual ele está em cima de mover, os objetos que estão em cima dele vão todos se mover também, para simular que o objeto que ele está se apoiando o está carregando

# Anexos
(Um mesmo Objeto pode estar em vários attachs)

Dettach( at ) = desanexa o objeto atual do objeto AT a qual ele anteriormente foi anexado 

DettachFromAll() = desanexa o objeto atual do objeto de todos os objetos aos quais ele está anexado.

getAttachments() = que simplesmente retorna os attachements do objeto 

haveAttachment( nome ) ou isAttached( nome ) = que procura se o objeto atual possui um OBJETO específico anexado a ele.

Também posso ter o isAttachedOf( pai ) ,que permite verificar se o objeto atual está anexado a um determinado outro objeto pai

# (FEITO) Escala
Adicionar a possibilidade da escala ser um número 

Ao criar ou importar um objeto, eu posso passar um número pra escala, e isso vai fazer ele definir a escala de X, Y e Z com o mesmo valor

Adicionar as flags scaleReduce em todos os objetos, tanto na criação e importação, pra ficar fácil a manipulação


(09/04/2025 20:44 PM - novas ideias minhas)

# NOVO TIPO DE ATTACHEMENT
Criar um sistema de attachements diferente alternativo

Um objeto objectAttachement vai ter uma nova propriedade chamada "Type", que vai poder ser tanto "local" quanto "global"

A diferença entre os dois vai ser a seguinte: no local, é feito um attachement igual já está sendo feito, onde a posição do anexo está em torno do objeto pai.

Já o global o objeto anexado vai ter uma posição independente na cena. Porém, quando o objeto pai se mover, esse objeto anexado vai receber essa movimentação como uma adição de posição, que pode até mesmo ser um DELTA OU DIFERENÇA DE POSIÇÃO referente ao quanto até o objeto pai se moveu em cada eixo.

Implementar algo parecido na lógica de um objeto poder carregar outro

# COLISÃO IMPEDIR MOVIMENTO 
na lógica de verificação de colisão pra impedir movimento ao colidir, ele vai seguir a lógica de colisão padrão, ou de proximidade, porém, PORÉM ele vai ignorar O OBJET-BELOW, pois é desnecessário, e isso muito provavelmente vai eliminar aquele problema de impedir o movimento mesmo longe dos objetos, por que o chão sempre pegava como colisão... Mais nesse caso, a minha lógica de Colisão de minha Engine deve ignorar o chão por que eu tratei isso de outra forma.

# Rotação
Adicionar rotação e getRotation na criação do objeto e também no attachements

# ATTACHEMENT
Possibilidade de criar um attachement sem que o objeto precise existir previamente na cena. Ou seja, por exemplo, ao criar um novo anexo, eu posso também passar um ObjectBase em um atributo opcional chamado "object". E Se eu usar "object", o name e o id vão ser ignorados, ou então, eu posso até pegar o name e id e definir na instância do ObjectBase que eu estou criando especificamente para o anexo. Com a possibilidade de dizer pra Engine qual o tipo do objeto, se ele é uma importação ou um objeto padrão, e quais propriedades ele vai ter 

# Criação de objetos mais simples
Possibilidade de criar objetos de forma muito simples e amigável, usando JSONs, mais isso como forma adicional, sem afetar a forma como a criação de objetos já é feita. Inclusive na hora de criar attachements eu posso também incluir uma possibilidade de criar um objeto específico para o anexo, como na minha ideia anterior, porém usando JSON, ou seja, informando o tipo do objeto, se é uma importação ou um objeto padrão, e os atributos, tudo num JSON só

# OBJETOS DESLIZAR EM ESCADAS E SUPERFICIES INCLINADAS: 
Adiconar esse comportamento, pra identificar quanto um objeto esta inclinado, e os objetos em cima dele podem deslizar descendo pra baixo

# CRIAR UM SISTEMA DE MIRA DE OBJETO: 
Ao apontar o meu cursor para um objeto ao longe dentro de um raio de alcance, eu conseguir obter quais são os objetos que estão dentro desse raio que eu estou apontando. Pra isso usar caixas imaginarias, como o ImaginaryObject

# Mais eventos
(FEITO) EVENTO onCreate no ObjectBase, que ao criar um objeto dispara uma função JavaScript

# Otimização do calculo de fisica
Aplicar as verificações mais pesadas apenas se os objetos possivelmente colidem
isso descarta varios objetos que obviamente não colidem

11/04/2025
# Criar evento ONCE, que executa uma função só uma vez
# Criar evento PERIODIACAL, que executa uma função de tantos em tantos milisegundos

# Lista de colisao e proximidade por objeto 
a cena vai ter um atributo JSON collisions com chave e valor.
Cada chave vai ser o id de um objeto e o valor vai ser suas respectivas colisões

Mapear:

  Por id
  Por nome
  Por classe

# Métodos de consulta de colisão e proximidade
(FEITO) métodos de consulta de colisão e proximidade dentro dos objetos:

  isCollisionOf( outroObjeto )

  isProximityOf( outroObjeto )

  getCollisions()
  getProximity()

      retorna todos os objetos proximos ou colidindo.
      podendo expandir o alçance passando um parametro de limites, fazendo uma nova verificação em tempo real

  e inclusive incluir métodos que permitam verificações novas: que permitam especificar um range especifico.
  Em cada um desses métodos, se eu passar um segundo parametro, eu posso dizer que eu quero um range diferente do atual, e isso vai resultar numa nova verificação

Que vão ser funções especificas que ao invez de rodar o teste de colisão, vai apenas obter isso dos JSONs que a Engine está sempre mapeando

BUG: As vezes a colisao fica ocilando. Ou seja, ele detecta sim que o objeto esta colidindo ou proximo dele, e inclui na tabela de colisoes desse objeto na cena,
PORÈM, OS OUTROS OBJETOS FICAM SEMPRE lÀ
MAIS O CUBO QUANDO CHEGA PERTO APARECE, MAIS DEPOIS SOME, DEPOIS APARECE DENOVO, ELE FICA OCILANOD

MOSTRANDO NO CONSOLE DA NOTAR ISSO:
FICA SEMPRE UM SIM E UM NÂO
OU SEJA, UM APARECE O CUBO, E O OUTRO EM SEGUIDA NÂO
AI O PROXIMO APARECE, AI O OUTRO NÂO, E ISSO SE REPETE


# Configurações de limites de colisão e proximidade globais na cena
Permitir que, além do ProxityBounds do propio objeto, eu tambem vou poder ter um ProxityBounds para colisao e proximidade na cena,
e isso vai se tornar o padrão para todos os objetos, exceto para os que tiver ProxityBounds especificos


# Fisica de rotação
12/04/2025
Enquanto o objeto estiver caindo, ele vai se rotacionar levemente de forma aleatoria para cada um dos lados(ou levando em conta a força do vento ou o impulso do empurrão, que nesse caso vai inclinar o objeto para a direção esperada)

Quando o objeto cair no chão, ele vai parar de se rotacionar aleatoriamente, e rotacionar até atingir um ponto de rotação adequado.
Exemplo: se ele tiver uma rotação inclinada perto da posição XYZ alinhada(0,0,0), ele vai terminar de alinhar, meio que rodando o X e Z levemente, até parar e ficar totalmente alinhado.

Se ele tiver bem longe da posição XYZ alinhada(0,0,0), ele vai tombar pra alguma direção(aleatoria ou por tendencia como do a força do vento ou o impulso do empurrão, que nesse caso vai inclinar o objeto para a direção esperada)


# Força do vento
O vento vai poder empurrar objetos e o jogador automaticamente, dependendo do peso deles, e do peso dos objetos
Tambem o jogador vai ter um peso

# Força do vento na queda
(FIZ) Na queda o vento empurra levemente objetos alterando a posição deles.
Deixar isso mais realista.
(FEITO) ADICIONAR UM NOVO VETOR PARA CONTROLAR O DESLOCAMENTE X Y Z DESSE MOVIMENTO AO CAIR EM FUNÇÂO DO VENTO

(FIZ) TROCAR ISSO por somarVelocity, e criar atualização de movimento do objeto para permitir acompanhar força, e desaceleração

<code>
//O vento tambem empurra um pouco na queda
//IDEIA: TROCAR ISSO por somarVelocity, e criar atualização de movimento do objeto para permitir acompanhar força, e desaceleração
this.somarPosition({
    x: randomX + ( ((wind.deslocationTrend || {}).x || 0) + (wind.orientation.x  || 0 ) * ((wind.intensity || {}).x || 1) ),
    y: randomY + ( ((wind.deslocationTrend || {}).y || 0) + (wind.orientation.y  || 0 ) * ((wind.intensity || {}).y || 1) ),
    z: randomZ + ( ((wind.deslocationTrend || {}).z || 0) + (wind.orientation.z  || 0 ) * ((wind.intensity || {}).z || 1) )
});
</code>

(FIZ) ADICIONAR ATUALIZAÇÂO DE MOVIMENTO DO OBJETO, USANDO ESSE VELOCITY, O OBJETO VAI IR ANDANDO DE FORMA REALISTA COM ESSA ACELRAÇÂO, E TAMBEM VAI DESSACELERANDO GRADUALMENTE, PERDENDO VELOCIDADE, E PARANDO DE SE MOVER



# Objetos quicam
Alguns objetos podem quicar ao tocar no chão, e vão perdendo força

# Detectar objetos acima e abaixo, dos lados,
Na logica de detectar objetos proximos, reaproveitar o mesmo loop para mapear essas outras coisas de sentido
object.getLeftCollisions()
object.getRightCollisions()
object.getLeftProximity();
object.getRightProximity();

isso pra cada um dos lados X Y Z

13/04/2025
# Quando objetos colidem em X e Z
Quando objetos colidem em X e Z, eles vão subtrair a velocidade ao invez de zerar,
para simular a perda de velocidade ao bater por exemplo.

# Inclinação do terreno vai afetar velocidade
Certos terrenos inclinados podem aumentar ou diminuir a aceleração naturalmente

# Objetos podem ter movimentação simples SEM FISICA
(FIZ) Adicionar um outro tipo de movimentação alternativo, sem usar fisica

# Usar uma lógica deltaTime, para poder deixar os movimentos fluidos independente do FPS do jogo

14/04/2025
# Novas ideias
(FIZ) Um objeto pode carregar o outro que estiver em cima dele

Se um objeto em alta velocidade colidir com outro objeto, acontece empurrão dele pra pra frente 

Se um objeto em alta velocidade bater num Objeto com massa muito maior que a dele, ou um objeto estático, como uma parede por exemplo, esse objeto que bateu vai perder um pouco da aceleração, e vai recochetear(voltar) para traz na direção oposta da colisão 

Um objeto vai poder ter física de bola, que vai fazer o objeto quicar quando cair no chão

BUG: Por causa do frame delta, se o jogador e os objetos estiverem caindo e eu abrir a tela de outro aplicativo enquanto o jogo está rodando no naveador, quando eu volto, eles não colidiram com o chao, e estão caindo infinitamente no void

# DESACELERAÇÂO QUE LEVA EM CONTA A MASSA DO OBJETO COM FORÇA DELE
Aplicar na física de desaceleração uma desaceleração que leva em conta a massa, ou seja que leva em conta o peso do objeto. Ou seja quanto mais pesado e mais velocidade ele tiver atingido, mais rápido ele vai atualizar a posição dele e MAIS LENTO vai ser pra ele desacelerar

NA PRATICA EU SÒ PRECISO CRIAR A LOGICA QUE quanto mais pesado e mais velocidade ele tiver atingido, MAIS LENTO vai ser pra ele desacelerar

O PROBLEMA ESTÀ SENDO QUE A DESACELERAÇÂO È SEMPRE MUITO RAPIDA
em alguns casos pode ser, mais, nem sempre. Precisa levar isso em conta

18/04/2025
BUG: O bug de alguns objetos ficarem quicando sem parar, tremendo, quando caem em cima de outros objetos é por causa de escala
ao usar o scaleReduce ou criar objetos com escala definida, isso afeta a lógica de colisão e não fica muito bom, gerando bugs como esses
é isso que afeta tambem o isFalling, quando o cubo por exemplo cai em cima de outro cubo achatado com escalas diferentes, as vezes o cubo fica tremendo quicando, sendo impedido de ultrapassar o Y, porém ao mesmo tempo, tremendo. ele ficando cainda/não caindo, muito rapidamente, talves pela correção de posição

19/04/2025
Na minha Engine O que faz o cubo e outros objetos ficarem quicando é a logica de colisão(mais especificamente a lógica dos objetos cairem com a gravidade no updatePhysics)
Ao levar em conta apenas as escalas Y sem dividir por algum valor, esse problema parou
<code>
                        this.setPosition({
                            y: objetoAtualCena.getPosition().y + (objetoAtualCena.getScale().y) + 0
                        });

</code>
Isso funciona, mais afeta a lógica do pulo do jogador, tornando o pulo quase inesxistente, e os cubos e objetos embora não quiquem, eles e a colisão funcione melhor com outros objetos, a colisão no eixo Y com o chão fica bugada ainda, fazendo os objetos atravessarem um pouquinho o chão, por causa da escala dele.
EU AUMENTEI A ESCALA DO CHÂO PARA 50, e ficou bom, ficou melhor pelo menos. Mais ainda não é o que eu queria.
PORÈM O JOGADOR CONSEGUE ATRAVESSAR UM POUCO O EIXO Y DA CAIXA AO FICAR EM CIMA DELA

Se eu tento fazer algo como:
<code>
this.setPosition({
                            y: objetoAtualCena.getPosition().y + (objetoAtualCena.getScale().y) + (this.name == 'Player' ? this.getScale().y : 0)
                        });
Fica melhor, mais o jogador fica toda hora sendo jogador pra cima e caindo até o chão, e depois é jogado pra cima denovo.
Ai o problema de ATRAVESSAR UM POUCO O EIXO Y DA CAIXA NÂO OCORRE, MAIS AO FICAR EM CIMA DA CAIXA O JOGADOR AINDA QUICA TREMENDO                       
</code>

Remover o scaleReduce tambem ajudou um pouco.
O maior problema tem sido as escalas dos objetos
A colisão funciona com escalas sim, e redução de escala ou aumento de escala, mais é mais complicado de ajustar

<code>
                /**
                * Se o ESTE OBJETO tiver colisão habilitada e colidir com o TAL outro OBJETO, ele corrige a posição Y DESTE OBJETO, para impedir ultrapassar o TAL outro OBJETO
                */
                if( (objetoAtualCena.objProps.traverse != true) &&
                    (objetoAtualCena.objProps.collide == true || objetoAtualCena.objProps.collide == undefined ) && 
                     objetoAtualCena.id != this.id && 
                     isProximity( this, objetoAtualCena, 0.6, true, false ) === true 
                ){
                    //Corrige a posição Y do objeto pra não ultrapassar o Y do objeto
                    //BUG: Se o cubo ficar em baixo da caixa e subir um pouquinho Y dele, a caixa corrige sua posição e FICA EM CIMA DO CUBO
                    if( this.getPosition().y > objetoAtualCena.getPosition().y )
                    {
                        this.setPosition({
                            y: objetoAtualCena.getPosition().y + (objetoAtualCena.getScale().y) + (this.name == 'Player' ? 0 : 0)
                        });
</code>
essa foi uma das ultimas tentativas que eu fiz. Mais ainda não consegui fazer o que eu quero.


BUG MAIOR: Ao tentar deixar a colisão mais precisa, o cubo ao colidir(por exemplo somando a velocidade e o objeto vir correndo e bater) com a caixa, enquanto ambos estão em cima de outro objeto, ao invez de empurrar ela, a caixa cai pra baixo, atravessando esse objeto que ela tava em cima
Isso não só por causa da logica de colisão que tentei mexer, por que eu testei com a minha lógica anterior, e aconteceu esse mesmo bug porém de um jeito um pouco diferente,
ESSE PROBLEMA DELE ATRAVESSAR SÒ ACONTECE QUANDO OS OBJETOS ESTAO EM CIMA DE OUTRO OBJETO(OU SEJA, EM UM NIVEL Y MAIS ALTO QUE O DO CHÂO PRINCIPAL)
Eu acho que ele pode estar bugando alguma correção de posição em algum tipo de colisão e jogando a assim caixa para o "Y mais baixo", que deve ser o que a Engine reconhece e impede ultrapassar.

BUG: Ao tentar deixar a colisão mais precisa, apenas o jogador fica tremendo e quicando a camera ao colidir com algum chão.

BUG: por causa do BUG MAIOR, se um objeto cair em cima de outro, enquanto estão em cima DE OUTRO OBJETO(OU SEJA, EM UM NIVEL Y MAIS ALTO QUE O DO CHÂO PRINCIPAL), o objeto que caiu NÂO fica em cima do outro, como esperado, e pior, ele fica tremendo muito, e tambem ocorre outro BUG, o objeto que caiu tem sua posição ajustada(pela lógica de correção de posição) e fica mais pro lado, sendo que a posição Z ou X dele não deveria mudar nesse caso.

BUG: Quando um objeto empurra outro(por exemplo somando a velocidade e o objeto vir correndo e bater), Assim como no BUG MAIOR, SE ESTIVER EM CIMA DE OUTRO OBJETO(OU SEJA, EM UM NIVEL Y MAIS ALTO QUE O DO CHÂO PRINCIPAL), ele ao invez de só empurrar o objeto, tambem altera a posição Z e X na correção de posição, e isso não deveria acontecer.
E no chão principal isso não acontece

# 19.04.2025
Fiz uma nova mudança, simplismente comentando o código que faz a correção da posição Y na função updatePhysics
BUG: Com essa mudança, de vez enquanto os objetos afundam um pouquinho ao cair, e isso varia um pouco tambem.

BUG UM POUCO PIOR: As vezes o jogador vai no void quando ele cai no chão principal
Isso acontece por causa do bug anterior, de vez enquanto os objetos afundam um pouquinho ao cair INCLUSIVE O JOGADOR
(Se eu aumentar um pouco a escala do chão por exemplo o jogador afunda um pouco E PARA mais não cai)


BUG UM POUCO PIOR: Por exemplo: Quando a caixa cai em cima do cubo reta ou mais pro lado direito não acontece nada, fica tudo ok, ela fica em cima do cubo como esperado
PORÈM, se a caixa cair em cima do cubo mais pelo lado esquerdo, a posição Z do cubo é ajustada, deslocando ele levemente pro lado direito.
Isso não deveria acontecer
PORÈM ESSE BUG EU TESTEI E JÀ ACONTECIA NA MINHA VERSÂO ANTIGA
porém parece que isso piorou um pouco com as mudanças que fiz hoje

PORÈM ISSO acontece provavelmente por que, como eu removi a correção da posição Y pra ele parar de tremer, as vezes ele pode afundar um pouquinho ao cair, e ai isso conflita com a outra logica de corrigir posição X e Z na lógica de colisão, o que pode fazer o cubo
As vezes o vento joga a caixa mais pro lado que o bug não afeta, e as vezes joga mais pro lado esquerdo que é o lado que esse bug está ocorrendo

BUG: Se o cubo estiver empurrando a caixa no eixo Z, isso funciona, porém
POREM QUANDO O CUBO E A CAIXA CHEGAM NO VOID(ENQUANTO O CUBO ESTÀ COLIDINDO COM A CAIXA EMPURRANDO ELA), a caixa fica grudada no cubo, e ambos não caem no void
ESSE BUG COMEÇOU A ACONTECER DEPOIS ULTIMA MUDANÇA QUE EU FIZ NO updatePhysics:
O objectBelow ainda é o chão mesmo ele estando no void, e o objectBelow do cubo se torna a caixa, E ISSO TA ERRADO
<code>
                /**
                * Se o ESTE OBJETO tiver colisão habilitada e colidir com o TAL outro OBJETO, ele corrige a posição Y DESTE OBJETO, para impedir ultrapassar o TAL outro OBJETO
                */
                if( (objetoAtualCena.objProps.traverse != true) &&
                    (objetoAtualCena.objProps.collide == true || objetoAtualCena.objProps.collide == undefined ) && 
                     objetoAtualCena.id != this.id && 
                     isProximity( this, objetoAtualCena, 0.8, true, false ) === true 
                ){
                    //Corrige a posição Y do objeto pra não ultrapassar o Y do objeto
                    //BUG: Se o cubo ficar em baixo da caixa e subir um pouquinho Y dele, a caixa corrige sua posição e FICA EM CIMA DO CUBO
                    //Diz que o objeto parou de cair
                    this.isFalling = false;
                    this.groundY = this.getPosition().y; // A posição da ultima colisão
                    this.objectBelow = objetoAtualCena;
                    this.lastObjectBelow = objetoAtualCena;

                    [...]
</code>

ANTES TAVA:
(https://github.com/WilliamJardim/Engine/blob/838efff76dd5b7b597ae450de8897bf74d98430a/src/engine/core/ObjectBase.ts)
<code>
                /**
                * Se o ESTE OBJETO tiver colisão habilitada e colidir com o TAL outro OBJETO, ele corrige a posição Y DESTE OBJETO, para impedir ultrapassar o TAL outro OBJETO
                */
                if( (objetoAtualCena.objProps.traverse != true) &&
                    (objetoAtualCena.objProps.collide == true || objetoAtualCena.objProps.collide == undefined ) && 
                     objetoAtualCena.id != this.id && 
                     isProximity( this, objetoAtualCena, 0.8, true, false ) === true 
                ){
                    //Corrige a posição Y do objeto pra não ultrapassar o Y do objeto
                    //BUG: Se o cubo ficar em baixo da caixa e subir um pouquinho Y dele, a caixa corrige sua posição e FICA EM CIMA DO CUBO
                    if( this.getPosition().y > objetoAtualCena.getPosition().y )
                    {
                        this.setPosition({
                            y: objetoAtualCena.getPosition().y + (objetoAtualCena.getScale().y/1.4) + (this.getScale().y/1.4)
                        });

                        //Diz que o objeto parou de cair
                        this.isFalling = false;
                        this.groundY = this.getPosition().y; // A posição da ultima colisão
                        this.objectBelow = objetoAtualCena;
                        this.lastObjectBelow = objetoAtualCena;
                    }

                    [...]
</code>
ASSIM COMO TAVA ANTES NÂO DAVA ESSE BUG, MAIS OCORRIA OUTROS BUGS QUE EU TAMBEM NÂO GOSTEI NEM UM POUCO.

Esse bug ocorre por que, a zona de colisão padrao agora é a posição + escala + 0.8, então, qualquer objeto proximo(dentro dessa zona) vai settar o groundY, isFalling e objectBelow

SE EU DIMINUIR A ZONA DE PROXIMIDADE, ESSE PROBLEMA SE TORNA MENOS FREQUENTE MAIS AINDA ASSIM ACONTECE
QUANTO MAIOR A ZONA DE PROXIMIDADE MAIS CHANCES TEM DE ACONTECER

ESSE BUG AINDA OCORRE MAIS MELHOROU UM POUCO COM MINHAS MUDANÇAS que fiz



BUG: Se o cubo estiver empurrando a caixa no eixo Z, e o jogador estiver na frente da caixa isso funciona
POREM SE O CUBO CONTINUAR AUMENTANDO A VELOCIDADE EMPURRANDO CADA VEZ MAIS A CAIXA, O JOGADOR COMEÇA ATRAVESSAR MAIS O EIXO Z OU X DA CAIXA
Aparentemente isso tambem piorou um pouquinho depois da ultima mudança que fiz.

BUG: De vez enquando, quando a caixa cai no chão, ela fica afundada no chão

BUG UM POUCO PIOR: Por exemplo: Quando a caixa cai em cima do cubo reta ou mais pro lado direito não acontece nada, fica tudo ok, ela fica em cima do cubo como esperado
PORÈM, se a caixa cair em cima do cubo mais pelo lado esquerdo, a posição Z do cubo é ajustada, deslocando ele levemente pro lado direito.
Isso não deveria acontecer
PORÈM ESSE BUG EU TESTEI E JÀ ACONTECIA NA MINHA VERSÂO ANTIGA
mais piorou depois da minha mudança

ESSE ERRO ACONTECE EM ALGUM MOMENTO POR CAUSA DESSE TRECHO DE CÒDIGO QUE CORRIGE A POSIÇÂO
é ele quem causa o ajuste indevido na caixa em certos momentos ao cair em cima do cubo
<code>
// Se houver sobreposição em algum dos eixos então houve colisão
                            if (sobreposicaoX > 0 && sobreposicaoZ > 0 ) 
                            {
                                //Se for o jogador não quero usar tolerando pra não bugar a posição dele
                                //Mais se for objetos, eu uso pra evitar eles "grudarem" ao colidirem
                                const tolerancia = this.name != 'Player' ? 1.2 : 0.0;

                                // Corrigir no eixo de menor sobreposição (para evitar "grudar" no canto)
                                if (sobreposicaoX < sobreposicaoZ) {
                                    // Empurra no X
                                    if (posA.x < posB.x) {
                                        this.getPosition().x -= (sobreposicaoX + tolerancia);
                                    } else {
                                        this.getPosition().x += (sobreposicaoX + tolerancia);
                                    }
                                    //this.getVelocity().x = 0;

                                } else {
                                    // Empurra no Z
                                    if (posA.z < posB.z) {
                                        this.getPosition().z -= (sobreposicaoZ + tolerancia);
                                    } else {
                                        this.getPosition().z += (sobreposicaoZ + tolerancia);
                                    }
                                    //this.getVelocity().z = 0;
                                }

                                this.isMovimentoTravadoPorColisao = true;
                            }
</code>


BUG: Quando um objeto está em cima de outro objeto, ele não recebe força
a força que é aplicado sobre ele usando o somarVelocity por exemplo tem um efeito minimo quase inperceptivel
E ESSE BUG OCORRE POR CAUSA DESSE TRECHO DE CÒDIGO QUE SOMA AS FORÇAS PARA FAZER O OBJETO SE MOVER USANDO ATRITO QUANDO ESTA EM CIMA DE OUTRO OBJETO QUE PODE SER MOVER
talvez vou ter que repensar essa logica até mesmo usando algum couldown
<code>
if( objeto.objectBelow != undefined && 
            objeto.objectBelow != null &&
            //O objeto abaixo precisa ter fisica e poder colidir
            objeto.objectBelow.objProps.havePhysics == true &&
            objeto.objectBelow.objProps.collide == true &&
            //O objeto atual tambem precisa ter fisica e poder colidir
            objeto.objProps.havePhysics == true &&
            objeto.objProps.collide == true &&
            //Essa regra não vale para chãos
            objeto.objectBelow.haveClass('ground') == false
        ){
             const esteObjeto       = objeto;
             const objetoAbaixoDele = objeto.objectBelow;
             
             const coeficiente     = 0.5; // pode ser dinâmico
             const massa           = esteObjeto.getMassaTotal();
             const normal          = massa * Math.abs(gravity);
             const atritoCalculado = coeficiente * normal;

             const deltaVelocidadeX = objetoAbaixoDele.getVelocity().x - esteObjeto.getVelocity().x;
             const deltaVelocidadeZ = objetoAbaixoDele.getVelocity().z - esteObjeto.getVelocity().z;

             const forcaX = Math.min(Math.abs(deltaVelocidadeX), atritoCalculado) * Math.sign(deltaVelocidadeX);
             const forcaZ = Math.min(Math.abs(deltaVelocidadeZ), atritoCalculado) * Math.sign(deltaVelocidadeZ);

             /**
             * Acompanha o movimento do objeto que ele está em baixo 
             */
             esteObjeto.getVelocity().x += forcaX;
             esteObjeto.getVelocity().z += forcaZ;   
        }      
</code>

BUG: Se o objeto recebe uma velocidade e começa a acelerar, ao colidir com outro objeto,
ao invez dele apenas seguir acelerando e empurrando o outro objeto, como antes. Ele faz algo estranho: ELE FICA BRECANDO/ENROSCANDO EM CERTOS MOMENTOS
não é por causa do código acima sobre o movimento usando atrito. Mais sei que tambem ocorre na hora de corrigir a posição na colisão
ESSE BUG JA ACONTECIA NO MEU ANTIGO TAMBEM

BUG: Se ambos objetos cairem meio que juntos, por estarem proximos dentro do isProximity das logicas, isso faz com que a gravidade seja aplicada de forma igual pra ambos, e que fiquem caindo juntos devagarzinho por que eles ficam alternando entre caindo/não caindo

BUG: Quando tem dois objetos emfileirados, e um outro objeto em cima do ultimo(meio de lado),... se o primeiro objeto vem com uma velocidade, esbarrando/empurrando o objeto da frente, .... o objeto que esta em cima dele sai de cima dele vai pra cima do objeto que está empurrando ele(isso foi algo NÂO PROGRAMADO NA LOGICA DE ATRITO), E tem momentos em que o objeto que está em cima desse outro objeto afunda mais um pouco quase na metade do objeto e fica meio de lado. Isso pode ter ocorrido por pelo menos tres hipoteses:

   (1) - A lógica de queda afundou um pouco o objeto, e a logica de correçao de posição X e Y acabou ajudando a ficar mais de lad
   (2) - A logica de queda afundou um pouco o objeto, e a outra logica do atrito deslocou o objeto um pouco mais pro lado
   (3) - Um pouco dos dois


# NOVAS IDEIAS 19/04/2025
IDEIA: Criar a propriedade objectAbove, similar ao objectBelow, porém que armazena o objeto em cima do objeto atual


# 19.04.2025 - mudança que depois eu desfiz por que não deu certo como eu queria:
Fiz umas mudanças, e melhorou um pouco, mais afetou a logica:
https://github.com/WilliamJardim/Engine/commit/8c015d3b1342093495d9f34f93e300fc49deca10

    NOVOS BUGS:

    BUG: AGORA A CAIXA FICA ULTRAPASSANDO A METADE DO CHÂO 
    Isso ainda é um problema de lidar com escalas no eixo Y.

    BUG: Um objeto ao colidir com o jogador empura ele como esperado PORÈM AO CORRIGIR A POSIÇÂO ELE ACABA EMPURRANDO O JOGADOR PRO LADO AO INVEZ DE APENAS EMPURRAR ELE PRA FRENTE, isso é alguma coisa na logica de impedir movimentos na colisão que ajusta a posição
    ISSO ACONTECE SÒ QUANDO O JOGADOR E O OBJETO AMBOS ESTÂO EM CIMA DE OUTRO CUBO GRANDE(OU SEJA EM CIMA DE OUTRO CHÂO)
    mais no chão principal isso não ocorre, ele empura corretamente SOMENTE NO CHÂO PRINCIPAL
    JA EM CIMA DO SEGUNDO CUBO(que se torna o segundo chão, ele acontece esse bug e além de empurrar e joga o jogador pro lado ao invez de apenas empurrar pra frente)
    ESSE MESMO BUG ACONTECE NÂO SÒ COM O JOGADOR MAIS COM QUALQUER OUTRO OBJETO, TIPO A CAIXA POR EXEMPLO
    mais aparentemente o jogador é o mais afetado por esse bug

    19/04/2025
    BUG: Melhorei um pouco a colisão, 
    PORÈM, AS VEZES OS OBJETOS AINDA AFUNDAM UM POUCO AO CAIR, AS VEZES MAIS OUTRAS MENOS
    TEVE VEZES QUE ELA CAIU E FICOU BEM AFUNDADA NO CHÂO

    BUG: A camera fica muito proxima do chão na maiora das vezes

    ------------------------------
    BUG: Dependendo da posição Y do objeto, o jogador sobe em cima do objeto
    por exemplo, por causa desse "BUG: AS VEZES OS OBJETOS AINDA AFUNDAM UM POUCO AO CAIR, AS VEZES MAIS OUTRAS MENOS", dependendo de como a caixa está afundada, só de eu colidir com ela eu já sou teleportado pra cima da caixa, MAIS AS VEZES ISSO NÂO ACONTECE, DEPENDE DO NIVEL DE AFUNDAMENTO DA CAIXA AO CAIR

    SE HÀ SOBREPOSIÇÂO Y NA COLISÂO, ELE JA TELEPORTA O JOGADOR PRA CIMA DO OBJETO

    BUG: Isso eliminou a lógica do objeto poder para em cima de outro quando cair em cima de outro.

    BUG: Isso causou que objetos grudavam ao colidir, afetando ou dificultando algumas logicas como o de mover objetos em cima do outro

    **EU VOLTEI O CÒDIGO PRA TRAZ, E REMOVI ESSAS MUDANÇAS, mais se eu tentar fazer elas obviamente vai acontecer denovo.**



# IDEIA 25/04/2025
Nos Attachments adicionar uma propriedade ignoreAttacherCollision, que permite desativar a colisão do objeto em anexo COM O OBJETO DONO DESSA RELAÇÂO

NO movimentSinalyzer, criar uma vericação melhor e mais profunda, que verifica os N ultimos frames, se o objeto se moveu(ou se a posição X, Y e Z do objetou mudou do frame antigo para o frame atual), e para qual direção. Essa pode ser mais pesada, então, ela pode ser opcional
Isso vai ajudar a quando mesmo eu usar métodos como setPosition ou somarX, a Engine saiba onde o objeto estava antes, onde esta agora, e para qual direação ele se moveu, isso vai ajudar no calculo das fisicas de impacto e empurrão, pra ficar bem amplo

Tambem criar um historico dos ultimos N frames, de cada objeto, para poder acessar informações dele, como posição, rotação, estados, etc. posso até criar esse historico direto na cena, com informações completas da cena completa, nos ultimos N frames


