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


# BUG 26.04.2025
As vezes, quando um objeto com fisica empurra outro, o jogador e todo o resto do cenario se move para frente

# BUG 26.04.2025
Fazer com que a antiga lógica de impedir movimento ao colidir(ou seja, a correação de posição) QUE NÂO USA FISICA seja usada apenas se os objetos em questão não tem fisica, se é um movimento direto sem fisica.
SO PODE VALOR PARA OBJETOS COM MOVIMENTOS SEM FISICA
por que se for uma colisão com força fisica, a logica de empurrão(reagir ao impacto) já está funcionando
TALVES ATÈ CRIAR UMA LOGICA DE CORREÇÂO DE POSICAO QUE RODE NA CENA MESMO, NO MESMO ESTILO DA LOGICA updateCollisionReactions

# IDEIA 26.04.2025
Adicionar massa na logica do empurrão do updateCollisionReactions, pra ter logica de impacto realista

# IDEIAS novas
Quando um objeto estático (ou com movimento estático) colidir com um objeto com física, ... Em vez de só corrigir a posição X ou Z, ele pode aplicar uma força da direção correspondente enquanto ele estiver colidindo, porém, com um limite de velocidade.um comportamento de empurrar objetos devagarinho andando pra frente e tocando neles
Criar resposta a colisão, tanto via força, quando tem impacto de um objeto com outro. Tanto também quando um objeto com movimento simples/estático colide com outro objeto com física como falei e outras coisas
Fazer isso no mesmo estilo do que eu já fiz com empurrões de física.
Porém muito bem pensado pra não atrapalhar nenhuma lógica,  pra objetos que recebem movimento sem física

## OBJETOS PRESOS
Se um objeto tiver preso em outro objeto, e esse objeto preso receber uma força/velocidade, então, essa força será aplicada/transferida para o objeto pai(a qual preso)
Quando o objeto receber força, ele vai somar não apenas a posição, mais também a rotação, pra ter uma rotação baseada em velocidade. O que vai causar uma rotação gradual, forte, ou rápida, dependendo da força, da orientação,etc... E ainda vai ter o mesmo efeito de desaceleração

A rotação do objeto vai influenciar a direção pra onde ele vai.
Então, ao receber força em X por exemplo, ao invés dele sempre andar pra frente, .. ele vai poder andar meio diagonal, dependendo da rotação/ângulo que o objeto está

Outra ideia: Sempre que o objeto receber uma colisão, ele vai calcular em que posição o objeto que colidiu com ele bateu... Ai, ele vai se deslocar com força no eixo correspondente, porém levando em conta a direção da batida. Por exemplo se foi de lado, ele vai receber uma força equivalente também no lado correspondente.
(Derrepente essa força pode estar espelhando a força principal em X ou Z por exemplo)

Adicionar que um objeto pode estar amarrado em outro. E se isso acontecer e ele receber uma força,... Ao invés de mudar posição, essa força vai agir apenas na rotação

Adicionar que a colisão leva em conta a rotação dos objetos 

Se necessário criar outro medo collisionAndRot
Pra verificar também a rotação na colisão 
Ao invés de modificar o método de colisão que já tem

Objetos em cima de objetos rodando podem se mover de acordo com a rotação deles
Criar que ao encostar em outro objeto, pela diagonal e ir andando devagar, ele vai empurrando o objeto na diagonal.
E pra isso criar uma mecânica pra empurrar objetos sem física. Se encostar nele e sair andando. Algo que não conflite com a física que possa ser desativado por objeto, e não afeta a correção de posição

# ACHATAMENTO
Depois criar um sistema de achatamento 

Tipo, se um objeto colidir em alta velocidade com outro, dependendo do material dele, ele vai receber um achatamento(mudança de escalas X, Y, Z realista, usando velocidade e física)

# REBOTE
Quando um objeto bate em outro, ele perde velocidade, e essa parte que ele perdeu se torna a velocidade do objeto que recebeu a colisão.

Isso vai ser mais realista

*Lógica de rebote*

