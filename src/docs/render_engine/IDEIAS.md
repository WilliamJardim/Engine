Criar movimento de camera que leva em conta a rotação da camera

Corrigir o bug da rotação


CALCULAR POSIÇÂO DA CAMERA EM RELAÇÂO A ROTAÇÂO:
(AINDA NÂO TERMINADO)

    let passosCamera = 0.5;
    let passosLateralCamera = 0.5;
    let posicaoAtualRelacaoDirecao = [0, 0, 0];

    // Calcula o movimento de andar pra frente/traz
    const direcaoFrente = calcularDirecaoCamera(rotacaoCamera);
    
    // Calcula o movimento de andar na lateral
    const direcaoDireita = calcularDireitaCamera(rotacaoCamera);
    
    // Ajusta a posição da camera de acordo com a rotação da camera, no sentido frente/traz
    posicaoAtualRelacaoDirecao[0] = posicaoCamera[0] + direcaoFrente[0] * passosCamera * frameDelta;
    posicaoAtualRelacaoDirecao[1] = posicaoCamera[1] + direcaoFrente[1] * passosCamera * frameDelta;
    posicaoAtualRelacaoDirecao[2] = posicaoCamera[2] + direcaoFrente[2] * passosCamera * frameDelta;

    // Ajusta a posição da camera de acordo com a rotação da camera, no sentido lateral
    posicaoAtualRelacaoDirecao[0] = posicaoCamera[0] + direcaoDireita[0] * passosLateralCamera * frameDelta;
    posicaoAtualRelacaoDirecao[2] = posicaoCamera[2] + direcaoDireita[2] * passosLateralCamera * frameDelta;

OUTRA IDEIA DISSO:

function onAndar()
{
    let frameDelta = renderizador.lastFrameDelta;
    let posicaoAtualRelacaoDirecao = [0, 0, 0];

    // Calcula o movimento de andar pra frente/traz
    const direcaoFrente = calcularDirecaoCamera(renderizador.miraCamera);
    
    // Calcula o movimento de andar na lateral
    const direcaoDireita = calcularDireitaCamera(renderizador.miraCamera);
    
    // Ajusta a posição da camera de acordo com a rotação da camera, no sentido frente/traz
    posicaoAtualRelacaoDirecao[0] = renderizador.posicaoCamera[0] + direcaoFrente[0] * passos * frameDelta;
    posicaoAtualRelacaoDirecao[1] = renderizador.posicaoCamera[1] + direcaoFrente[1] * passos * frameDelta;
    posicaoAtualRelacaoDirecao[2] = renderizador.posicaoCamera[2] + direcaoFrente[2] * passos * frameDelta;

    // Ajusta a posição da camera de acordo com a rotação da camera, no sentido lateral
    posicaoAtualRelacaoDirecao[0] = renderizador.posicaoCamera[0] + direcaoDireita[0] * passos * frameDelta;
    posicaoAtualRelacaoDirecao[2] = renderizador.posicaoCamera[2] + direcaoDireita[2] * passos * frameDelta;


    // ANDAR 
    if( contexto.keyDetection.W ){
        renderizador.posicaoCamera[2] -= posicaoAtualRelacaoDirecao[2];
    }
    if( contexto.keyDetection.A ){
        renderizador.posicaoCamera[0] -= posicaoAtualRelacaoDirecao[0];
    }
    if( contexto.keyDetection.D ){
        renderizador.posicaoCamera[0] += posicaoAtualRelacaoDirecao[0];
    }
    if( contexto.keyDetection.S ){
        renderizador.posicaoCamera[2] += posicaoAtualRelacaoDirecao[2];
    }
    if( contexto.keyDetection.ArrowUp ){
        renderizador.posicaoCamera[1] += posicaoAtualRelacaoDirecao[1];
    }
    if( contexto.keyDetection.ArrowDown ){
        renderizador.posicaoCamera[1] -= posicaoAtualRelacaoDirecao[1];
    }
}

