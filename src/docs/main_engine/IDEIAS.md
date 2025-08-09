# Ideias da minha engine de logica/fisica

Nota adicionada em 15 de julho de 2025, [neste commit](https://github.com/WilliamJardim/Engine/commit/c37e7f3c66ff432f3670e72b23b7319e05799844#diff-3073b4842f9abc296af5a3ecb9bd816cbf3ef0bcd4535dd0b5df7f1f52ed6aa8).

## Destaques histórico de commits desse arquivo de ideias de minha engine de logica/fisica:
Essa nota descreve minhas ideias que eu tive ao longo do tempo para e minha engine de logica/fisica, cujo os códigos ficam dentro da pasta `src/engine/core/`.

 - Até [este commit](https://github.com/WilliamJardim/Engine/blob/ff94942eb0bb49785b7fb97531c1b8a9f0b0533c/src/docs/) **de 08 de agosto de 2025**, este arquivo ainda estava na pasta `src/docs`(digo "ainda estava" por que pretendo mover a documentação inteira de lugar no próximo commit). 

# 30/07/2025 22:57 PM
Criar um atributo no meu ObjectBase chamado mostrarCaixaProximidade, mostrarCaixaColisao

Que vai desenhar um cubo transparente azul claro pra indicar a zona de colisão do objeto para com os outros objetos. Pra facilitar na hora de debugar colisões e proximidade

# 30/07/2025 23:00 PM
Na função "updateCollisionState" Simplificar e otimizar esse meu trecho de código: pois ele usou muitos laços for que ficam percorrendo as classes, e isso pode pesar se o objeto tiver muitas classes:
<code>
                        //Se houve uma proximidade
                        if( isProximity( esteObjeto, objetoAtualCena, esteObjeto.objProps.proximityConfig ) === true )
                        {
    
                            // Registra as colisões detectadas
                            esteObjeto.infoProximity.objectNames.push( objetoAtualCena.name );

                            // Por nome
                            esteObjeto.scene.proximityTable.byName[ esteObjeto.name ].push( objetoAtualCena );
                            esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = true;
                            esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ]   = true;

                            // infoProximity
                            esteObjeto.infoCollisions.objectIDs.push( objetoAtualCena.id );

                            // Por ID
                            esteObjeto.scene.proximityTable.byID[ esteObjeto.id ].push( objetoAtualCena );
                            esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = true;
                            esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id ]   = true; 
                            
                            // Por classes
                            for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                            {
                                 const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];
                                 
                                 esteObjeto.infoProximity.objectClasses.push( nomeClasse );
    
                                 // Por nome da classe
                                 esteObjeto.scene.proximityTable.byClasses[ nomeClasse ].push( objetoAtualCena );
                                 esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = true;
                                 esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ] = true;
                            }
                            
                            esteObjeto.infoProximity.objects.push( objetoAtualCena );


                        // Se não está mais proximo, desmarca na tabela binaria, tanto por nome, id e classes
                        }else{
                            // Por nome
                            esteObjeto.scene.proximityTable.byName[ esteObjeto.name ].push( objetoAtualCena );
                            esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.name ] = false;
                            esteObjeto.scene.proximityBinaryTable.byName[ esteObjeto.name ][ objetoAtualCena.id ]   = false;

                            // Por ID
                            esteObjeto.scene.proximityTable.byID[ esteObjeto.id ].push( objetoAtualCena );
                            esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.name ] = false;
                            esteObjeto.scene.proximityBinaryTable.byID[ esteObjeto.id ][ objetoAtualCena.id ]   = false; 

                            // Por classes
                            for( let classeIndex:int = 0 ; classeIndex < objetoAtualCena.objProps.classes.length ; classeIndex++ )
                            {
                                 const nomeClasse : string = objetoAtualCena.objProps.classes[classeIndex];
                                 
                                 esteObjeto.infoProximity.objectClasses.push( nomeClasse );
    
                                 // Por nome da classe
                                 esteObjeto.scene.proximityTable.byClasses[ nomeClasse ].push( objetoAtualCena );
                                 esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.name ] = false;
                                 esteObjeto.scene.proximityBinaryTable.byClasses[ nomeClasse ][ objetoAtualCena.id ]   = false;
                            }

                        }
</code>

