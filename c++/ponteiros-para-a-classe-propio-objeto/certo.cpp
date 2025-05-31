/**
* William Jardim
* 28/05/2025
* 
* Esse exemplo mostra como passar a cena para dentro dos objetos dinamicamente igual eu fiz no TypeScript
* Ele primeiro inicializa  ponteiro como NULL e depois atribui a cena nesse ponteiro
*/
#include <iostream>  // Inclui a biblioteca para entrada e saída
#include <vector>
using namespace std;

// <--- DECLARE OS SEUS TIPOS QUE VOCE VAI USAR PRA EVITAR ERROS
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

    virtual void mudarNome( string novoValor )
    {
       // Este método precisa ser implementado em classes derivadas
    }

    virtual string getNome()
    {
        // Este método precisa ser implementado em classes derivadas
        return "";
    }

    virtual void setCena( Scene* cena )
    {
        
    }

    virtual Scene* getCena()
    {
        return nullptr;
    }
    
    virtual void comprimentarObjetoAbaixo()
    {
        if( objectBelow != nullptr )
        {
            std::cout << "OBJETO " << nome << " Comprimentou o Objeto " << objectBelow->nome;
        }
    }

    void metodoQualquer()
    {
        std:cout << "\nTESTANDO METODO NAO VIRTUAL: No objeto " << nome;
    }
};

class Scene{
    public: 
       string nomeCena;
       vector<ObjetoBase*> objetos;

    Scene( string nomeCena ) 
         :
         nomeCena(nomeCena),
         objetos({}) // Inicializa a lista de objetos como um vetor vazio
    {
            
    }

    /**
    * Obtem o nome da cena
    */
    string getNomeCena()
    {
        return nomeCena;
    }   

    void renomearCena( string novoNomeCena )
    {
        nomeCena = novoNomeCena;
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
        // CRIEI UMA VARIAVEL QUALQUER SÒ PRA ILUSTRAR ATRIBUINDO O objectBelow dinamicamente
        // ESSE CODIGO NAO TEM OBJETIVO DE SIMULAR O COMPORTAMENTO REAL DA MINHA ENGINE
        // SO DE PROVAR HIPOTESES DE USO
        ObjetoBase* objetoAnterior = nullptr;

        for( size_t i = 0 ; i < objetos.size(); i++ )
        {
             ObjetoBase* obj = objetos[i];
             obj->objectBelow = objetoAnterior;

             // Define a cena dentro do OBJ usando o método que criei dentro dele
             obj->setCena(this);
             objetoAnterior = obj;
        }
    }

    void listarObjetos()
    {
        std::cout << "\n LISTA OBJETOS NA CENA:";

        for( size_t i = 0 ; i < objetos.size(); i++ )
        {
             ObjetoBase* obj    = objetos[i];
             Scene* cenaObj     = obj->getCena();
             string nomeCenaObj = cenaObj ? cenaObj->getNomeCena() : "(Sem cena)";

             // VERIFICANDO SE O PONTEIRO È NULO ANTES DE FAZER ALGUMA COISA ...
             if( obj->objectBelow != nullptr ){
                std::cout << "\n" << obj->getNome() << " na cena " << nomeCenaObj << " abaixo de " << obj->objectBelow->nome;
             
             }else{
                std::cout << "\n" << obj->getNome() << " na cena " << nomeCenaObj << " abaixo de " << "NENHUM";
             }
        }

        std::cout << std::endl; 
    }
};

class Objeto : public ObjetoBase{
    public: 
       string nome;
       Scene* referenciaCena;
       ObjetoBase* objectBelow;

    Objeto( string nomeObjeto ) 
        
        :
          // equivalente ao super() do javascript 
          ObjetoBase( nomeObjeto ), 

          // Incializando atributos da classe
          nome(nomeObjeto),
          referenciaCena(nullptr),
          objectBelow(nullptr)
    {
        /**
        * AQUI EU POSSO CHAMAR QUALQUER METODO DA CLASSE QUE EU HERDEI, POIS ELE HERDOU OS METODOS
        * MESMO QUE O METODO NAO SEJA VIRTUAL
        * OU SEJA, METODOS NÂO-VIRTUAIS QUE JA FORAM IMPLEMENTADOS NA CLASSE BASE PODEM SER CHAMADOS NORMALMENTE
        */
        metodoQualquer();
    }

    void mudarNome( string novoValor ) override
    {
        nome = novoValor;
    }

    string getNome() override
    {
        return nome;
    }

    void setCena( Scene* cena ) override 
    {
        referenciaCena = cena;
    }

    Scene* getCena() override 
    {
        return referenciaCena;
    }

    void comprimentarObjetoAbaixo() override
    {
        if( objectBelow != nullptr )
        {
            std::cout << "OBJETO " << nome << " Comprimentou o Objeto " << objectBelow->nome;
        }
    }
};


class Carro : public ObjetoBase{
    public: 
       string nome;
       string tipo;
       Scene* referenciaCena;
       ObjetoBase* objectBelow;

    Carro( string nomeObjeto, string tipoCarro ) 
        
        :
          // equivalente ao super() do javascript 
          ObjetoBase( nomeObjeto ), 

          // Incializando atributos da classe
          nome(nomeObjeto),
          tipo(tipoCarro),

          // Instancia a referencia da cena como sendo nula igual fiz no Objeto
          referenciaCena(nullptr),
          objectBelow(nullptr)
    {
        
    }

    void mostrarMensagemQualquer()
    {
        std:cout << "(RODANDO mostrarMensagemQualquer:)\n";
    }

    // FUNCAO QUE ILUSTRA ALGO ESPECIFICO QUE SÒ O CARRO VAI FAZER
    void fazerAlgoEspecifico()
    {
        std:cout << "(RODANDO getNome no carro:)\n";

        //SEI LA MUDAR O NOME DA CENA
        referenciaCena->renomearCena("NOVO NOME");

        // Outra coisa aleatoria
        Carro* esteObjeto = this;

        esteObjeto->mostrarMensagemQualquer();
    }

    /***
    * ATENCAO: SE VOCE ESQUERCER DE IMPLEMENTAR UM METODO, ELE VAI SER IGNORADO NA HORA QUE FOR CHAMADO
    */

    string getNome() override
    {
        fazerAlgoEspecifico();
        return nome;
    }

    string getTipo()
    {
        return tipo;
    }

    void setCena( Scene* cena ) override 
    {
        referenciaCena = cena;
    }

    Scene* getCena() override 
    {
        return referenciaCena;
    }
};

int main() {
    // Criando a cena
    Scene* cena = new Scene("Cena 1");

    std::cout << "NOME DA CENA NO COMEÇO PROGRAMA: " << cena->getNomeCena() << "\n";

    // Criando objetos diferentes
    Objeto* objeto1 = new Objeto("Objeto 1");
    Carro*  carro1  = new Carro("Carro 1", "Chao");

    objeto1->objectBelow = carro1;

    // Adicionando ambos os objetos na cena
    cena->adicionarObjeto( objeto1 );
    cena->adicionarObjeto( carro1 );

    // Atualiza os objetos na cena
    cena->atualizarObjetos();

    // Mostra os objetos que estao na cena
    cena->listarObjetos();  

    objeto1->comprimentarObjetoAbaixo();

    objeto1->metodoQualquer();

    std::cout << "\nNOME DA CENA NO FIM PROGRAMA: " << cena->getNomeCena() << "\n";

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}