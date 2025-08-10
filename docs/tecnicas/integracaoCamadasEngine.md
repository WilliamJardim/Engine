# Integração das camadas da minha Engine

## Cabeçalho
*Autor: William Alves Jardim*

*Data que escrevi esse documento técnico explicativo*: 10/08/2025 as 13:56 PM.
OBS: A implantação dessa ideia que eu tive foi feita na pratica antes dessa data.

**Documento técnico explicativo adicionado em 10/08/2025 15:24, [neste commit](https://github.com/WilliamJardim/Engine/commit/2940e64e9bf878e2ef9fbb16fdae1c25bb5e43c9)**

**OBS: Comecei a escrever esse documento técnico explicativo as 13:56 PM, porém terminei as 15:24 PM, e fiz o commmit dele.**

**OBS: A minha primeira revisão deste documento técnico explicativo foi feita 10/08/2025, e commitada 15:39 PM.**

## Explicação geral
Eu desenvolvi uma estrutura para minha Engine que facilite minha migração futura pra C++, e ao mesmo tempo que torne cada camada da Engine independente das demais, impedindo misturar responsábilidades. **Por exemplo: a camada de renderização** só cuida da parte de renderização gráficas dos objetos, renderização do céu, carregamento de modelos .obj, carregamento de materiais .mtl de modelos, carregamento de texturas, criação de buffers, controle de cameras, e muito mais coisas relacioandas a gráficos, desenho e renderização em geral. **Outro exemplo: a camada de lógica/fisica**, que eu tambem chamei de "engine principal", ela cuida somente das lógicas de jogo em geral e coisas relacionadas. gerenciamento de objetos na cena, criação e exclusão de objetos, manipulação de objetos, eventos de jogo, simulação de fisica, como gravidade, empurrões, etc. 
**Essas camadas conversam entre si por meio de uma camada integradora. Eu chamei ele de integrador por causa que é justamente o que ele faz. Ele une todas as camadas da Engine de uma forma que funcionem em conjunto. Vou explicar isso abaixo.**

## Camadas, e seu significado.
Aqui o termo "camadas" se referem as partes da minha Engine. Como citei acima, tenho um pedaço que cuida apenas da logica/fisica, e outro pedaço que cuida apenas da parte de renderização. 
**Cada camada tem sua responsábilidade própia, que não se mistura com as outras. Uma camada não tem acesso a outra diretamente(apenas a camada integradora pode fazer a comunicação entre as camadas).**
Abaixo apresento as camadas atuais da Engine:

**Nota: Uma camada pode ser um único arquivo, ou uma pasta com um arquivo, ou vários arquivos dentro de uma pasta.**

## Camada de renderização
Tambem chamada por mim de "engine de renderização", é resposável por toda a parte de renderização: cuida da parte de renderização gráficas dos objetos, renderização do céu, carregamento de modelos .obj, carregamento de materiais .mtl de modelos, carregamento de texturas, criação de buffers, controle de cameras, criação e atualização de iluminação, e muito mais coisas relacionadas a gráficos, desenho e renderização em geral. Não existe lógicas de jogo, fisica ou outras coisas na camada de renderização, apenas coisas relacionadas a renderização.

Links para o código da camada de renderização:
  - Código da camada de renderização até o dia 09/08/2025 22:48 PM: [Camada de renderização - até o dia 09/08/2025 22:48 PM](https://github.com/WilliamJardim/Engine/blob/405b1fa65de221e0873aefc7b8c435097583f87f/src/engine/renderer/Renderer/Renderer.ts)

  - Código mais recente da camada de renderização: [Camada de renderização - do último commit, ou seja, o commit mais recente](../../src/engine/renderer/Renderer/Renderer.ts)

**Nota: a camada de renderização é a pasta `src/engine/renderer`**


## Camada de lógica/fisica
Tambem chamada por mim de "engine de logica", "engine de logica/fisica" ou de "engine principal", é responsável por toda a lógica de jogo, lógicas em geral, controle e gerenciamento da cena, instancias das luzes que serão intepretadas pela camada de renderização, e controle e gerenciamento de objetos: cuida somente das lógicas de jogo em geral e coisas relacionadas. gerenciamento de objetos na cena, criação e exclusão de objetos, manipulação de objetos, eventos de jogo, simulação de fisica, como gravidade, empurrões, etc. **A camada de lógica/fisica não tem nenhuma função relacionada a renderização. E também, a camada de lógica/fisica não possui nenhuma representação gráfica por si só. Ou seja, ela é invisivel gráficamente, pois ela só representa a parte lógica da Engine, mais não sua renderização.** Vou explicar mais detalhes na explicação da camada integradora.

Links para o código da camada de lógica/fisica:
  - Código da camada de lógica/fisica até o dia 09/08/2025 22:48 PM: [Camada de lógica/fisica - até o dia 09/08/2025 22:48 PM](https://github.com/WilliamJardim/Engine/tree/405b1fa65de221e0873aefc7b8c435097583f87f/src/engine/core)

  - Código mais recente da camada de lógica/fisica: [Camada de lógica/fisica - do último commit, ou seja, o commit mais recente](../../src/engine/core/)

**Nota: a camada de lógica/fisica é a pasta `src/engine/core/`**

## Camada integradora
Camada chefe, resposável por fazer a ligação entre todas as camadas da Engine, para que elas funcionem corretamente em cojunto umas com as outras. **Essas camadas conversam entre si por meio dessa camada integradora. Eu chamei ela de "integradora" por causa que é justamente o que ela faz. Ela une todas as outras camadas da Engine de uma forma que funcionem em conjunto umas com as outras.**
Os tópicos abaixo citam alguns detalhes sobre a camada integradora:

### Como ela integra, e o que ela integra?
A camada integradora é responsável por integrar a Engine de lógica/fisica com a de renderização, repassando para a camada de renderização os objetos que a camada de lógica/fisica está criando ou manipulando. Além disso, a camada integradora também é reponsável por prover informações necessárias para elas, como informações de entrada do teclado e mouse. A camada integradora também cria as seguintes variáveis:
  - `canvasRef`: que é a instancia do canvas do WebGL

  - `engineScene`: que á instancia da classe `Scene`(a cena da minha camada de logica/fisica, com seus objetos, métodos e atributos). Em outra palavras, você pode pensar nela como sendo toda a lógica da Engine, porém essa lógica é invisivel graficamente, ou seja, ela por si só existe, calcula colisão, empurrões, eventos, posição, rotação, escala, e muitas outras coisas, porém, ela por si só não tem representação gráfica, pois ela só representa a parte lógica da Engine, mais não sua renderização. Ou seja, fazendo uma analogica, a `engineScene` é um palco onde tudo acontece mais ninguém vê. A camada de renderização é quem vai desenhar e fazer com que esse "palco" seja visivel para os jogadores.
  
  - `armazenamentoEntrada`: uma instancia da classe `ArmazenadorEntradaTecladoMouse`, que armazena as informações atuais do teclado e mouse que serão consultadas na camada de logica/fisica e na camada de renderização.

  - `toRenderAssociation`: um mapa/"tabela hash" que relaciona os objetos da camada de logíca/fisica com seus respectivos objetos representantes gráficos da camada de renderização, o que permite espelhar atributos(o objeto gráfico vai acompanhar a posição, rotação, escala, etc do seu respectivo objeto da camada de lógica/fisica). Em outras palavras, a minha camada de lógica/fisica descreve tudo o que está acontecendo na cena, e a camada de renderização enxerga isso e só desenha exatamente o que ela descreveu. Para cada objeto da camada de logíca/fisica, se for a primeira vez do objeto, ou seja, se o objeto da camada de logíca/fisica acabou de ser criado, então, ele é registrado nesse mapa, e então a camada de renderização cria um representante correspondente para ele com todos os seus atributos espelhados. Se for a segunda vez em diante, o representante correspondente criado na primeira vez vai simplismente ser atualizado, espelhando novamente todos os atributos, se mantendo assim atualizado quanto ao estado atual do seu respectivo objeto da camada de lógica/fisica, mantendo a camada de lógica/fisica e camada de renderização sempre sincronizadas. Essa relação do `toRenderAssociation` é feita pela função `updateObjectsVisually`, na linha 187, no arquivo `RenderizadorCena.ts`. Você pode ver o código completo do arquivo `RenderizadorCena.ts` que será citado abaixo caso queira ver os detalhes.

  - `toRenderLightsAssociation`: um mapa/"tabela hash" que relaciona as luzes da camada de logíca/fisica com suas respectivas luzes representantes gráficas da camada de renderização, o que permite espelhar atributos de iluminação(a luz gráfica vai acompanhar a posição, rotação, escala, intensidade, cor, etc da sua respectiva luz da camada de lógica/fisica). Em outras palavras, a minha camada de lógica/fisica descreve todas as luzes na cena, e a camada de renderização enxerga isso e só ilumina exatamente como ela descreveu. Para cada luz da camada de logíca/fisica, se for a primeira vez da luz, ou seja, se a luz da camada de logíca/fisica acabou de ser criada, então, ela é registrado nesse mapa, e então a camada de renderização cria uma luz gráfica representante correspondente para ela com todos os seus atributos espelhados. Se for a segunda vez em diante, a luz gráfica representante correspondente criada na primeira vez vai simplismente ser atualizada, espelhando novamente todos os atributos, se mantendo assim atualizada quanto ao estado atual da sua respectiva luz da camada de lógica/fisica, mantendo a camada de lógica/fisica e camada de renderização sempre sincronizadas. Essa relação do `toRenderLightsAssociation` é feita pela função `updateLightsVisually`, na linha 356, no arquivo `RenderizadorCena.ts`. Você pode ver o código completo do arquivo `RenderizadorCena.ts` que será citado abaixo caso queira ver os detalhes.

  - `toRenderCameraAssociation`: : um mapa/"tabela hash" que relaciona as cameras da camada de logíca/fisica com suas respectivas cameras representantes gráficas da camada de renderização, o que permite espelhar atributos de camera, ponto de vista(a camera gráfica vai acompanhar a posição, rotação, escala, etc da sua respectiva camera da camada de lógica/fisica). Em outras palavras, a minha camada de lógica/fisica descreve todas as cameras na cena e qual está sendo usada, e a camada de renderização enxerga isso e só atualiza as cameras exatamente como ela descreveu, e usa a camera atual que está sendo usada(que a qamada de logíca/fisica apontou). Para cada camera da camada de logíca/fisica, se for a primeira vez da camera, ou seja, se a camera da camada de logíca/fisica acabou de ser criada, então, ela é registrado nesse mapa, e então a camada de renderização cria uma camera gráfica representante correspondente para ela com todos os seus atributos espelhados. Se for a segunda vez em diante, a camera gráfica representante correspondente criada na primeira vez vai simplismente ser atualizada, espelhando novamente todos os atributos, se mantendo assim atualizada quanto ao estado atual da sua respectiva camera da camada de lógica/fisica, mantendo a camada de lógica/fisica e camada de renderização sempre sincronizadas. Essa relação do `toRenderCameraAssociation` é feita pela função `updateCamerasVisually`, na linha 422, no arquivo `RenderizadorCena.ts`. Você pode ver o código completo do arquivo `RenderizadorCena.ts` que será citado abaixo caso queira ver os detalhes.

  - `renderizador`: que é a instancia da classe `Renderer`, ou seja, é a camada de renderização(da pasta `src/engine/core/`). Ela é responsável por desenhar todos os objetos, luzes, cameras, e atualizar suas informações. Ela cuida de tudo relacionado a gráficos.

  - `renderConfig`: uma estrutura de dados, que armazena configurações de iluminação global que será repassado para o renderizador na hora que ele for instanciado

  - `firstRender`: um valor booleano, que indica se o renderizador está renderizando pela primeira vez(ou seja, o primeiro frame dele). Tambem tem a variável.

  - `provavelmentePronto`: um valor booleano, que indica se o renderizador provavelmente já está pronto para desenhar.

  - `executandoRenderizacao`: um valor booleano, que indica se o renderizador já está renderizando ou não.

  - `LimiteFPS`: um número, que define a taxa de frames por segundo(FPS) que o renderizador vai usar. Essa taxa é usada na função `loop_principal`, na linha 608, do arquivo `RenderizadorCena.ts`. Você pode ver o código completo do arquivo `RenderizadorCena.ts` que será citado abaixo caso queira ver os detalhes.

**Nota: para cada variável acima, eu deixei um breve texto explicando para que ela serve, dentro do contexto da camada integradora, com detalhes e nomes das funções que as usam.** 

Links para o código da camada integradora(do arquivo RenderizadorCena.ts):
  - Código da camada integradora até o dia 09/08/2025 22:48 PM: [Camada integradora - até o dia 09/08/2025 22:48 PM](https://github.com/WilliamJardim/Engine/blob/405b1fa65de221e0873aefc7b8c435097583f87f/src/engine/renderer/RenderizadorCena.ts)

  - Código mais recente da camada integradora: [Camada integradora - do último commit, ou seja, o commit mais recente](../../src/engine/renderer/RenderizadorCena.ts)

**Nota: a camada integradora atualmente é o arquivo `src/engine/renderer/RenderizadorCena.ts`**

## Rodapé

**Nota: Este documento técnico foi escrito e publicado por William Alves Jardim para registrar publicamente esta ideia como parte do estado da técnica (prior art), com a intenção de contribuir com a comunidade e compartilhar conhecimento de forma aberta.**

**Nota: Este é apenas um resumo da técnica. Os detalhes completos estão disponíveis nos arquivos de código mencionados neste documento.**

## Código completo até 09/08/2025
Você pode acessar o código completo de todos os arquivos deste projeto, desde o início até o dia 09/08/2025, no seguinte commit. Para navegar pelos arquivos, clique em Browse files na página do commit no GitHub:
https://github.com/WilliamJardim/Engine/commit/405b1fa65de221e0873aefc7b8c435097583f87f