Se um objeto se chocar com alguém objeto que não tem física, tipo uma parede. Ou então, se chocar com alguém objeto muito pesado ou que tenha uma força maior que a dele, .. então este objeto que se chocou vai perder 73% da sua velocidade. E essa velocidade vai ser invertida multiplicando por -1 

Isso vai criar efeito de rebote.

Aí se o objeto que se chocar tiver uma força maior que a do objeto que ele colidir, então, o objeto que recebeu a colisão vai ganhar velocidade no eixo correspondente.

Talvez nisso eu posso até fazer uma lógica de transferência de velocidade, para o objeto que se chocou perder um pouco tipo 20% da velocidade e isso ser transferido para o objeto que recebeu a colisão.

Quando um objeto bate em outro, ele perde velocidade, e essa parte que ele perdeu se torna a velocidade do objeto que recebeu a colisão.

Isso vai ser mais realista


# IMPEDIR OBJETOS GRUDADOS (SE EU PRECISAR)
Ideia pra corrigir bugs dos objetos ficarem grudados: adicionar uma exceção para que se os objetos estiverem no ar, ele teleporta mais pra frente, pra evitar o grude
Duas ideias que tive pra corrigir dois bugs terríveis

1:
Pra corrigir os objetos afundando, eu posso tentar limitar a posição que o Y do objeto pode chegar, quando está caindo ou quando eu faço ele parar de cair. Eu posso também incluir um código que define a posição do objeto só que, de um jeito diferente, apenas travando a posição Y que o objeto pode chegar.

2:
Pra corrigir aquele bug que um objeto fica grudado no outro ao ser empurrado e quando chega no void eles se tornam chão delas mesmos e não caem, .... Eu posso fazer a lógica de corrigir posição X e Z usar tipo um Timeout, pra não ficar toda hora mexendo na posição, e isso daria mais tempo pro objeto poder ter sua posição afetada pela física do mundo ou por outros objetos que afetarem ele

3:
Também posso aplicar a mesma ideia de limitar a posição Y nos eixos X e Z também, ao invés de definir posição, monitorar pra limitar

4:
Não descarte. Que é aquela minha outra ideia de limitar o movimento. Talvez criando um gerenciador de posições personalizado que eu vou poder negar a movimentação de certos objetos dependendo das regras que eu criar.

5:
Essa aqui, pode ser útil também

# (RESOLVIDO) BUG
10/05/2025
Ideia pra poder corrigir aquele bug que o objeto não pode receber uma aceleração externa em Y:

Adicionar que por padrão, toda vez que eu chamar o método "somarVelocity", ele vai definir a propriedade "isReceivingExternalAcceleration" como "true", e aí, o código que zera a velocidade não vai ser aplicado, enquanto essa propriedade do objeto não voltar a ser "false"

Isso vai ser controlado via parâmetro do método "somarVelocity(45, true)"

Por padrão vai ser true.

Porém, em usos internos da Engine, ele vai enviar o parâmetro com "false" forçado.

E se for true, e o objeto zerar a velocidade dele, então vai ser false se ele estiver no chão

Shaders:
Tom meio azulado. Bastante saturação nas texturas 
E efeitos e luz Lens flare e luz de mormaço meio roxo

Reflexos:
Cube Map 
Imagens estáticas ou dinâmicas, que vai ser o inverno do que você está vendo, exatamente como está, e meio borrado

11.05.2025
Testar se quando um objeto está subindo pra cima, se um objeto em cima dele sobe junto

(OK FUNCIONA) Testar se enquanto um objeto está caindo, se ele pode receber uma força contrária a gravidade e empurrar pra cima

(OK FUNCIONA) Testar a mesma coisa só que mais específico, .... Quando o objeto nunca caiu no chão, só está no ar. Se eu posso manter ele no ar aplicando força pra cima

# Novas ideias 13/05/2025
Ideia: adicionar sistema de preender objetos em outros.
Onde o objeto preso não vai ter física. Mais vai acompanhar cegamente a posição e rotação do objeto a qual ele está preso

Ideia: usar massa na lógica do impacto

