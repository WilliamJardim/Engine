Em alguns tipos de dados como string, boolean ou int, 
pra ver o conteudo/valor do ponteiro é necessario desreferenciar ele pra conseguir pegar seu valor
EXEMPLO:
<code>
#include <memory>
#include <iostream>
#include <unordered_map>

// Com o using std, não precisa ficar colocando std::ALGUMA_COISA toda hora
using namespace std;

int main() {
    std::unordered_map<std::string, std::string*> dicionario;

    string* nome = new string("TESTE");
    dicionario["ChaveString"] = nome;

    dicionario["Teste"] = new string("teste");

    // Pra mostrar o valor do ponteiro string precisa fazer isso *(expressao)
    std::cout << "\nVALOR 1 " << *(dicionario["ChaveString"]);
    std::cout << "\nVALOR 2 " << *(dicionario["Teste"]);

    // Libere a memória
    delete dicionario["ChaveString"];
    delete dicionario["Teste"];

    return 0; 
}
</code>

## MAIS NAO PRECISA COM OBJETOS QUANDO ACESSAMOS ATRIBUTOS DELES
<code>
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
</code>

Nesse caso não precisa desreferenciar nada