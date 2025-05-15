# 28/04/2025
(CORRIGIDO) BUG: A partir do momento em que a minha Engine começa a atualizar os objetos(quando o renderizador sinaliza que está pronto), todos os objetos na cena somem, literalmente. 
Antes dele sinalizar, da pra ver todos os objetos lá onde deveriam estar inicialmente, porém, a partir do momento em que a Engine começa a rodar suas lógicas, todos os objetos somem: tanto os objetos estáticos, quanto os objetos com física.

Aí a física começa a ser aplicada como deveria, internamente na lógica do jogo. Porém, não dá pra ver nada. Mais a física está funcionando normalmente, eu testei isso. Os objetos estão caindo(porém de forma invisível por causa desse bug)

Porém, o estanho é que, os objetos que tem física só voltam a aparecer quando eles caem no chão. Aí eles voltam.
Mais os outros objetos sem física não volta a aparecer.

Eu verifiquei e tanto a posição, quanto a velocidade do objeto estático(sem física) continuam intactas, o que significa que a lógica de física está correta não está sendo aplicada sobre esses objetos estáticos, somente nos objetos com física, está correto.

Porém, o estanho é que, depois que esses objetos com física apareceram, eu consigo ver eles caindo no void se eu jogar eles no void. 

Então, o problema mesmo é logo no começo, quanto a Engine começa a atualizar os objetos, é que tudo some. Mais aí, quando os objetos com física(mesmo invisíveis) caem no chão pela primeira vez, aí eles aparecem, e se eu jogar eles no void ou pra cima, dá pra ver eles caindo normalmente.

Obs: Não existe nada no código da Engine que faça os objetos serem invisíveis.

## ESSE PROBLEMA ESTAVA NO CÒDIGO
<code>
    [...]

    if( threeMesh != null && threeMesh != undefined )
    {
        /**
        * Espelha atributos que a minha engine informou
        */
        const position : THREE.Vector3 = objetoAtual.getMesh().position as THREE.Vector3;
        const rotation : THREE.Vector3 = objetoAtual.getMesh().rotation as THREE.Vector3;
        const scale    : THREE.Vector3 = objetoAtual.getMesh().scale    as THREE.Vector3;

        if(position != undefined && position != null)
        {

        [...]

    [...]      
</code>

ENQUANTO ESSA LINHA DE CÒDIGO NUNCA FOR EXECUTADA, OS OBJETOS TODOS APARECEM NORMALMENTE
MAIS A PARTIR DO MOMENTO EM QUE ESSA LINHA DE CÒDIGO È EXECUTADA, TUDO SOME
E AI O RESTO DO BUG OCORRE, ALGUNS VOLTAM DEPOIS DE CAIR NO CHAO (os objetos com fisica), mais outros não voltam(como os objetos sem fisica)

Depois eu comentei uma linha de código

<code>
                /*
                O PROBLEMA QUE FAZ TUDO SUMIR È A ROTAÇÂO
                if(rotation != undefined && rotation != null)
                {
                    if( !isNaN(scale.x) && scale.x != undefined && scale.x != null ){
                        threeMesh.rotation.x = rotation.x;
                    }
                    if( !isNaN(scale.y) && scale.y != undefined && scale.y != null ){
                        threeMesh.rotation.y = rotation.y;
                    }
                    if( !isNaN(scale.z) && scale.z != undefined && scale.z != null ){
                        threeMesh.rotation.z = rotation.z;
                    }
                }*/
</code>

# 14/05/2025
As vezes um objeto ao quicar no chão com o "kick_rate" ativo, ele faz o chão se mover

As vezes um objeto ao quicar no chão com o "kick_rate" quica tão pouquinho que nem dá pra ver
isso provavelmente tem haver com o vento
porém ajustar o valor de "kick_rate" dos objetos melhora

(RESOLVIDO) Os objetos que quicam nunca param de quicar

Os objetos quicam minusculamente quando a engine está em camera lenta