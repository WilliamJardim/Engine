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