# 30/07/2025 23:00 PM
Meu sistema de colisão e proximidade funciona muito bem quando eu passo os limites XYZ pra ele verificar a proximidade.

E, quando eu passo o parâmetro null, pra ele usar a tabela binária interna da minha Engine, também está funcionando, ... Ele está pesquisando pelo proximityConfig das configurações do objeto do objProps.

Ao usar métodos como objeto.getProximity() e passar um limite XYZ, ele também funciona como esperado

**Problema:**

Porém ma função "updateCollisionState" do ObjectBase, o infoCollisions e infoProximity que é calculado automaticamente pela minha Engine internamente, ... Ele não está armazenando nada: nem instâncias dos objetos, nem nomes dos objetos, nem IDs dos objetos, nem nada....

Eu fui debugando pra tentar descobrir o por que, .. ainda não entendi, .... Mais percebi que tem objetos como o objeto de nome "Cubo", que logo no começo no primeiro frame, da pra ver que está funcionando, ele está detectando proximidade com o modelo 3d do meu quarto ..... Está funcionando 

Mais por algum motivo, parece que depois para de funcionar 

A lista de objetos do infoCollisions e infoProximity é zerada antes de cada frame, então, é muito provável que em algum momento, a verificação de proximidade para de funcionar por algum motivo.

Vou analisar isso melhor

TODOS ESSES TESTES FUNCIONAM CERTINHO COMO EU PLANEJEI:
    // testando
    // scene.getObjectByName("Carro").getCollisions({x:10,y:10,z:10}, true)
    // scene.getObjectByName("Cubo1").isProximityOf( scene.getObjectByName("Carro") , null )
    // scene.getObjectByName("Carro").isProximityOf( scene.getObjectByName("Cubo1") , null )
    // scene.getObjectByName("Cubo1").isProximityOf( scene.getObjectByName("Chao") , null )
    // scene.getObjectByName("Cubo1").infoProximity 


# 31/07/2025 15:43 (RESOLVIDO)
Os IDs dos objetos que estavam colidindo com outros, não apareciam na lista do infoProximity do objeto
Isso erá um bug no código

# 31/07/2025 15:43 
BUG: as classes não estavam sendo zeradas no infoProximity e infoCollisions do objeto, quando o objeto se afastava dos objetos que estavam colidindo com ele,.... os nomes deles, ids, somem das listas, ... mais as classes continuavam

# 31/07/2025 16:10
tambem os cubos não estão detectando colisão e proximidade com outros cubos, só com o chão, meu quarto, e o carro
As vezes um detecta o outro, mais é mais raro

# 31/07/2025 16:10
BUG: DETECÇÂO DE COLISÂO UNILATERAL

    Com isso: scene.getObjectByName("Cubo2").isProximityOf( scene.getObjectByName("Cubo"), null )

        O Cubo2 conseguiu detectar que estáva proximo do Cubo, e o proximityInfo dele estava OK

        POREM o contrario não foi verdade, o Cubo não detectava que estava proximo do Cubo2 e no proximityInfo dele não tinha nada
        então o outro teste falhou: scene.getObjectByName("Cubo").isProximityOf( scene.getObjectByName("Cubo2"), null ) 

    No main eu preciso continuar os testes:
        // testando colisões
        if(scene != null &&  scene.getObjectByName("Cubo2") != null && scene.getObjectByName("Cubo1") != null )
        {
            if( scene.getObjectByName("Cubo2").isProximityOf( scene.getObjectByName("Cubo1"), null ) )
            {
                debugger
            }

            if( scene.getObjectByName("Cubo1").isProximityOf( scene.getObjectByName("Cubo2"), null ) )
            {
                debugger
            }
        }

        if(scene != null &&  scene.getObjectByName("Cubo1") != null && scene.getObjectByName("Cubo") != null )
        {
            if( scene.getObjectByName("Cubo").isProximityOf( scene.getObjectByName("Cubo1"), null ) )
            {
                debugger
            }

            if( scene.getObjectByName("Cubo1").isProximityOf( scene.getObjectByName("Cubo"), null ) )
            {
                debugger
            }
        }

        if(scene != null &&  scene.getObjectByName("Cubo2") != null && scene.getObjectByName("Cubo") != null )
        {
            if( scene.getObjectByName("Cubo").isProximityOf( scene.getObjectByName("Cubo2"), null ) )
            {
                debugger
            }

            if( scene.getObjectByName("Cubo2").isProximityOf( scene.getObjectByName("Cubo"), null ) )
            {
                debugger
            }
        }

