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