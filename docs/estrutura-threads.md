**Nota escrita 12/08/2025 as 17:37 PM, e concluída as 18:21 PM**, por William Alves Jardim, adicionada [neste commit](https://github.com/WilliamJardim/Engine/commit/aaf943a63a9a5451d308a9de5326880717412ae9), explicando a estrutura de threads da minha Engine, que eu planejei e construí especificamente para esse projeto, ao longo do desenvolvimento dele.

Criei essa nota para descrever em detalhes a estrutura de threads de minha Engine, para fins de documentação, aprendizado e posterior consulta por mim caso um dia eu queria migrar meu código pra C++. 

Essa é a estrutura de threads que eu planejei para meu código TypeScript ser **100% portável para C++**, fazendo uso de conceitos presentes na linguagem C++ dentro do TypeScript, como **threads(simulado no navegador), contextos, funções, classes, métodos construtores, etc.**
Eu planejei isso e fui construindo essa estrutura gradualmente, ao longo do desenvolvimento desse projeto.

# Estrutura de threads
Minha Engine usa apenas uma única thread para tudo, um conceito chamado de single-thread. 

## Classe `ThreadInstance` e sua finalidade:
Para isso, eu criei uma classe chamada `ThreadInstance` para simular uma instancia de uma Thread, porém, no navegador.
Abaixo mostro um exemplo de como eu crio a thread principal da minha engine, extraido da linha 723, da função `iniciar`, do arquivo `IntegradorCamadas.ts`:

```javascript
// Cria a Thread principal usada na renderização
const thread_principal = new ThreadInstance( context.thread_loop_principal, context ); // Executa a função loop_principal passando o própia context, ou seja, o this

thread_principal.detach(); // Permite que a Thread rode em segundo plano
```

Ela não cria um Thread real, apenas simula isso conceitualmente, para fins de tornar meu projeto mais facil de ser portado para C++, por seguir uma estrutura mais linear e classica.

No construtor da classe `ThreadInstance`, eu tenho 2 parametros principais: `funcaoChamar` e `contextoFuncao`. A `funcaoChamar` é uma função que eu quero chamar(a função será a thread em si, ou seja, uma função que contém os códigos que eu quero que a thread faça). E o `contextoFuncao` é o contexto da classe, no caso, ele é minha variavél `context`, que no contexto da minha função `iniciar` é o `this`, ou seja, o contexto da própia instancia de `IntegradorCamadas`.

Os outros parametros são adicionais e opcionais. Caso você não passe nenhum outro parametro, a Thread que será criada não vai receber nenhum parametro. Porém, se você passar mais parametros depois do `contextoFuncao`, ai, a Thread que será criada vai receber esses parametros como parametros da funçao `funcaoChamar`. Esses parametros adicionais ficam dentro da variável `...outrosParametros` na declaração do construtor da minha classe `ThreadInstance`.

A função que minha thread principal chama é `thread_loop_principal`, que está dentro da instancia de classe `IntegradorCamadas`. Tanto é que, para chamar, eu uso o `context.thread_loop_principal` que seria o mesmo que `this.context.thread_loop_principal` ou `this->thread_loop_principal` se eu estivesse escrevendo em C++.

## Função da thread principal
A `thread_loop_principal` é uma função que não recebe nenhum parametro, pois tudo o que ela precisa já está dentro da própia instancia da classe `IntegradorCamadas`, acessada por meio do `this`(no caso o meu `context`) 

Ela é a função da thread principal, que chama várias sub-funções(que eu chamei de etapas de renderização), por exemplo

 - `loop_entrada_teclado`: Uma sub-função dedicada para fazer o processamento da entrada do teclado. Ela verifica em tempo real quais teclas estão sendo precionadas e registra isso no `IntegradorCamadas`, para posterior consulta pela Engine.

 - `loop_entrada_mouse`: Uma sub-função dedicada para fazer o processamento da entrada do mouse. Ela obtém em tempo real qual é a posição X e Y do mouse, e registra isso no `IntegradorCamadas`, para posterior consulta pela Engine.

 - `loop_principal`: Uma sub-função dedicada para fazer o processamento da lógica, fisica e renderização, de tudo.

**Nota: embora o nome seja sempre `loop_<algumaCoisa>`, na realidade, o loop está na função `thread_loop_principal` que têm um laço de repetição `while`, que executa todas essas funções citadas a cada momento, ou seja, a cada frame. Em outras palavras, cada iteração desse laço de repetição while representa o processamento de um frame completo. Esse laço de repetição `while` vai executar enquanto o `executandoRenderizacao` for `true`.**

**Nota: tudo acontece em ordem sequencial, primeiro minha Engine "lê" o teclado e o mouse, e só depois roda o processamento do frame.**

Abaixo mostro o código da minha função `thread_loop_principal`:

```javascript
/**
* @Thread 
* Thread principal, responsavel por fazer todas as chamadas necessárias para a lógica e renderização. 
* 
* NOTA CASO EU QUEIRA PORTAR PRA C++ UM DIA: 
*   29/07/2025 22:25 PM
*   Como minha thread principal ela faz tudo: a renderização gráfica e também, o processamento da lógica de jogo, fisica, teclado, mouse, etc
*   eu não preciso me preocupar com concorrencia e nem sincronização de threads. No entando, se eu precisar ter alguma thread que acessa dados que uma thread está escrevendo por exemplo, ai eu precisaria usar mutex, atomics, condition_variable do C++
*   só esse detalhe, caso um dia eu queira portar isso pra C++
* 
*   Tambem não preciso me preocupar com tempo de vida, pois, as variaveis e ponteiros não são destruidos em lugar nenhum.
*   Se uma thread fizesse uso de alguma variavel ou ponteiro que pode ser destruido em algum momento, eu preciso tratar isso, para a thread não dar crash no programa.
*   Eu preciso ter certeza de que todas as variaveis que uma thread usa vão estar realmente disponiveis e não tenham sido destruidas.
* 
* NOTA DE PORTABILIDADE PRA C++:
*   Não precisaria ter "async" depois do "public"
*   O "Thread<void>" seria apenas void. Isso é uma função que funcioan de forma sincrona.
*   "await" também não existiria.
*/
public async thread_loop_principal(): Thread<void>
{
    const context             : IntegradorCamadas = this;

    // Se o ponteiro não for null
    if( this.canvasRef.current != null )
    {   
        // Se já estiver rodando
        while( context.executandoRenderizacao == true )
        {
            /**
            * Faz o processamento do teclado e mouse 
            */
            await this.loop_entrada_teclado();
            await this.loop_entrada_mouse();

            /**
            * Faz o processamento de logica de jogo, fisica e renderização  
            */
            await this.loop_principal();
        }

        // Quando o loop principal terminar
        this.encerrar();
    }   
}
```

**NOTA: Acima mostro como o código do `thread_loop_principal` estava até o dia 12/08/2025(data que essa nota foi escrita).**

## Função `iniciar`
A função `iniciar` ela inicia tudo da minha Engine. Ela cria a thread principal, e sinaliza informações para o meu mini renderizador, como a variavel `provavelmentePronto` e `executandoRenderizacao`.

## Função `encerrar`
Assim como a função `encerrar`, que define valores para indicar que a Engine parou de processar, encerrou seu ciclo de vida.

# Links úteis:
 - Link do último commit do projeto antes da criação dessa nota: [Commit do dia 10/08/2025 - Código do meu projeto antes de escrever essa nota](https://github.com/WilliamJardim/Engine/tree/bf173344474f416bcd4ffe8a81d828c270448dca)