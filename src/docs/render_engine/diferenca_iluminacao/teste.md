# 19/07/2025 11:39 AM
Eu fiz esse arquivo de anotação para registrar um possivel BUG ou pequena diferença que eu tive, 
do meu sistema de iluminação de meu mini renderizador webgl em JS na versão antes da migração pra TS,
quando eu comparo ele com o atual agora que eu migrei ele pra TS, e fiz varios mudanças.
*NOTA: 255 era um valor que já deixava muito mais intenso mesmo, e não era um valor que eu usava nos testes. Eu geralmente testava com valores baixos*

O antigo(da pasta raiz/webgl), e o no novo(da pasta src/engine/renderer)

# Iluminação mais intensa do que antes
Reparei que a força de todas luzes ficou muito mais intensa,
antes eu tinha que usar o valor [255,0,0] pra ter uma cor vemelha que iluminava a roda da frente do carro e um pouco a roda de traz do carro
Agora pra eu ter o mesmo efeito, eu preciso usar um valor menor: [5,0,0], pois o  [255,0,0] faz a luz ficar muito forte e isso faz a iluminação parecer sempre a mesma para todas as partes do carro

# Vidro do carro sofrendo mais com a luz
Reparei que no meu novo, o vidro recebe muito mais luz do que antes no meu antigo
Isso tambem altera a percepção da comparação

Nos testes com luz intensa que fiz no carro, Parece até que o vidro ficou mais preto e perdeu um pouco a transparencia, e ao receber luz, ele tende a ficar da cor da luz


# Iluminação do quarto
    
### TOPICO: Testando iluminação nos guarda roupas (IGUAL)
Ao usar "renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 1, raio: 1 , cor: [5,0,0]} )" duas vezes no guarda roupa vermelho

E usar "renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 1, raio: 1 , cor: [0,5,5]} )" duas vezes no outro guarda roupa esquerdo

*O resultado visual é o mesmo* tanto no antigo(da pasta raiz/webgl), quanto no novo(da pasta src/engine/renderer)


### TOPICO: Testando aplicar iluminação muito forte [255,0,0] no quarto perto do guarda roupa (IGUAL, porém com uma leve diferença na intensidade)

Ao usar "renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 1, raio: 1 , cor: [255,0,0]} )" apenas 1 vez no guarda roupa vermelho, o ambiente do quarto todo e todos os moveis ficam tudo vermelho, como se fosse um filtro de filme exagerado. Fazendo os objetos começarem a se camuflar, como se fosse uma neblina vermelha envolvendo tudo

*Porém, no meu novo, a aplicação disso nos objetos com textura foi um pouco mais intenso, fazendo as partes dos moveis ficarem mais pretas, em comparação com o antigo.*

Isso tambem aponta para a confirmação de primeira primeira hipotese: *Iluminação mais intensa do que antes*


### TOPICO: Testando aplicar iluminação muito forte [255,0,0] no carro perto da roda da frente (IGUAL, porém, com uma leve diferença na intensidade)

Ao usar "renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 1, raio: 1 , cor: [255,0,0]} )" apenas 1 vez perto da roda da frente do carro, 
dá pra notar que existe um calculo de distancia da luz
pois a roda da frente recebe muito mais luz do que a roda de traz(mais longe), ok, isso se manteve intacto no meu antigo e no meu novo;

Porém, no novo, dá pra perceber que a aplicação da luz em tudo fica mais intenso, fazendo a lataria azul do carro começar a ir pro tom de rosa e com luz exagerada
E todo o resto, incluindo as rodas, a textura começa a ficar levemente ofuscada, começando a não dar pra ver tão bem os detalhes da roda, por que tudo começou a ter a tendencia de ter a mesma cor.
Dá pra ver os detalhes sim, e pra perceber distancia de luz, como eu disse. Porém ficou mais intenso a cor da luz.

E como eu disse, mesmo assim, *Ainda dá pra notar que existe um calculo de distancia da luz*
*pois a roda da frente recebe muito mais luz do que a roda de traz(mais longe), ok, isso ainda continua valendo*