AO RODAR: renderizador.getObjetos()[1].elevarPico(0.5, 2.0, 10.8, 5.3); no PlanoOndular, dá pra criar uma "tenda" para um jogo de sobrevivencia



# TODO LIST 23/06/2025
LUZ:
Adicionar cor de luz, cor de luz na iluminação ambiente do Renderizador, e dos objetos. E cor de luz na iluminação das partes individuais do OBJ 

OBJ:
adicionar controle visual por material individual, exemplo:
Iluminação, brilho, visibilidade(visível ou não), o que vai permitir afetar vários objetos de uma só vez dentro de um modelo OBj.

PATCHs
Criar sistema de PATCHs que permite substituir ou modificar, adicionar objetos de um OBJ, como se fosse um arquivo OBJ a parte que serve apenas pra complementar e modificar o primeiro.

CONTROLE DAS PARTES OBJ
para cada parte individual do OBJ, poder alterar posição, rotação e escala, também visibilidade

Adicionar intensidade da luz de volta


SISTEMA DE ILUMINAÇÂO:
Criar um sistema de iluminação interna da Engine, que chama setIluminacaoTotal ou o setIluminacaoParte em cada parte do objeto, 
Com o intuito de aplicar iluminação gradual e local nas regiões onde tiver pontos de iluminação. Vai simular de forma crua luzes com diferentes cores, intensidades, e alcances. Calculando a distância de cada objeto com os pontos de iluminação


EDITOR DE OBJETOS DA ENGINE
Criar um sistema que permite exportar o OBJ carregado de volta para um novo OBJ, por que aí abre portas pra eu começar a criar meu editor de mapas e objetos embutido


01/07/2025
Aplicar a iluminação tambem nas partes individuais dos OBJ 
pra isso ver os vertices na região da luz, para poder identificar os nomes das partes, para poder aplicar iluminação

05/07/2025
Documentar melhor o verticesObjetosOnlyNomeParte, e outros, pra ficar bem claro

Tambem, padronizar melhor os {} pra ser Map:

    materiais
    objetos
    objetosInfo
    verticesObjetos
    verticesObjetosOnlyNomeParte
    verticesComecaObjetos
    iluminationInfo
    iluminationAcumuladaInfo



# 06/07/2025
Sombras: são formadas pela ausência de luz.

A luz do sol ou artificial, clareia tudo... Mais aí, a onde está o carro, o jogador, a malha deles impede a luz de passar, deixando os contornos do objeto preto no chão

# 06/07/2025 (JA FIZ)
Lightmap usando minha iluminação local das partes 

Criar uma variável no Renderizador, que se ativada true, ele só vai acumular a iluminação das partes uma única vez(levando em conta os pontos de iluminação), e depois deixar isso estático, interrompendo os laços de atualização das luzes.

Isso também vai valer para objetos únicos sem ser OBJ.

A ideia é reduzir custo de processamento


# 06/07/2025 
Também adicionar exceção: que alguns Objetos vão poder ter iluminação dinâmica, mesmo com esse recurso ativado.
Isso pode ser feito por exemplo, dizendo que os objetos copiam o valor booleano do renderizador. O que permite alterar dentro do objeto
Outra ideia mais simples que tive: adicionar uma nova variável booleana dentro do objeto, que permite que as partes tenham iluminação individual, porém, que não acumule luzes locais. Ou seja, seria algo mais manual mesmo.

useLightAccumulation
Só mais um bloco de IF