# 03/08/2025 15:32 PM
Centralizar a lógica do meu ObjectBase.ts dentro do meu Scene.ts, para ele não fazer chamadas de métodos do Renderizador e nem dos objetos dentro dele
tentar centralizar ao maximo que der no arquivo Scene.ts os métodos de fisica, que observam os outros objetos na cena para aplicar fisica,.... 
Pois fica mais facil manter tudo no Scene.ts, pra não causar confusão e conflitos na hora de fazer herança

Isso vai inclusive facilitar pra mim integrar minha classe jogador na fisica e logica do jogo
eu vou poder criar novos laços de repetição pra tratar os jogadores por exemplo. 

**PASSOS QUE VOU PRECISAR SEGUIR PRA APLICAR ISSO:**
  # 05/08/2025 16:25 PM - IDEIA DE TRANSFERIR OS METODOS DO ObjectBase para o Scene.ts, para simplificar e centralizar tudo
  Continuei avaliando como vou fazer isso: E eu achei melhor eu começar a transferir os métodos "updatePhysics", "updateCollisionState", "updateMovement", "updateRotation", "updateEvents" e "updateAttachments" para dentro do meu Scene.ts

  # 05/08/2025 16:27 PM - CONTINUEI AVALIANDO
  O meus métodos "isCollisionOf", "getCollisions", "getProximity" e "isProximityOf" tambem vão precisar ser transferidos para o Scene.ts


# 03/08/2025 15:35 PM
Terminar minha classe Player.

TESTES:
 - Criar uma instância de jogador na cena.
   Ele precisa atualizar o objeto do jogador. Não pode dar erros.

 - Também ao criar a instância do jogador, ele precisa receber a primeira câmera criada dentro dele como atributo, 

 - e a primeira câmera precisa ser sempre a câmera ativa enquanto o jogador estiver ativo(exceto se tiver em alguma cena externa)

TERMINAR MINHA CLASSE PLAYER E TESTAR TUDO ISSO

Essa parte do "exceto se tiver em alguma cena externa", é uma outra ideia que eu tive, que se um atributo booleano for true, ele vai ignorar a lógica de definir a camera do jogador como ativa, e vai permitir que eu defina qualquer camera como ativa, enquanto o atributo booleano for true. 
Caso ele seja false, a camera ativa volta a ser a camera do jogador ativo. (ISSO JA FIZ)

# 03/08/2025 16:02 - IDs e Referencias para as cameras em primeira e terceira pessoa do jogador
Depois eu preciso lembrar de outra ideia que tive: Levar em conta o "modoCamera" do Player. Ao invez de ter apenas um "idCameraAtual" e "refCameraAtual", a classe Player poderia ter "idCameraAtual_primeira_pessoa" e "idCameraAtual_terceira_pessoa", assim como o "refCameraAtual_primeira_pessoa" e "refCameraAtual_terceira_pessoa"
Tambem preciso criar casos onde só vai existir uma das opções de camera no jogador(caso eu criei com apenas uma delas), e o jogo vai precisar respeitar isso. 

# 03/08/2025 16:08 
IDEIA: Transferir a lógica de movimentação e rotação da camera para a função "updateJogadores", para que, ele use o InputListener para tratar os comandos de teclado e mouse, e assim, manipular a movimentação e rotação da camera do jogador ativo.
Isso vai trazer uma obrigação para a cena: *Ter pelo menos um jogador*, pois sem o jogador, não será possivel movimentar nem rotacionar a camera.

Com isso tive ainda outra ideia: Criar um modo jogador-inspetor, que vai servir para voar livremente pelo cenário, sem receber fisica, nem nenhuma logica de jogo.

# 04/08/2025 16:01 PM (ACHEI MELHOR NÂO MEXER NISSO, NÂO É RELEVANTE PRA MIM AINDA)
IDEIA: remover a função getPropriedadesCamera e no lugar dela, acessar os atributos diretamente no RenderizadorCena.ts
Isso reduz a quantidade de chamadas desnecessarias

# 04/08/2025 16:02 PM (FEITO 16:38 PM)
IDEIA: remover alguns comentários antigos e não usados. Remover chamadas desnecessarias.

# 05/08/2025 16:25
IDEIA: Tipar os meus callbacks de eventos dos objetos

