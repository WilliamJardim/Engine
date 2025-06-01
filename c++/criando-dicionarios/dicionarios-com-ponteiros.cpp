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