Sempre quando voce for criar uma classe que é uma derivação de outra classe mãe, então, voce vai precisar fazer isso:
*LEIA COM ATENÇÂO!*

# CODIGO DA CLASSE BASE
<code>
// <--- DECLARE OS SEUS TIPOS QUE VOCE VAI USAR PRA EVITAR ERROS (SE PRECISAR)
class Scene;
class Objeto;
class Carro;

class ObjetoBase{
    public: 
       string nome;
       Scene* referenciaCena;
       ObjetoBase* objectBelow;

    ObjetoBase( string nomeObjeto ) 
        // Incializando atributos da classe
        : nome(nomeObjeto),
          referenciaCena(nullptr),
          objectBelow(nullptr)
    {
        
    }

    virtual void atualizarObjeto( Scene* cena, ObjetoBase* contextoObjeto )
    {   
        
    }

    [... OUTROS METODOS OU METODOS VIRTUAIS AQUI]
}
<code>

# CODIGO DE UMA CLASSE DERIVADA DELA
<code>
class Objeto : public ObjetoBase{
    public: 
       // NÃO declare de novo essas variáveis:
       // string nome;
       // Scene* referenciaCena;
       // ObjetoBase* objectBelow;

    // Como é uma classe derivada, não precisa redeclarar o construtor, apenas chamar o da classe mãe
    Objeto( string nomeObjeto ) : ObjetoBase( nomeObjeto ){}

    void atualizarObjeto( Scene* cena, ObjetoBase* contextoObjeto ) override
    {
        ObjetoBase* esteObjeto     = this;
        Scene* cenaObjeto          = esteObjeto->getCena(); 
        int num = 10;
    }

    void mudarNome( string novoValor ) override
    {
        nome = novoValor;
    }

    [... OUTROS METODOS OU METODOS VIRTUAIS AQUI]
}
</code>

# CODIGO DE OUTRA CLASSE DERIVADA DELA
<code>

class Carro : public ObjetoBase{
    public: 
       // NÃO declare de novo essas variáveis:
       // string nome;
       // Scene* referenciaCena;
       // ObjetoBase* objectBelow;

       // MAIS PODE DECLARAR OS NOVOS
       string tipo;

    // Como é uma classe derivada, não precisa redeclarar o construtor, apenas chamar o da classe mãe
    Carro( string nomeObjeto, string tipoCarro ) 
    : ObjetoBase( nomeObjeto ),
      tipo(tipoCarro)
    {
        
    }

    void mostrarMensagemQualquer()
    {
        
    }

    // FUNCAO QUE ILUSTRA ALGO ESPECIFICO QUE SÒ O CARRO VAI FAZER
    void fazerAlgoEspecifico()
    {
       
    }

    [... OUTROS METODOS OU METODOS VIRTUAIS AQUI]
}
</code>

Percebeu? 
*Não dereclare atributos ou métodos que a classe base ja tem! Apenas use eles.*
*No construtor da classe derivada, apenas chame o construtor da classe mãe*
*Se tiver novos atributos que voce precisar criar, adicione eles depois da chamada do construtor da classe mãe*

Se eu não fizer assim, o compilador pode não entender quando voce tentar acessar esses atributos ou métodos.

*Isso não impede overrides, nem implantações de métodos virtuais!*
