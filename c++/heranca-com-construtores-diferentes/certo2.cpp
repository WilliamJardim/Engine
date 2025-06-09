/**
* William Jardim
* 28/05/2025
* 
* Esse exemplo ilustra como usar polimorfismo para poder criar objetos que herdam outros objetos
* E incluir os objetos derivados da classe base dentro de um mesmo Array, percorrendo esse Array com um laço de repetição FOR e executando funções que foram implementadas
* E lenvando em conta que cada derivação pode ter atributos e métodos completamente diferentes do original 
*/
#include <iostream>  // Inclui a biblioteca para entrada e saída
#include <vector>
using namespace std;

class ObjetoBase{
    public: 
       string nome;

    ObjetoBase( string nomeObjeto ) 
        // Incializando atributos da classe
        : nome(nomeObjeto)
    {
        
    }

    virtual void mudarNome( string novoValor )
    {
       // Este método precisa ser implementado em classes derivadas
    }

    virtual string getNome()
    {
        // Este método precisa ser implementado em classes derivadas
        return "";
    }
};

class Objeto : public ObjetoBase{
    
    // NAO PRECISA REDECLARAR NADA DO ObjetoBase, a herança ja vai fazer isso

    public: 
          string idade;
          
          Objeto( string nomeObjeto ) 
           // Faz a herança dos métodos e atributos
           : ObjetoBase( nomeObjeto ),

             // Mais pode inicializar os novos atributos
             idade("TESTE")

           // NAO PRECISA INICIALIZAR DENOVO NADA DO ObjetoBase
    {
        
    }

    void mudarNome( string novoValor )
    {
        nome = novoValor;
    }

    string getNome()
    {
        return nome + idade;
    }
};



class Carro : public ObjetoBase{
    public: 
       // NAO PRECISA REDECLARAR NADA DO ObjetoBase, a herança ja vai fazer isso
       // SO VOU CRIAR OS NOVOS DADOS:
       string tipo;

    Carro( string nomeObjeto, string tipoCarro ) 
    
          // Faz a herança dos métodos e atributos
          : ObjetoBase( nomeObjeto ),

          // Incializando atributos NOVOS da classe
          tipo(tipoCarro)

          // NAO PRECISA INICIALIZAR DENOVO NADA DO ObjetoBase
    {
        
    }

    // FUNCAO QUE ILUSTRA ALGO ESPECIFICO QUE SÒ O CARRO VAI FAZER
    void fazerAlgoEspecifico()
    {
        std:cout << "(RODANDO getNome no carro:)\n";
    }

    /***
    * ATENCAO: SE VOCE ESQUERCER DE IMPLEMENTAR UM METODO, ELE VAI SER IGNORADO NA HORA QUE FOR CHAMADO
    */

    string getNome()
    {
        fazerAlgoEspecifico();
        return nome;
    }

    string getTipo()
    {
        return tipo;
    }

    void acelerar()
    {

    }

    void freiar()
    {

    }
};

class Scene{
    public: 
       vector<ObjetoBase*> objetos;

    Scene() 
         :
         objetos({}) // Inicializa a lista de objetos como um vetor vazio
    {
            
    }

    /**
    * Adiciona um objeto na cena 
    */
    void adicionarObjeto( ObjetoBase* objeto )
    {
        objetos.push_back( objeto );
    }

    void listarObjetos()
    {
        std::cout << "\n LISTA OBJETOS NA CENA:";

        for( int i = 0 ; i < 5 ; i++ )
        {
             ObjetoBase* obj = objetos[i];

             std::cout << "\n" << obj->getNome();
        }

        std::cout << std::endl; 
    }
};

int main() {
    // Criando a cena
    Scene* cena = new Scene();

    // Criando objetos diferentes
    Objeto* objeto1 = new Objeto("Objeto 1");
    Carro*  carro1  = new Carro("Carro 1", "Chao");

    // Adicionando ambos os objetos na cena
    cena->adicionarObjeto( objeto1 );
    cena->adicionarObjeto( carro1 );

    // Mostra os objetos que estao na cena
    cena->listarObjetos();  

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}