Porém, a iluminação no meu novo ficou mais intensa, a ponto de fazer a lataria do carro que era azul começar a ficar rosa, e as outras partes começarem a destacar mais a cor do que os detalhes

No meu antigo isso também começava a acontecer, porém era menos intenso. No meu novo os objetos receberam muito mais intensidade que no meu antigo.

Isso tambem aponta para a confirmação de primeira primeira hipotese: *Iluminação mais intensa do que antes*


### TOPICO: Testando aplicar iluminação fraca de cor [5,0,0], um vermelho fraquinho perto da roda da roda da frente (IGUAL, porém, com uma leve diferença na intensidade)

Ao usar "renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 1, raio: 1 , cor: [5,0,0]} )" apenas 1 vez perto da roda da frente do carro, 
dá pra notar que existe um calculo de distancia da luz
pois a roda da frente recebe muito mais luz do que a roda de traz(mais longe), ok, isso se manteve intacto no meu antigo e no meu novo;

Os resultados foram iguais, Porém no novo, a intensidade da luz, novamente, foi mais forte, mais intensa.
E no antigo, o efeito era o mesmo, porém a intensidade da luz era muito mais fraca.

No antigo, No vidro e nas partes que seguram o vidro, quase não se via o efeito da luz, de tão fraco que era.
Porém, no novo, No vidro e nas partes que seguram o vidro, receberam mais intensidade

Tambem a roda de traz do carro, no antigo, vista de longe, nem parecia ter recebido nenhuma luz(mais na verdade recebia mais era bem pouco, quase nada)
Porém no novo, a roda de traz do carro, ainda mantem o efeito de distancia da luz, dá pra notar claramente a distancia da luz
pois a roda da frente recebe muito mais luz do que a roda de traz(mais longe), ok, isso se manteve intacto no meu antigo e no meu novo;
PORÈM NO NOVO, tudo é mais intenso, então a roda de traz fica um pouquinho mais vermelha do que no antigo, 
porém ainda dá pra notar que esta numa proporção correta, em comparação com a roda da frente
pois a roda da frente recebe muito mais luz do que a roda de traz(mais longe), ok, isso se manteve intacto no meu antigo e no meu novo;

O vidro no antigo ficava muito mais cinza, e mais tranparente
Porém no novo, o vidro ficou mais preto(mais opaco na verdade), e um pouco menos transparencia 
e isso realçou a intensidade da luz no vidro, deixando mais evidente a aplicação de luz no vidro;

Isso tambem aponta para a confirmação de primeira primeira hipotese: *Iluminação mais intensa do que antes*


### TOPICO: Testando aplicar iluminação razoavel no meio do meu quarto NO MEU MAPA DE ESBOLÇO SOLIDO SEM TEXTURA

Ao usar "renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 1, raio: 1 , cor: [0,100,0]} )" apenas um vez bem no centro do meu quarto
a iluminação aplicada no meu quarto e no restante da casa, segue corretamente o meu calculo de distancia da luz, sendo realista.
E isso eu comparei tambem lado a lado o meu antigo e o meu novo, os resultados visuais foram identicos, não vi nenhuma diferença na intensidade
Se houve alguma diferença na intensidade teria sido minima e insignificante

Olhando em algumas partes parece que no novo foi levemente mais forte a intensidade sim
Isso tambem aponta para a confirmação de primeira primeira hipotese: *Iluminação mais intensa do que antes*

MAIS QUANTO EU APLICA A LUZ AINDA MAIS PERTO DA PRIMEIRA PAREDE O QUARTO, A ILUMINAÇÂO NAQUELA PAREDE FICA MUITO MAIOR DO QUE NAS OUTRAS PAREDES E OBJETOS DESSE QUANTO QUE ESTÂO MAIS DISTANTES DESSA LUZ, ISSO È OK, E REALISTA
E TAMBEM ACONTECIA NO ANTIGO. ENTÂO ISSO TAMBEM ESTÀ IGUAL, EQUIVALENTE


### TOPICO: Testando aplicar diferentes iluminações em pontos diferentes do esboço da casa NO MEU MAPA DE ESBOLÇO SOLIDO SEM TEXTURA
No segundo quarto, apliquei renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 1, raio: 1 , cor: [50,0,0]} ), um leve vermelho

