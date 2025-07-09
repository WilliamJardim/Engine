/**
* William Jardim
* 09/07/2025, 14:40 PM
*
* ABRANJE: Construtores, herança, polimorfismo, 
*
*          Implentação de métodos virtuais nos objetos 
*          Ponteiros que podem ser nulos, e que fazem referencias(apontam) a outros objetos
*          
*          Metodos virtuais junto com métodos normais
*          
*
* CAPACIDADE: Cena, ObjetoBase e Objetos que herdam ele.

*             A cena tem um Array de Objetos. 

              E cada objeto tem: 
                 - Os métodos que a ObjetoBase tem(metodos normais), 
                 - Implantação de métodos virtuais(cada objeto tem sua propia implantação dos métodos), 
                 - E também métodos novos e exclusivos só dele

              Cada objeto tem uma referencia a Cena, e pode ter referencia a outros objetos (como o objectBelow que representa o objeto abaixo dele)

              Dentro da cena, é possivel listar, modificar e percorrer cada objeto usando laços for

              Dentro do contexto de um Objeto também é possivel acessar ou modificar a cena, inclusive fazer coisas com outros objetos, percorrer eles com laços for, etc....

              Suporte a várias cenas

              Suporte a vários objetos

              Pode-se Adicionar objetos dinamicamente na cena
*                    
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

    // METODO PRONTO QUE QUALQUER CLASSE VAI HERDAR
    void mudarNome( string novoValor )
    {
       nome = novoValor;
    }

    virtual string getNome()
    {
        // Apenas declaração virtual aqui que vou definir nos objetos que herdam a classe
        return "";
    }

    virtual void atualizarObjeto(Scene* cena, ObjetoBase* contextoObjeto)
    {
        // Apenas declaração virtual aqui que vou definir nos objetos que herdam a classe
    }
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

    /**
    * Uma função pra ilustrar o conceito de atualização de objetos na cena 
    */
    void atualizarObjetos()
    {
        for( size_t i = 0 ; i < objetos.size(); i++ )
        {
             ObjetoBase* obj      = objetos[i];
             string      nomeObj  = obj->getNome();
             Scene*      cenaObj  = obj->getCena();

             // Verifica se o ponteiro não é nulo ( esse IF não vai funcionar se o ponteiro apontar ao propio objeto )
             if( obj != nullptr )
             {
                // Define a cena dentro do OBJ usando o método que criei dentro dele
                obj->setCena(this);    

                // Atualiza o objeto
                obj->atualizarObjeto(this, obj);
             }
        }
    }

    void listarObjetos()
    {
        std::cout << "\n LISTA OBJETOS NA CENA:\n";

        for( int i = 0 ; i < objetos.size() ; i++ )
        {
             ObjetoBase* obj         = objetos[i];
             string      nomeObj     = obj->getNome();
             Scene*      cenaObj     = obj->getCena();
             string      nomeCenaObj = cenaObj->nomeCena;

             std::cout << nomeObj << " na " << nomeCenaObj << '\n';
        }

        std::cout << std::endl; 
    }
};


class VirtualMesh : public ObjetoBase
{
    public:
    VirtualMesh( string nomeObjeto ) 
        // Incializando atributos da classe
        : ObjetoBase( nomeObjeto )
    {
        
    }
};

class Objeto : public VirtualMesh{
   
    // NAO PRECISA REDECLARAR NADA DO ObjetoBase, a herança ja vai fazer isso

    public : Objeto( string nomeObjeto ) 
           // Faz a herança dos métodos e atributos
           : VirtualMesh( nomeObjeto )

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

