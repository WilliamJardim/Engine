William Jardim
28/05/2025

# Resumo ponteiros e referências

## CRIAR PONTEIROS
Quando você cria uma variável como ponteiro(ex Objeto*), essa variável pode armazenar uma instância de Objeto, ou também pode ter o valor nullptr(isso é, nulo).

Também, se Objeto é uma classe abstrata, com métodos virtual, e temos várias classes derivadas de Objeto (polimorfismo, ou seja, uma classe diferente mais que herda de uma classe mãe), esse ponteiro pode apontar tanto pra instâncias de Objeto quanto para instâncias de qualquer classe que herda Objeto.

Também é possível fazer uma conversão explícita
Ex:

<code>
Jogador* jog = new Jogador()

Objeto* obj = jog;
</code>

O C++ aceita isso de boa.

DETALHE: quando usamos o "new" pra atribuir uma instância numa variável, automaticamente o resultado do "new" é um ponteiro.


## MODIFICAR PONTEIROS
Por exemplo, se sua variável ponteiro é uma instância de um Objeto, 
Quando você passa esse ponteiro pra uma função como parâmetro, você consegue modificar os atributos desse objeto. 
Ex

<code>
<pre>
 //Cria o objeto original 
 Objeto* objeto = new Objeto();

 //A função que altera ele
 void f( Objeto* objRecebido )
   {
        Objeto* obj = objRecebido;

        obj->nome = "teste"
   }

   //Chama a função pra alterar o objeto 
   f( objeto );
</pre>
</code>

OU ENTÃO 

<code>
<pre>
   //Cria o objeto original 
   Objeto* objeto = new Objeto();

   //A função que altera ele
   void f( Objeto* objRecebido )
   {
        objRecebido->nome = "teste"
   }

   //Chama a função pra alterar o objeto 
   f( objeto );
</pre>
</code>

Isso vai modificar o objeto original, pois o ponteiro serve pra isso , pra apontar pra um mesmo endereço de memória.

Mais você não consegue mudar o ponteiro, ou seja, fazer ele apontar pra outra coisa


## FAZER UM PONTEIRO APONTAR PRA OUTRA EM UMA FUNÇÃO QUE MODIFICA ELE
Você pode criar uma função que modifica o ponteiro, atribuindo um novo valor pra esse ponteiro. Mais ela isso, você precisa usar um método diferente que vou mostrar agora:

Você precisa usar *& no parâmetro da função 

Ex:

<code>
<pre>
//Cria o objeto original 
Objeto* objeto = new Objeto();
  
// Função capaz de alterar a origem 
void m( Objeto*& obj ) {
    Objeto* novoP = new Objeto();

    obj = novoP;
 }
</pre>
</code>

Isso vai alterar pra onde o ponteiro original aponta, ou seja, mudando o objeto , ou seja, fazendo com que o ponteiro aponte para outro objeto diferente do original.

OBS: ao invés de usar *& você também pode usar ponteiro de ponteiro * *(sem espaço), que vai ter o mesmo efeito. Porém, não é a mesma coisa. Isso é mais antigo, mais estilo C mesmo. E requer mais atenção e cuidado. Mais também funciona pra muitos casos. Mais o *& é mais seguro.