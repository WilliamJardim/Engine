/**
* William Jardim
* 09/07/2025
*
* ABRANJE: Construtores, herança, polimorfismo, implentação de métodos virtuais nos objetos
*          Ponteiros que podem ser nulos, e fazem referencias(apontam) a outros objetos
*
*          Declaração de métodos que só serão definidos depois
*/

#include <iostream>  // Inclui a biblioteca para entrada e saída
#include <vector>
using namespace std;

// <--- DECLARE OS SEUS TIPOS QUE VOCE VAI USAR PRA EVITAR ERROS
class Scene;

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

    Scene* getCena()
    {
        return referenciaCena;
    }

    void setCena( Scene* cena )
    {
        referenciaCena = cena;
    }


    ObjetoBase* getObjetoAbaixo()
    {
        return objectBelow;
    }

    void setObjetoAbaixo( ObjetoBase* novoObjetoAbaixo )
    {
        objectBelow = novoObjetoAbaixo;
    }

    void mudarNome( string novoValor )
    {
       nome = novoValor;
    }

    string getNome()
    {
        return nome;
    }

    void atualizarObjeto(Scene* cena, ObjetoBase* contextoObjeto);  // Apenas declaração aqui
    // VOU DEFINIR atualizarObjeto depois
};


class Scene{
    public: 
       vector<ObjetoBase*> objetos;
       string nomeCena;

    Scene() 
         :
         nomeCena(""),
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

        for( int i = 0 ; i < objetos.size() ; i++ )
        {
             ObjetoBase* obj = objetos[i];

             std::cout << "\n" << obj->getNome();
        }

        std::cout << std::endl; 
    }
};


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


class Objeto : public ObjetoBase{
   
    // NAO PRECISA REDECLARAR NADA DO ObjetoBase, a herança ja vai fazer isso

    public : Objeto( string nomeObjeto ) 
           // Faz a herança dos métodos e atributos
           : ObjetoBase( nomeObjeto )

           // NAO PRECISA INICIALIZAR DENOVO NADA DO ObjetoBase
    {
        
    }

    void mudarNome( string novoValor )
    {
        nome = novoValor;
    }

    string getNome()
    {
        return nome;
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
        std::cout << "(RODANDO getNome no carro:)\n";
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