# 16/07/2025 - EXCESÂO PARA OBJETOS CONTINUAREM ATUALIZANDO LUZES MESMO COM ILUMINAÇÂO ESTATICA
    Ideia de iluminação dinâmica em objetos mesmo com static lights ativado:

    Tive uma ideia pra usar iluminação dinâmica em objetos mesmo com static lights ativado:

    Quando todos os objetos já tiverem tido a luz calculada,... A cena vai parar de atualização a iluminação, 
    Porém, objetos que tiverem excessão por continuar usando luz dinâmica, vão continuar recebendo a interferência da luz normalmente. Só eles. Pois são excessão.

    Mais eles podem fazer isso em harmonia com a iluminação pré calculada. Para não anular ela.
    O que eu quero dizer é o seguinte: a iluminação padrão do objeto ainda vai ser a iluminação pré calculada, porém a luz pode aumentar ou diminuir essa iluminação, alterar cor, etc...
    Porém, quando o objeto deixar de receber a interferência da luz, a iluminação dele automaticamente volta a ser o que já estava pré calculado, ao invés de voltar pra iluminação padrão definida no Renderizado

    Eu pensei nisso. E pensei em outra ideia também sobre isso, nesse sentido.

    Na prática a minha Engine já tem isso.
    A única diferença do que já fiz pra minha nova ideia é a seguinte:
    A iluminação da minha Engine já leva em conta a iluminação do Renderizador somada a iluminação local dos pontos de luz próximos ao objeto.

    Porém, não existe excessão. Ou o objeto usa iluminação estática ou não.
    Se ele usa, ele pré calcula a iluminação.
    Porém, se ele não usa, ele calcula a todo momento. Simplesmente assim!

    Agora com minha nova ideia, eu poderia adicionar uma nova variável no Objeto, que se ativado, ele vai calcular a iluminação apenas uma única vez, como já faz. *Porém, ele vai fazer mais do que isso: a iluminação desse objeto sempre vai respeitar a iluminação pré calculada. Porém, ainda sofrer alteração de pontos de iluminação próximos do objeto. Como eu falei*

    A iluminação do objeto vai preservar a iluminação pré calculada(acumulada) dos pontos de iluminação perto do objeto, que foram pré calculados no primeiro frame. 

    E ainda pode sofrer alterações das luzes locais

    Então a única diferença é pequena:
    Se um objeto usa iluminação estática e não usar excessão, a iluminação nunca muda.

    Se um objeto não usa iluminação estática, é sempre dinâmica. Sempre se baseia na iluminação do Renderizador e das luzes locais e do próprio Objeto. 

    Mais se ele usa iluminação estática e usar a minha nova excessão, a fórmula matemática vai mudar. Ela Vai ser: iluminaçaoObjeto = iluminação_pré_calculada + luzes_locais + luz_objeto
    Posso até incluir a iluminação do Renderizador também.


# 16/07/2025 - Isolar o WebGL e centralizer as chamadas WebGL
    Ideia: Isolar o WebGL num adaptador simples, e com isso, tentar abstrair o máximo possível do uso o WebGL na Engine. Para que não seja necessário usar os tipos do WebGL diretamente nos objetos.... Apenas no Renderizador principal e em conformidade com minha outra ideia que tive, a seguir:

    Ideia: ao invés de cada objeto ter um método desenhar com chamadas do WebGL,... Cada objeto vai ter um método que atualiza os parâmetros de desenho dele.(O método desenhar dos objetos vai fazer isso)
    Que será chamado e depois lido pelo Renderizador numa função mestre que eu iria chamar de "desenharGeral". Lá vai ser um algoritmo padrão para todos e qualquer objetos da cena. Independente de ser OBJ, Cubo, ou outros...vai ter muitos IFs para determinar qual caminho seguir.....
    Assim eu centralizo todas as chamadas do WebGL em uma única função mestre 


