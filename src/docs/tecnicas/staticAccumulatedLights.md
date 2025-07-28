# Iluminação estática acumulada

## Cabeçalho
*Autor: William Alves Jardim*

*Data que escrevi esse documento técnico explicativo*: 28/07/2025 as 16:32 PM
OBS: A implantação dessa ideia que eu tive foi implementada na pratica antes dessa data.

## Explicação
Na minha Engine, cada objeto fica atualizando a iluminação a cada frame, o que envolve a Engine ficar percorrendo todas as luzes
perto do objeto em questão, pra calcular a interferencia da luz, eu percebi que isso pode se tornar muito pesado, se houverem muitas luzes e muitos objetos.
Então foi ai que eu tive a ideia de só fazer isso uma unica vez, somente no primeiro frame, e depois desligar a atualização dinamica das luzes, tornando as luzes estaticas.

Eu dei o nome de "Iluminação estática acumulada", pois a iluminação do objeto vai ser calculada apenas uma unica vez(como eu disse, somente no primeiro frame), e depois, vai ficar estatica, ou seja, vai deixar de ser dinamica, ou seja, vai ficar sempre contante, nunca mais vai mudar. E a parte do "acumulada" vem do fato de que, um objeto vai ter sua iluminação calculada com base em todos os pontos de luz proximos dele.
Então, ele vai fazer esse calculo e acumulação apenas uma unica vez, no primeiro frame, somente.

Resumo: Atualiza a iluminação dos objetos apenas uma unica vez(somente no primeiro frame do renderizador), e depois usa essas informações já calculadas a todo momento, evitando precisar recalcular a cada frame.
*OBS: Cada objeto pode ou não usar essa técnica. Eu controlo isso usando atributos que ativam ou desativam recursos que eu crio, conforme minha necessidade*

Similar ao conceito de Lightmap(tambem conhecido como Lightmapping)

Esse é o conceito, a ideia que tive. Eu criei isso na prática no meu arquivo [Renderer.ts](../../engine/renderer/Renderer/Renderer.ts), na função `atualizarIluminacaoGeralObjeto`, na linha 726. E também na função `desenharUmObjeto`, na linha 1124. E o atributo `staticAccumulatedLights` controla isso em cada objeto.

*Nota: Este documento técnico foi escrito e publicado por William Alves Jardim para registrar publicamente esta ideia como parte do estado da técnica (prior art), com a intenção de contribuir com a comunidade e compartilhar conhecimento de forma aberta.*

*Nota: Este é apenas um resumo da técnica. Os detalhes completos estão disponíveis nos arquivos de código mencionados neste documento.*

## Links
Commit inicial deste documento técnico explicativo publicado em:  
https://github.com/WilliamJardim/Engine/commit/d7f9a2faebbbb208bbad567818b3f72cbb96cffe