    // IMPLEMENTAÇÂO DO MÈTODO VIRTUAL DA CLASSE BASE
    void atualizarObjeto( Scene* cena, VirtualMesh* contextoObjeto )
    {
        VirtualMesh* esteObjeto     = this;
        string       nomeObjeto     = esteObjeto->getNome();
        Scene*       cenaObjeto     = esteObjeto->getCena(); 
        string       nomeCena       = cenaObjeto->nomeCena;

        if( cenaObjeto != nullptr )
        {
            std::cout << "\nATUALIZANDO OBJETO " << nomeObjeto << " QUE ESTA NA CENA " << nomeCena << '\n';

            // Percorre todos os objetos da cena
            for( int i = 0 ; i < cenaObjeto->objetos.size() ; i++ )
            {
                // Aqui usei dynamic_cast pra ele entender que um VisualMesh também é uma derivação de ObjectBase
                // Então ele pega o objeto cujo indice é "i", que é originamente um ObjectBase e converte para um VirtualMesh
                VirtualMesh* objAtualCena      = dynamic_cast<VirtualMesh*>( cenaObjeto->objetos[i] );
                string       nomeObjAtualCena  = objAtualCena->getNome();

                // Se nao for ele mesmo
                if( nomeObjAtualCena != nomeObjeto )
                {
                    std::cout << "O objeto " << nomeObjeto << " esta enxergando o objeto " << nomeObjAtualCena;
                }
            }

        }else{
            std::cout << "\nATUALIZANDO OBJETO " << nomeObjeto << " QUE NAO TEM CENA";
        }
    }
};



class Carro : public VirtualMesh{
    public: 
       // NAO PRECISA REDECLARAR NADA DO ObjetoBase, a herança ja vai fazer isso
       // SO VOU CRIAR OS NOVOS DADOS:
       string tipo;

    Carro( string nomeObjeto, string tipoCarro ) 
    
          // Faz a herança dos métodos e atributos
          : VirtualMesh( nomeObjeto ),

          // Incializando atributos NOVOS da classe
          tipo(tipoCarro)

          // NAO PRECISA INICIALIZAR DENOVO NADA DO ObjetoBase
    {
        
    }

    // FUNCAO QUE ILUSTRA ALGO ESPECIFICO QUE SÒ O CARRO VAI FAZER
    void fazerAlgoEspecifico()
    {
        mudarNome("CARRO EDITADO");
    }

    string getNome()
    {
        // Implantação que tem um passo a mais
        fazerAlgoEspecifico();
        return nome;
    }

    string getTipo()
    {
        return tipo;
    }

    // IMPLEMENTAÇÂO DO MÈTODO VIRTUAL DA CLASSE BASE
    void atualizarObjeto( Scene* cena, ObjetoBase* contextoObjeto )
    {
        VirtualMesh* esteObjeto    = this;
        string      nomeObjeto     = esteObjeto->getNome();
        Scene*      cenaObjeto     = esteObjeto->getCena(); 
        string      nomeCena       = cenaObjeto->nomeCena;

        if( cenaObjeto != nullptr )
        {
            std::cout << "\nATUALIZANDO OBJETO " << nomeObjeto << " QUE ESTA NA CENA " << nomeCena << '\n';

            // Percorre todos os objetos da cena
            for( int i = 0 ; i < cenaObjeto->objetos.size() ; i++ )
            {
                VirtualMesh* objAtualCena      = dynamic_cast<VirtualMesh*>( cenaObjeto->objetos[i] );
                string       nomeObjAtualCena  = objAtualCena->getNome();

                // Se nao for ele mesmo
                if( nomeObjAtualCena != nomeObjeto )
                {
                    std::cout << "O objeto " << nomeObjeto << " esta enxergando o objeto " << nomeObjAtualCena;
                }
            }

        }else{
            std::cout << "\nATUALIZANDO OBJETO " << nomeObjeto << " QUE NAO TEM CENA";
        }
    }
};

int main() {
    // Criando a cena
    Scene* cena = new Scene();

    // Dando um nome pra cena
    cena->nomeCena = "CENA 1";

    // Criando objetos diferentes
    Objeto* objeto1 = new Objeto("Objeto 1");
    Carro*  carro1  = new Carro("Carro 1", "Chao");

    // Adicionando ambos os objetos na cena
    cena->adicionarObjeto( objeto1 );
    cena->adicionarObjeto( carro1 );

    // Atualiza os objetos
    cena->atualizarObjetos();

    // Mostra os objetos que estao na cena
    cena->listarObjetos();  

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}