Ideia: adicionar que objetos podem ter uma propriedade chamada "kikassidade", onde quanto maior, mais ele vai quicar ao cair no chão
Também posso adicionar materiais com diferentes propriedades
Pra isso também vou criar a física de quicar no chão , para bolas

Ideia: física de pendurar objetos em corda

Ideia: lógica de pendurar objetos
Quando um objeto estiver pendurado, basicamente, ele vai poder se mover normalmente.
A única restrição que vai haver é de um círculo 360 em volta do ponto de origem. E essa círculo pode ser maior dependendo do tamanho da corda.
Basicamente, o objeto só pode se mover no máximo até cada limite dessa esfera de colisão 360. Se passar disso, ele trava.
E a corda vai também exercer uma força puxando o objeto.
Tipo se ele estiver pra direita, a corda vai estar puxando pra esquerda levemente e com variações aleatórias nos eixos X Y Z pra gerar uma sensação extra.
Assim ele pode ficar balançando de um lado pro outro, livremente, porém restrito a essa esfera

Ideia: explosão com gradiente de força 
A explosão vai ter um ponto central. Nele a força vai ser total.
Durante uma explosão, todos os objetos da cena serão afetados(empurrados pra longe), na direção contrária do ponto de origem(não é uma atração mais sim uma repulsão)
Os objetos mais próximos da origem vai ter muito afetados.
E os objetos mais longe vão ser menos afetados.
De acordo com a proximidade da origem, e também, de acordo com a potência da explosão.
De modo que um raio de explosão(esse gradiente de força) vai poder variar de acordo com alguns parâmetros e também de acordo com a potência da explosão

# 14/05/2025
Ideia: Fisica de objeto ser recocheteado para traz:
Se um objeto se chocar com uma parede, ele vai ser jogado para traz, de acordo com o a força que ele tem
ele perde parte da força e com o resto ele volta pra traz

Ideia: Se um objeto que quica ele bater numa parede, ele pode reagir de forma muito mais exagerada, voltando mais pra traz, 
isso criaria um efeito de uma bola que fica quicando no chão e tambem nas paredes

# 15/05/2025
Na logica de recochetear quando bater numa parede, adicionar que isso vai depender do "kick_rate" e tambem do peso do objeto(ou o impacto dele)

# 16/05/2025
Adicionar aceleração assim:
<code>
  objeto.getAceleracao().x += ALGUMA COISA OU IGUAL A CONSTANTE 

  [... E NAS LOGICAS DE GANHAR VELOCIDADAE]

  objeto.getVelocity().x += objeto.getAceleracao().x;
  objeto.getPosition().x += objeto.getVelocity().x;
</code>

O resto de perder velocidade, transferir velocidade, desacelerar, tudo continua como está
a gravidade tambem vai continuar como está.

Porém, no eixo Y tambem vai ter aceleração, para movimentos

  [... ASSIM NAS LOGICAS DE GANHAR VELOCIDADAE]

  objeto.getVelocity().y += objeto.getAceleracao().y;
  objeto.getPosition().y += objeto.getVelocity().y;

# 16/05/2025
Usar deltaFrame na velocidade e na aceleração tambem, junto com a intensificação
tudo usar deltaFrame(posição, velocidade, aceleração) independente de usar fisica ou não 

# (CRIADO) 17/05/2025 - MELHORIA NA ACELERAÇÂO
IDEIA: Aceleração dinamica e realista:

no ObjectBase, Criar um vetor "força", que vai ter X Y e Z;
Ele vai ser manipulado diretamente pela logica de jogo.

Já o vetor "aceleração(acceleration)", ele vai ser calculado dinamicamente pela propia engine e não vai ser manipulado pelas regras de jogo. Vai ser calculado assim: "aceleração = "força total" / massa

Ai o resto continua o mesmo.


OUTRA IDEIA: Na logica de desaceleração gradual da velocidade, deixar mais realista para que essa desaceleração seja proporcional a velocidade.


