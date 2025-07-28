# Iluminação Local Acumulada

## Cabeçalho
*Autor: William Alves Jardim*

*Data que escrevi esse documento técnico explicativo*: 28/07/2025 as 17:31 PM
OBS: A implantação dessa ideia que eu tive foi implementada na pratica antes dessa data.

## Explicação base
Eu quis criar uma forma de cada objeto na minha Engine poder ter sua própia iluminação, e de eu poder ter vários pontos de luz espalhados pelo cenário, que vão afetar a iluminação dos objetos que estiverem perto deles. Então, ao longo desse projeto, desenvolvi alguns métodos de iluminação de objetos:

Essa ideia chamei de "Iluminação Local Acumulada" pois a iluminação de cada objeto vai depender da iluminação de todos os pontos de iluminação ao seu redor. Quanto mais perto do ponto de luz, mais interferencia o objeto em questão sofre. Isso envolve tanto o brilho a quanto cor. Inclusive, as cores podem se combinar naturalmente pela própia matematica. 

A parte do "Local" vem do fato de que, eu posso ter quantos pontos de luz eu quiser, e em qualquer parte do cenário. E também, quantos objetos eu quiser. E cada um desses objetos vai sofrer interferencia direta todos os pontos de iluminação que estão próximos dele, conforme expliquei. Ou seja, a iluminação de cada objeto vai depender de todos os pontos de luzes próximos dele. 

E a parte do "Acumulada" é por causa das acumulações(somas) da iluminação das variáveis, de todos os pontos e luz próximos do objeto, ou seja, o recebimento de todas as luzes que afeta esse objeto em questão. 

Vou explicar isso melhor abaixo:

## Variáveis e sua acumulação
Essa acumulação da iluminação de um objeto inclui as seguintes variáveis:
  - Ambient
  - Diffuse
  - Specular
  - Brilho
  - Intensidade da luz
  - Cor da luz

Cada uma delas é acumulada, separadamente em sua respectiva variável
Por exemplo, o `Ambient` total vai ser a soma do `Ambient` de todas as luzes que estão próximas ao objeto.

# Fatores que levo em conta
Para se calcular isso, eu criei três fatores:
  - (1) A iluminação definida na configuração do propio objeto
  - (2) A iluminação global definida no meu própio renderizador
  - (3) A iluminação de todos os pontos de luz perto do objeto

Todas as variáveis que citei acima(Ambient, Diffuse, etc) estão presentes em cada um desses fatores.

# A iluminação definida na configuração do propio objeto
Cada objeto pode começar por padrão tendo uma iluminação pré definida, e pra isso, eu especifico os valores de Ambient, Diffuse, etc desse objeto em questão. Essa informação fica armazenada dentro de uma tabela dentro de cada objeto.

# A iluminação global definida no meu própio renderizador
O meu renderizador também tem uma tabela, contendo Ambient, Diffuse, etc. Essas variaveis definidas no meu renderizador são valores de iluminação global, ou seja, que vão ser somados(inclusos no calculo da iluminação) em todos os objetos

# A iluminação de todos os pontos de luz perto do objeto
Cada ponto de luz tem Ambient, Diffuse, etc., incluse cores. Além de raio de alcançe. Então cada ponto de luz tem suas informações de iluminação, ou seja, que diz respeito a sua capacidade de interferencia.

E com tudo isso eu calculo o que chamei de iluminação total do objeto


## Duas situações diferentes:
E também, esse processo é aplicado para dois casos distintos:
  - (1) Para objetos simples: como cubos, triangulos, etc.

  - (2) Para objetos complexos: como arquivos OBJ, onde temos muitas partes que compôem o objeto.

Para os objetos simples, eu criei uma função que chamei de `aplicarIluminacaoGeralObjeto`, que calcula a iluminação geral do objeto e salva ela num atributo chamado `iluminacaoGeral` do objeto, e em seguida, envia essa iluminaçao geral calculada para o shader.

Para objetos complexos, como os arquivos OBJ, onde temos muitas partes que compôem o objeto, o processo segue a mesma ideia, porém, de uma forma um pouco diferente: Eu acumulo a iluminação não do objeto como um todo, mais sim, de cada uma das das partes dele. E para armazenar isso, eu uso as seguintes variáveis de meu código:
 - `iluminationInfo`: que é a iluminação pré definida de cada parte do objeto
 - `iluminationAcumuladaInfo`: que é a iluminação acumulada de cada parte do objeto
 - `iluminationTotal`: que é a iluminação total de cada parte do objeto 

### iluminationInfo
A `iluminationInfo` é igual ao que expliquei no ponto `(1) A iluminação definida na configuração do propio objeto`. Pois cada parte possui valores pré definidos para Ambient, Diffuse, etc.

### iluminationAcumuladaInfo
A `iluminationAcumuladaInfo` ela armazena a acumulação de todos os pontos de iluminação próximos da parte em questão, que afetam a mesma. 

### iluminationTotal
A `iluminationTotal` é basicamente a soma da iluminação pré definida da parte em questão com a iluminação global e com a iluminação acumulada da parte em questão.

Esses calculos são feitos para Ambient, Diffuse, etc

Esse é o conceito, a ideia que tive. Eu criei isso na prática no meu arquivo [Renderer.ts](../../engine/renderer/Renderer/Renderer.ts), nas funções `aplicarIluminacaoGeralObjeto` na linha 863, e na função `desenharUmObjeto` na linha 1124. 

OBS: Eu posso desativar a acumulação de iluminação individual das partes, definindo uma variavel `childrenIndividualLights` como `false`, que eu criei para controlar isso. Nesse caso, o calculo de iluminação do objeto complexo se comportará igual a de um objeto simples.

*Nota: Este documento técnico foi escrito e publicado por William Alves Jardim para registrar publicamente esta ideia como parte do estado da técnica (prior art), com a intenção de contribuir com a comunidade e compartilhar conhecimento de forma aberta.*

*Nota: Este é apenas um resumo da técnica. Os detalhes completos estão disponíveis nos arquivos de código mencionados neste documento.*

*Nota: quando eu digo "luzes que estão próximas ao objeto", na realidade, no meu código, eu percorro todas as luzes, mais eu faço um calculo de distancia, que determina o quão perto estã a luz do objeto. Mais eu prefiro usar a expressão "luzes que estão próximas ao objeto" por que é mais simples.*










