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
Criar também eventos whenDestroy
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
EVENTO onCreate no ObjectBase, que ao criar um objeto dispara uma função JavaScript

# Otimização do calculo de fisica
Aplicar as verificações mais pesadas apenas se os objetos possivelmente colidem
isso descarta varios objetos que obviamente não colidem