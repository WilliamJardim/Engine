#include <memory>
#include <iostream>
#include <unordered_map>

// Com o using std, não precisa ficar colocando std::ALGUMA_COISA toda hora
using namespace std;

class ObjetoBase{
    public: 
       string nome;
       ObjetoBase* objectBelow;

    ObjetoBase( string nomeObjeto ) 
        // Incializando atributos da classe
        : nome(nomeObjeto),
          objectBelow(nullptr)
    {
        
    }
};

int main() {
    std::unordered_map<std::string, ObjetoBase*> dicionario;

    ObjetoBase* objeto1 = new ObjetoBase("Objeto 1");
    ObjetoBase* objeto2 = new ObjetoBase("Objeto 2");
    dicionario["O1"] = objeto1;
    dicionario["O2"] = objeto2;
    
    std::cout << "\nVALOR 1 " << dicionario["O1"]->nome;
    std::cout << "\nVALOR 2 " << dicionario["O2"]->nome;

    // Libere a memória
    delete dicionario["O1"];
    delete dicionario["O2"];

    return 0; 
}