# 17/05/2025 - NOVA IDEIA CORDA
Ideia: criar lógica de dois objetos com física poderem ser amarrados por meio de uma corda.
E aí, quando um se move, o outro é puxado junto se a corda estiver esticada.
E a corda só estica quendo um dos objetos faz ela se esticar, se movendo, e, atingido o limite que a corda pode chegar
Na prática não precisa renderizar nenhuma corda. Apenas criar a lógica de uma corda imaginaria, exercendo a física da corda sobre os objetos
Parecido com minha outra ideia de física de corda


# (FAZER) 17/05/2025 - Melhorar reação da colisão do método updateCollisionReactions PRA USAR A MASSA TAMBEM DOS OBJETOS
Usar a massa dos objetos na reação das colisões, ou seja, na transferencia de velocidade e na perca de velocidade dos objetos
Aplicar o princípio da conservação da quantidade de movimento

Calcular o "Momento linear" = MASSA * VELOCIDADE, 
isso é, o quanto de movimento tem

É o momento linear que você usa na transferencia de velocidade e na perca de velocidade dos objetos
Nisso, o que vai se conservar é o "momento linear total"

Precisa calcular o "momento linear total" antes e depois da transferencia/colisão, e ajustar velocidades conforme as massas dos objetos.


# (FAZER) 17/05/2025 - USAR A MASSA DOS OBJETOS PRA CALCULAR A FORÇA DO ATRITO E ARRASTO
usar a massa dos objetos para calcular o atrito(quando o objeto está no chão), e o arrasto(quando o objeto está no ar),
mesmo que a aceleração ou força seja zero, e eu só esteja desacelerando a propia velocidade

# (FEITO) 18/05/2025 - ZERAR O VETOR DE FORÇA NO FINAL DE CADA FRAME
Para impedir movimentos infinitos com força, no fim de cada frame, zerar o vetor de força dos objetos automaticamente,
assim a força vai ser algo momentaneo

# FORCAS PERMANTENTES 20/05/2025
Também Adicionar lógica de força permanente
Um Array de "forças permanentes", que a Engine vai ficar aplicando sem parar..  e eu posso colocar na definição do objeto "forçasPermanentes", e um método somarForcaPermanente"

# ACUMULAÇÂO DE FORÇAS 20/05/2025
Outra ideia sobre acumulação de forças:

Isso significa que em um determinado frame, várias forças podem ser aplicadas ao mesmo tempo sobre um objeto(explosão, molas, atrito, etc...)

E então, só depois a Engine calcula a aceleração assim

Acel = forçaTotal / massa

Por enquanto, a Minha Engine de física eu não programei dessa jeito.

A gravidade eu só uso assim "velocidade += gravidade * DT", mais não tem acumulação nenhuma. Nem usa forças.

Também, nas forças X Y Z, eu eu pego a força do vetor de força, cálculo a aceleração, e aplico somando na velocidade do objeto nos eixos X Y Z. Mais não acúmulo.

O vetor de forças eu zero no fim de cada frame como já mencionei.

Se um dia eu quisesse adicionar isso, eu poderia criar um caminho de IF alternativo, tipo "usarForcasComum" ou "acumularForcas", como booleana, e com isso, determinar se um objeto vai ter ou não acumulação de força ou se vai usar a lógica normal sem acumular nada.

# Ideia: força de rotação 20/05/2025
Criar força de rotação, que vai seguir a mesma ideia aceleração, etc..  só que ao invés de alterar posição e velocidade, ela vai alterar rotação, torque, etc...

Ideia: em colisões, na eu aplico em ambos(força de movimento e força de rotação) em qualquer colisão, mais vai ter casos que a força da rotação vai ser maior que a da movimentação

Se a colisão ocorreu mais pro centro do objeto a força de movimento vai ser maior.

Se a colisão ocorreu mais nas bordas(mais longe do centro), a força de rotação vai ser maior.

Quando mais longe do centro, mais rotação.

E quando mais próximo do centro, mais movimentação.

Dessa forma ambas forças serão calculadas e aplicadas nas colisões

Lógicas do tipo "quanto mais alto for o impacto, maior vai ser o giro"