Na cozinha apliquei renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 1, raio: 1 , cor: [50,0,0]} ), um leve vermelho

Na sala apliquei renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 1, raio: 1 , cor: [0,0,50]} ), um leve azul

As cores vermelho e azul se combinaram, formando roxo nas partes mais proximas da cozinha e do quarto
E ao ir se afastando da luz vermelha, nas paredes mais proximas da luz azul da sala, era um tom de azul, tambem gradual,
as paredes e objetos mais proximas da luz azul da sala ficaram com tom de azul mais forte, enquanto as paredes mais distantes ficavam com tom de azul mais fraco
dando pra perceber claramente a distancia da luz
E seguindo tambem a combinação de cor que falei

Tudo isso eu tambem comparei o meu novo com o meu antigo, e tambem, é um comportamento igual que se manteve intacto.



## OUTRAS ANOTAÇÔES QUE FIZ ONTEM INVESTIGANDO O PROBLEMA
(18/07/2025 - 17:12 PM)
Conferir se a iluminação está sendo acumulada e aplicada corretamente, comparando com antes 
Corrigir o BUG que encontrei
Centralizar a lógica de cálculo e envio de iluminação pro shader 
Ou pelo menos a de envio pro shader

(18/07/2025 - 21:32 PM)
Investigar por que a iluminação parece estar menos realista e parece estar afetando tudo.
Repetir o mesmo teste do meu antigo na pasta raiz/webgl, precisa bater

Suspeito que possa haver algum problema com o individual lights, talvez ele não esteja sendo aplicado
Ou talvez o cálculo da iluminação individual das partes esteja com problema por causa da mudança que eu fiz.
Testar o commit de antes de centralizar e de antes de eu transformar a variável de acumulação em atributo e de antes de eu separa o cálculo do envio dos Shaders

(18/07/2025 - 23:35 PM, iria dormir mais decidi continuar investigando mais esses pontos)
Não consegui entender o por que
Eu tentei usar variável novamente ao invés de atribuir um atributo no Objeto.
Conferir e o individual lights está tudo ok nos objetos junto com todos os outros 
Os objetos definem a iluminação padrão como zero igual era no antigo 
O renderizador está com os mesmos parâmetros globais de iluminação 
Usei os mesmos parâmetros (ambient, ráio, etc..) de iluminação, comparando com o antigo meu ferio WebGL com JS

(18/07/2025 - 23:39 PM)
Mais eu reparei que, alguns comportamentos se mantiveram igual.
Ele ainda calcula iluminação local.
Porém, no antigo a iluminação com 0.5 lá do TESTE MEU ANTIGO, faz ele iluminar bem pouco a roda da frente do carro, e a roda de traz mais pouco ainda, pra pra perceber claramente a distância em função da força.
E a lataria do carro ilumina também bem pouco com um tom um pouco mais leve do que a primeira roda.
Porém no novo a iluminação 0.5 ilumina bastante a lataria do carro, e também ilumina muito mais forte, a roda da frente e de traz... Ainda dá pra perceber que existe iluminação local, porém, a iluminação ficou muito mais intensa e isso quebra um pouco a distância realista.
A iluminação de 1 com raio 1, fica mais mais exagerada.. não dando pra sentir nenhuma diferença de distância, com todos os objetos ficando com a mesma iluminação, e muito intenso

(18/07/2025 - 23:40 PM)
Ideias testar:

  Os parâmetros padrão do objeto Light se são os mesmos do antigo 

  Testar com uns commits atrás da minha nova versão em TS, pois eu lembro que logo no começo quando eu migrei pra TS, eu verifiquei bem essa parte de iluminação, e aparentemente estava igual ao meu antigo

(18/07/2025 - 23:51 PM)
 eu tentei zerar no meu RenderizadorCena.ts, que cria os atributos dos objetos,.. que repassavam os parâmetros de iluminação 

Porém mesmo assim não adiantou

O problema é alguma outra coisa
Deixei do jeito que está por enquanto
Preciso voltar pra trás e conferir se nós primeiros commits da migração pra TS do WebGL, se também estava com esse problema, ou se veio depois com as separações, centralizacoes

