# 06/08/2025 20:31 PM - Thread só para Audio (INVIÁVEL)
IDEIA: Refatorar meu AudioPlayer. Criar uma Thread só para audio, e criar uma estrutura mais proxima do C++ para reprodução de audio.

  Hoje dia 08/08/2025, tentei fazer isso, e não consegui: Tentei criar uma nova Thread para ler as entradas de teclado, porém não consegui por conta que eu não consegui ter dois laços de repetição while um para cada thread, sem bloquear a executação no navegador. Então deixei alguns trechos de minha tentativa apenas como exemplo mesmo de ideia para caso eu tente fazer isso de forma diferente no futuro, ou mesmo, tente migrar pra C++. 
  POR ISSO THREAD DE AUDIO TAMBEM NÂO VOU CONSEGUIR CRIAR

# 06/08/2025 20:34 PM - Integrador de camadas
IDEIA: Mover o RenderizadorCena.ts para um nivel superior, dentro da pasta `engine`, e mudar o nome dele para um nome mais geral, tipo "IntegradorCamadasEngine" ou "IntegradorSubEngines", pois eu tive a ideia de chamar as partes da minha engine de camadas: camada de renderização, camada de audio, camada de logica/fisica, camada de entrada, etc...

# 06/08/2025 20:35 PM - Thread de entrada (INVIÁVEL)
IDEIA: Criar uma Thread só para entrada, para expandir o meu InputListener.ts, num estilo de código que lembra mais o estilo de código do C++

  Hoje dia 08/08/2025, tentei fazer isso, e não consegui: Tentei criar uma nova Thread para ler as entradas de teclado, porém não consegui por conta que eu não consegui ter dois laços de repetição while um para cada thread, sem bloquear a executação no navegador. Então deixei alguns trechos de minha tentativa apenas como exemplo mesmo de ideia para caso eu tente fazer isso de forma diferente no futuro, ou mesmo, tente migrar pra C++. 

# 08/08/2025 19:14 PM (TERMINADO 22:07 PM)
IDEIA: Ao invez de criar uma segunda thread só pra entrada de teclado e mouse, 
eu posso usar a thread principal mesmo e separar em sub-chamadas de funções mesmo

  exemplo: 

  thread_loop_principal(): Thread<void>
  {
    this.loop_entrada_teclado();
    this.loop_entrada_mouse();
    this.loop_principal();

    outros loops aqui...
  }

  e o loop_entrada estaria rodando na thread principal mesmo, assim tudo continua usando apenas uma unica thread.
  eu poderia até separar os loops por arquivos.

   ## 08/08/2025 19:55 PM
   Criei a função "loop_principal" para ter toda a lógica de renderização, logica de jogo e fisica.

   E criei as funções "loop_entrada_teclado" e "loop_entrada_mouse", por enquanto em branco, pois são só esbolços do que eu quero fazer.

   ## 08/08/2025 22:07 PM
   Terminei de fazer essa minha ideia: movi a lógica de captura de teclado e mouse da classe "ArmazenadorEntradaTecladoMouse" para a função "injetarScriptCapurarEntradaNavegador" nas variaveis globais "keyDetection_geral" e "mousePosition_geral". E criei as funções: "lerPosicaoMouse" e "isPrecionandoTecla" que são usadas dentro das minhas funções "loop_entrada_teclado" e "loop_entrada_mouse", para simplificar a leitura de teclas do teclado e de posição do mouse, de forma abstraida, e sem precisar me preocupar com detalhes do javascript no navegador. Esses detalhes que eu abstrai eu fiz isso por causa de uma ideia que eu tive para tornar meu código mais direto e facilitar uma futura migração para C++ . A lógica de leitura de teclado e mouse continua exatamente a mesma: porém, abstraida dessa forma como eu descrevi aqui nessa mensagem de commit.  
   Toda a lógica contida no arquivo na função "injetarScriptCapurarEntradaNavegador" ela é especifica para o navegador, e numa migração para C++, ela não seria portada, pois só serve no navegador. 

   A classe "ArmazenadorEntradaTecladoMouse" apenas armazena as informações de teclado e mouse, e permite consultar elas de uma forma mais elegante através de uma função "isTeclando", que serve para verificar se uma teclado do teclado está sendo precionada. Isso pretendo usar em regras de jogo.