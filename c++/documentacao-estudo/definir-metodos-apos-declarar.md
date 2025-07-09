
## COMO DEFINIR MÈTODOS DE UMA CLASSE DEPOIS DE OUTRAS CLASSES
Em C++, quando voce precisa que um método especifico seja apenas declarado MAIS SEM SER DEFINIDO, PARA QUE SEJA definido só depois mais pra frente
isso necessário por exemplo quando algum método precisa usar alguam variavel ou método de uma classe que só é definida abaixo da classe atual, o que gera erros de atributos incompletos ou que não foram declarados.

Mais declarar e resolver esses erros é totalmente possivel.
Veja o exemplo:

<code>

class ObjetoBase{
    public: 
       string nome;
       ObjetoBase* objectBelow;
       Scene* referenciaCena;

    ObjetoBase( string nomeObjeto ) 
        // Incializando atributos da classe
        : nome(nomeObjeto),

          // Inclusive os que por enquanto vão estar nulos
          objectBelow(nullptr),
          referenciaCena(nullptr)
    {
        
    }

    [...]

    void atualizarObjeto(Scene* cena, ObjetoBase* contextoObjeto);  // Apenas declaração aqui
    
    [...]
};
</code>

*IMPORTANTE: APENAS DECLARAMOS atualizarObjeto, mais ainda não programamos ele*

E podemos definir a lógica do método depois, quando a Scene ja estiver definida, por exemplo

<code>
class Scene{
    public: 
       vector<ObjetoBase*> objetos;
       string nomeCena;
    
    [... METODOS DA CENA]
}

[...]
</code>


## DEFININDO O METODO QUE FALTA
<code>
// EU AQUI ESTOU DEFININDO O METODO atualizarObjeto do ObjetoBase, que eu só tinha declarado nele mais não definido
// INTERESSANTE: Poder definir métodos de classe em outro momento, quando tem dependencias 
// ISSO SERVE QUANDO O METODO REQUER ATRIBUTOS QUE SÒ SÂO DEFINIDOS APÒS O OBJETO TER SIDO DEFINIDO
void ObjetoBase::atualizarObjeto( Scene* cena, ObjetoBase* contextoObjeto )
{
    ObjetoBase* esteObjeto     = this;
    Scene* cenaObjeto          = esteObjeto->getCena(); 

    if( esteObjeto != nullptr )
    {
        std::cout << "\n O PONTEIRO DO OBJETO BASE NAO ES NULO";
    }
    if( cenaObjeto != nullptr )
    {
        std::cout << "\nATUALIZANDO OBJETO " << esteObjeto->nome << " QUE ESTA NA CENA " << cenaObjeto->nomeCena << '\n';
    }
}

</code>

PRONTO! Agora o método atualizarObjeto consegue fazer tudo o que ele tem que fazer, e usar tudo o que ele precisa usar,
pois no momento da declaração de atualizarObjeto, a Scene já está definida por completo