## Atualizar força rotação
E nessa ideia: eu posso seguir o mesmo cálculo da força linear 

Eu posso ter uma função AdicionarForceRot

E criar uma lógica de updateRotacao, pra atualizar o toque do objeto. E lá usar também aceleração de rotação, velocidade de rotação, e força de rotação, e usar exatamente o mesmo cálculo da força linear só que no contexto de rotação.

Ou seja "acelRotacao = ForcaRotacao / massa", Atualizar velocidade, e depois rotação.

# 21/05/2025
usar delta time na lógica de aceleração e velocidade da movimentação
Na física de resposta a colisão, 
Somar força ao invés de velocidade
E pra somar isso, calcular a força, com base na velocidade

calcular força para tranferir força ao invez de velocidade:
    se ja sei a velocidade e massa e delta time, .... calcular a força(ou seja, converter velocidade em força),
    Pra poder usar no somarForce
    Isso vai criar uma resposta mais realista que leva em conta a massa
    A lógica do AddForce já tá certa. Oq falta é só tranferir de forma realista

# IDEIA GRAVIDADE:
Também,Adicionar que a gravidade não vai ser um número, mais sim um vetor, pra caso eu queira simular gravidade pra outras direção

Nesse caso. A gravidade vai ser um vetor, e cada eixo X Y Z dela vai ficar fazendo uma aceleração na velocidade dos objetos também

Também deixar o sistema de colisões mais automático e menos especial.

Talvez fazendo uma lógica de resposta a colisão mais realista e automática ao meu estilo. Mais que elimine a necessidade de tratar quando um objeto caiu especificamente no chão. Ou seja, a própria lógica de colisão pode cuidar disso


# IDEIA: CONVERSÂO DE VELOCIDADE DE QUEDA EM FORÇAS X Z
Ideia: conversão de velocidade de queda em força em outros eixos X e Z

Quando um objeto cair no chão. Pegar a velocidade Y dele, e calcular uma força a ser aplicada nos eixos X e Z, dependendo, pra poder dizer que quando um objeto cai ele pode acabar se movendo para as direções X e Z 

Isso seria uma força a mais, além da influência do vento.

E ao quicar, automaticamente o objeto iria poder de deslocar para X e Z

.. o mesmo pode valer pra Y. Se existe uma velocidade em X e Z, e o objeto bater numa parede. Ele também pode calcular uma força em Y e aplicar pra fazer o objeto subir um pouquinho pra cima. Como uma reação extra além da reação de colisão padrão


# Ideia pra melhorar o vento: 
a física do vento ao invés de somar velocidade ela vai somar forças. Pra ser mais realista


# Ideia sobre fisica de rotação
Ideia: o torque pode também gerar uma força de movimento para X Y Z. Dependendo da direção da força de rotação.

Por exemplo, um peão, se você rodar ele pra direita com muita força, ele vai acabar se movendo pra direita e um pouco pra baixo também, em um movimento que tende a ser circular nesse padrão. Ou seja, ele iria um pouco pra direita e pra baixo, e depois iria acabar subindo denovo, depois indo pra aquela direção inicial(em relação a posição atual), até que o giro pare.

O mesmo também pode valer pra força de movimento. Ela também pode gerar um pouco de força de rotação dependendo


# Ideia: tendência de rotação e tendência de queda.*

Nos objetos criar uma matriz que permite eu definir pesos individuais para cada parte da malha do objeto. 

Isso vai permitir que eu aplique uma rotação mais intensa pra certa direção quendo eu aplicar uma força de rotação no Objeto.

E também permitir que eu aplique uma força mais intensa pra algumas direções enquanto o objeto estiver recebendo força de movimento

Talvez isso possa até substituir a propriedade massa.
Mais pra não precisar substituir eu posso fazer assim:

Todo objeto vai ter a propriedade "massMatrix"

Ideia: se a massa for um número, então, a massMatrix inteira vai ter o mesmo peso pra todas as direções possíveis.

Mais se eu passar um "massMatrix", eu posso definir os valores.