# 16/07/2025 16:24 PM - Antes de eu fazer essa refatoração que eu tive ideia:
    Atenção: Eu preciso pensar em como vou estruturar os métodos atualizarIluminacaoParte e o IF if( this.childrenIndividualLights == true && this.alwaysUpdateLights == true ) do loop de desenho do meu Renderer/Mesh/OBJBase.ts

    E na função atualizarIluminacaoParte, como eu vou lidar com a aplicação das luzes no shader:
        // Atualiza as configurações gerais 
        gl.uniform1f(brilhoShader,   brilhoParte);
        gl.uniform1f(ambientShader,  ambientParte);
        gl.uniform1f(diffuseShader,  diffuseParte);
        gl.uniform1f(specularShader, specularParte);
        gl.uniform3fv(corLuzShader,   new Float32Array(corLuzParte) );
        gl.uniform1f(intensidadeLuzShader, intensidadeParte);

        [...]

        gl.uniform1i(informacoesPrograma.uniformsCustomizados.usarTextura, usarTextura ? 1 : 0);
        gl.uniform1f(informacoesPrograma.uniformsCustomizados.opacidade, opacidade);

    Pois eu quero que fica bem claro, facil de ler, e simples.

    Preciso encontrar a melhor forma que melhor me agrade e que cumpra minhas ideias

    ## 16/07/2025 16:26 PM (UMA HIPOTESE QUE EU PENSEI EM FAZER)
        Derrepente eu posso até separar a função atualizarIluminacaoParte em duas:
            - calcularIluminacaoParte
            - enviarIluminacaoParteShader

        Uma só pra calcular as luzes e acumular elas.
        E a outra só pra pegar os resultados desses cálculos e enviar para o shader(que eu quero que esteja em harmonia com minha ideia de centralizar tudo)

   ## 16/07/2025 16:30 PM
        Tambem preciso levar em conta o aplicarIluminacao do VisualMesh, e as funções que ela chama, e tambem lidar com a aplicação das luzes no shader
        

# 16/07/2025 16:27 - Otimização da renderização WebGL 
Reduzir ao máximo as chamadas do useProgram com regras:
Não chamar o useProgram caso o programa que o objeto atual usa ainda for igual ao programa anterior

Também, otimizar os glBindVertexArray e os outros binds, com a mesma ideia.

Posso até tentar separar os objetos por tipo, e chamar o useProgram apenas uma vez, por tipo.
E tentar optimizar os glBindVertexArray e os outros binds, com a mesma ideia.


# 16/07/2025 17:05 - Revisando minha ideia de centralização de lógica

    Tive a ideia de manter algumas coisas dentro do método atualizarDesenho de cada objeto: como calculo de iluminação e envio de iluminação para o shader.

    Mais eu sei que se eu seguir essa ideia que eu estou pensando aqui, sei que não vou estar me alinhando 100% com a minha outra ideia de centralizar o webgl em uma unica função.... Na realidade eu estaria centralizando boa parte sim, mais ainda restaria algumas coisas como atualizações de informações sendo enviadas como gl.uniform para o shader, tipos de dados, criação de buffers, e outras coisas..... Então ficaria mais organizado mais não totalmente centrado... Mais eu gostei disso tambem. Achei uma ideia muito legal que tive. Que faz sentido pra mim.

# 16/07/2025 17:17 - Ideia pra eu prosseguir a refatoração para seguir minhas ideias:
*DENTRO DO atualizarDesenho de cada objeto*
   (1) Primeiro ele vai fazer tudo o que tem fazer: criar a matriz, atualizar posição, rotação, escala .. criar buffer se não existir, ... enviar valores para o shader, calcular a iluminação e enviar os valores de iluminação pro shader 

*O que quero centralizado no Renderizador*
  (2) Chamar o resto das funções WebGL para poder desenhar como o drawElements e outros. E claro respeitando a minha ideia de otimização também que eu já anotei

 *Cuidado com o cullface*
 Ao seguir meu passo 2, preciso me atentar a isso:

    (3) Desativar cullface ou ativar o cullface se o objeto usa culling face, antes de chamar o método que atualiza o objeto. E depois quando terminar de desenhar, voltar para o valor padrão também

# 17/07/2025 17:04 PM
Retirar o enviarIluminacaoParteShader e enviarIluminacaoShader do OBJBase e do VisualMesh, e deixar eles centralizados no renderizador tambem


# 19/07/2025 12:49 PM, sabado
Novas ideias 
Voltar as variáveis de acumulação de iluminação da parte para serem atributos internos do próprio Objeto, e também, pra ser separado a função que calcula a iluminação da função que envia a iluminação pro shaders, ..... pois isso não interfere em nada na iluminação, pois só é calculado de uma parte por vez mesmo, uma por uma, em sequência sincrona. (FEITO)

