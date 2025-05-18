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

# 15/05/2025
(RESOLVIDO) Se um cubo com fisica colide com uma parede sem fisica, ainda assim, essa parede se move

(ANALISANDO) As vezes Se um cubo com fisica colide com uma parede sem fisica, ele some, meio que é jogado pra baixo no void
ACONTECE PRINCIPALMENTE QUANDO O CUBO ESTÀ VINDO COM BAIXAS VELOCIDADES
provavelmente é por causa de alguma lógica de correção

(ANALISANDO) Se um cubo com fisica colide com uma parede sem fisica(ou com outro objeto com fisica, tanto faz), ele meio que "gruda", e ele não volta pra traz, simulando um recocheteamento
mais isso eu ainda não programei

(ANALISANDO) A função de recochetear que eu criei, ela não funciona com valores mais baixos de "porcentoDevolucaoPerda"
pois o cubo fica grudado na parede com valores menores que 90, como 80 por exemplo.
Então não consigo fazer ele voltar com uma força menor do que a que ele foi,
e acho que isso seria interessante, mais é uma limitação por enquanto.
CAUSA: Isso acontece por que no instante em que ele inverte a velocidade, ele no proximo frame já perde velocidade denovo, enquanto ele estiver colidindo com o objeto. 
SENDO QUE ELE DEVERIA SÒ TIRAR UMA VEZ NESSE CASO

    * IDEIA PRA CORRIGIR: Levar em conta a direção atual do objeto no momento da colisão(direção da ultima colisão do objeto)
    Se ela mudou, ou seja, ele está indo para outra direção, ele já não perde velocidade mais

    Pra ser mais preciso, eu posso armazenar as informações do frame anterior(ou seja, direção da ultima colisão do objeto NO FRAME ANTERIOR)

    No caso, a partir do momento que ele colidir,
    se ele esta vindo em X+, a direção X+ vai ser false, e X- vai ser true.
    E vice versa
    O mesmo vale pra Z+ e Z-

# 16/05/2025
(ANALISANDO) Quando o cubo colide com a parede, ele não rebate apenas para a direção oposta, ele vai tambem pra diagonal....
isso é um BUG, na verdade eu até entendo: pois quando ele entra em colisão, ele fica colidindo por alguns milisegundos, e isso faz com que outros eixos de rebote sejam acionados, como o Z
As vezes precisa ficar dando RELOAD na pagina pra acontecer, nem sempre 100% das vezes ocorre

# 17/05/2025
Quando um cubo cai em cima de outro cubo, ele afunda no chão, 
e dependendo da escala desse outro objeto, ele até some e cai no void

 