E a Engine sempre vai usar o massMatrix pra aplicar física de forças, ou outras físicas que lidam com velocidade e massa

Pra facilitar o padrão poderia ser que todo objeto vai usar massa como número, e logo o massMatrix vai ser o mesmo valor.

Mais ter métodos e propriedades que permitam eu somar um peso maior a uma das direções e posições dessa matriz

OUTRA IDEIA PRA ISSO: Talvez o massMatrix vai ser tudo zero, e só vai ter valor em pontos especificos que quero que tenha mais enfase, ai isso vai pesar mais além da fisica padrão


# IDEIA FORÇAS PERMANTENS:
Adicionar forças permanentes
Tanto de rotação quanto de movimento


# IDEIA: limitar rotação 22/05/2025
Se a rotação em algum eixo atingir certo valor, definir para outro valor.
Pra assim limitar por isso exemplo dentro de 0-360 o valor da rotação

# IDEIA: adicionar um status de velocidade que a Engine controla 22/05/2025
que pra cada eixo, X Y Z, vai dizer se o valor está aumentando, diminuindo, ou estabilizado.

Pra isso cada eixo vai ser um Interface 

{
  aumentando: bool,
  diminuindo: bool,
  estagnado: bool,
  status: "aumentando"
}

Eu posso fazer assim ou por String só.

Aí a cada frame ele vai monitorar a velocidade dos objetos

# Ideia: Adicionar também o o positionSynalizer 23/05/2025
Ideia: Adicionar também o o positionSynalizer que faz exatamente o que o do velocitySinalizer faz. Ou seja, o da posição ele vai monitorar se a posição do objeto está subindo, descendo ou se manteve

Criar isso também pro rotation. 

Porém pro rotation como já fiz o sinalizador de rotação simples eu posso incluir isso como um novo atributo dele

# Ideia: 23/05/2025
Ideia: pra melhorar a precisão do analisador de velocidade. Talvez implementar que ele não vai comparar o frame anterior. Mais sim 5 frames anteriores. Pra dar um delay maior antes de cada verificação de sentido de velocidade. Isso pode reduzir oscilações

# IDEIA RASTREADOR DE FRAMES 23/05/2025
Ideia: criar um rastreador de frames. Que vai salvar as informações de todos os objetos da cena.
Como posição, velocidade, escala, rotação, aceleração, força, e outras.... Ordenado por milissegundos ou por frame, em JSON.

Isso pode ser usado pra monitamentos como o da velocidade e outros.

E pode ser opcional também podendo ser desativado

# IDEIA RASTREADOR DE STATUS VELOCIDADE APRIMORADO 24/05/2025
Problema: no velocitySinalizer, ele é exatamente preciso mais não funciona quando no eixo existe forças sendo aplicadas constantemente, como no caso da gravidade. Por causa disso o jogo não enxerga que uma aplicação de forças contrária a gravidade foi um incremento por exemplo.

Ideia pra corrigir:
Criar um outro atributo alternativo que vai calcular a tendência do eixo da velocidade.

Ou seja

Se o eixos Y da velocidade tende/está mais crescendo, ou diminuindo, ou constante.

Pra isso posso fazer verificações profundas no histórico de frames do objeto, junto com limiares, e outras técnicas

# IDEIA calcular varias caracteristicas do objeto 24/05/2025
Por exemplo, calcular diferença(do frame atual MENOS o frame anterior) de:
    - posição
    - velocidade
    - escala

    EX: diffPosicao = posicaoAnterior - posicaoAtual

Refatorar o estilo dos nomes
por exemplo, ser mais claro e direto

ao invez de chamar velocitySinalyzer, chamar velocityInstantanyAxysDirection, para se refererir ao status de cada eixo, instantaneo ou seja, em relação ao frame anterior.

# (JA FIZ) IDEIA: Simplificar a parte dos Attrachments
Remover a complicação do Name e Id serem usados pra fazer atrachments,
tentar usar isso de forma mais simples

# Revisar o sistema de eventos e callbacks dos objetos
Rever se isso existe no C++ de 2011
