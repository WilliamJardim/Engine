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

# 31/07/2025 16:29 PM
BUG: os cubos ao ficarem no chão, andando levemente com a força restantante do arremeço inicial que eu faço, eles as vezes afundam no chão
só vi acontecer uma vez nos testes de hoje

# 01/08/2025 15:42 PM
Testar valores mais altos de proximityConfig 
E ver se todos os cubos podem detectar proximidade uns aos outros

Se não, aí tem erro

# 01/08/2025 15:42 PM (EU TO ANALISANDO)
Sobre o BUG da detecção unilateral de proximidade. Eu tenho uma hipótese de explicação:

No teste que eu fiz foram com um dos cubos. 
Um dos cubos detectou com sucesso a proximidade com o outro cuco. Ok. Isso está correto.

Porém o contrário não foi verdade: o outro cubo, que estava na mesma distância, e tinha a mesma escala. E além disso tinha a mesma configuração de proximityConfig, não conseguiu detectar a proximidade com o ele

Foi um caso de colisão unilateral: apenas uma das partes conseguiu identificar. E a outra não.

Eu raciocínei o seguinte: se a distância entre os dois cubos é mesma, e se eles tem a mesma escala, e a mesma configuração de proximityConfig, e mesmo assim, só uma das partes conseguiu identificar e a outra não.
Matematicamente e logicamente falando, a única hipótese mais possível pra isso acontecer seria se a minha função que faz a verificação de proximidade está usando uma lógica diferente para cada eixo(ou seja, não está executando exatamente a mesma lógica pra todos os eixos, e pra todos os sentidos)
Valores de posição podem ser negativos, e uso valor absoluto e isso pode afetar tbm 

E isso também explicaria o por que em alguns casos, alguns objetos conseguem identificar três objetos, e já outros só dois. Explicaria a imprecisão da verificação de proximidade e o por que as vezes falha

# 01/08/2025 16:53 PM - Cubos podem afundar no chão depois de um tempo
BUG: os cubos ao ficarem no chão, andando levemente com a força restantante do arremeço inicial que eu faço, eles as vezes afundam no chão
Aconteceu umas 3 vezes