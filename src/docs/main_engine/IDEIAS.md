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


