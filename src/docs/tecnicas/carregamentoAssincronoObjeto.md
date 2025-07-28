# Carregamento assincrono de objetos

## Cabeçalho
*Autor: William Alves Jardim*

*Data que escrevi esse documento técnico explicativo*: 28/07/2025 as 16:32 PM
OBS: A implantação dessa ideia que eu tive foi implementada na pratica antes dessa data.

## Explicação
Na minha Engine, eu tive a ideia de carregar os objetos de forma assincrona(ou seja, deixar eles carregando em segundo plano, enquanto a Engine executa o código do jogo normalmente, e o carregamento será concluido mais tarde). E da forma como eu criei, eu fiz pensando em ser assim: Basta falar pra Engine que eu quero criar um novo objeto do tipo OBJ, dizendo qual o caminho do arquivo .obj dele. Ai a Engine vai começar a carregar ele em segundo plano. 

Porém, mesmo com o carregamento em andamento, de maneira independente disso, ele ainda assim cria a instancia do objeto na minha engine renderizadora e na engine principal, contendo posição, rotação, escala, e muitos outros atributos. Porém fica invisivel para o jogador, pois o carregamento do arquivo .obj do objeto ainda não terminou. No entanto a lógica, a fisica, e todo o resto da minha Engine já enxerga esse objeto como existindo, mesmo ainda não tendo carregado o arquivo dele.

No meu código de carregamento dos arquivos .obj, para cada objeto do tipo OBJ instanciado na cena, eu pego o caminho do arquivo, e eu começo a carregar. Ai eu tenho variaveis de controle, para definir quanto um carregamento começou, e quando terminou, e também, se os dados do arquivo ja foram ou não enviados para a minha Engine de renderização. Cada arquivo .obj que está nesse processo de carregando fica registrado numa tabela, que registra as informações dele e o status atual do carregamento dele.

Esse é o conceito, a ideia que tive. Eu criei isso na prática no meu arquivo [RenderizadorCena.ts](../../engine/renderer/RenderizadorCena.ts), nas funções `salvarOBJMemoria`, `getOBJMemoria`, `carregarOBJ_seNaoCarregado`, `updateObjectsVisually`.

*Nota: Este documento técnico foi escrito e publicado por William Alves Jardim para registrar publicamente esta ideia como parte do estado da técnica (prior art), com a intenção de contribuir com a comunidade e compartilhar conhecimento de forma aberta.*

*Nota: Este é apenas um resumo da técnica. Os detalhes completos estão disponíveis nos arquivos de código mencionados neste documento.*