E também, tentar centralizar o cálculo da iluminação e o envio da iluminação para o shader. 
Ou pelo menos centralizar o envio para o shader apenas , e deixar o próprio objeto calcular a iluminação dele e de duas partes

Depois criar meu sistema de Players, 
e meu sistema de Câmeras na Engine de lógica, que vão conversar com o meu mini renderizador.
E ajustar o LocalSound.ts para entender qual é o jogador que está perto do som

# 19/07/2025 19:36 PM, sabado (FEITO)
Novas ideias
Juntar a parte que leva em conta a iluminação do próprio Objeto e a iluminação global do Renderizador para retornar a iluminação total da parte 
Em vez disso, colocar no loop for do próprio atualizar desenho do objeto

# 19/07/2025 19:50, sabado (FEITO)
Centralizar tambem o método "atualizarIluminacao" e "enviarIluminacaoShader" do meu VisualMesh.ts

# 20/07/2025 11:13 AM, domingo
Tipar o atributo "materials" do VisualMesh (FEITO)

Tipar o atributo "objetos" do VisualMesh

# 20/07/2025 16:54 PM, domingo (FEITO)
Nova ideia: Vejo que dá pra eu padronizar o getInformacoesPrograma que cada objeto tem
dá pra criar um unico método getInformacoesProgramaObjeto dentro do renderer/Renderer/Renderer.ts, 
e fazer isso de uma forma que todos os objetos tenham exatamente a mesma estrutura de retorno e de uso do getInformacoesPrograma

Nova ideia: ajustar gl.getUniformLocation(programUsado!, "u_textura") e outras linhas, para que não use o ! e que o programUsado seja algo garantido e tambem padronizado
Conferir isso tambem: "programUsado!" pra ver onde o programUsado não e algo garantido

# 21/07/2025 16:31 PM
Também, criar um adaptador para o WebGL, que vai ser usado pra abstrair as chamadas gl.algumaCoisa que estão espalhadas por todos os tipos de objetos de minha Engine, inclusive no código de deformações. Abstrair tudo 

Ou então, de alguma forma conseguir centralizar também todas as chamadas gl.algumaCoisa para o módulo principal Renderer.ts

Eu posso até mesmo abstrair tudo primeiro, pra só depois tentar centralizar mais ainda

Isso poderia facilitar as coisas


OUTRA Ideia: centralizar carregamento de texturas no MTL do OBJMesh Pra ele usar uma função abstraída que vai chamar o método carregarTextura e armazenar ela num mapa HASH no módulo principal do Renderizador também.
Assim o Renderer vai ter um gerenciador de texturas embutido, simplificando mais o código
Isso vai permitir centralizar ainda mais


# 21/07/2025 19:09 PM - Ideia de estrutura de como eu pretendo portar a minha Game Engine em C++
Funções globais que chamam o WebGL ou Open GL 

Declaração antecipada do renderizador

VisualMesh:
    Só atributos genéricos que qualquer objeto vai usar. E um ponteiro para o renderizador , mais 100% abstrato sem chamar nada dele aqui 

    Também métodos abstratos que requerem implantação em cada classe que derivar dela, pois usa muito polimorfismo.


Renderizador:
    Usa ponteiros para VisualMesh, acessando e manipulando atributos diretamente. Inclusive chamando métodos das instâncias de ponteiro VisualMesh. Porém até aqui não declarei os objetos que usam ela. Ainda é só abstrato, chamadas, parâmetros, e expectativas de retorno. E só.


Objetos:
      Abaixo do Renderizador eu declaro todos os tipos de objetos como Cubos, triângulo, cada um com métodos implementados, recebendo o que o Renderizador envia como parâmetro e devolvendo o que o Renderizador espera receber.
O Renderizador não conhece eles individualmente, mas apenas como ponteiros do tipo VisualMesh, por causa do polimorfismo



