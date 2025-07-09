#include <memory>
#include <iostream>
#include <unordered_map>
#include <vector>

// Com o using std, não precisa ficar colocando std::ALGUMA_COISA toda hora
using namespace std;

int main() {
    unordered_map<string, vector<string> > dicionario;

    //dicionario["Teste"] = vector<string>({"1", "2", "3"});
    dicionario["Teste"] = {"1", "2", "3"};

    cout << dicionario["Teste"][1]; // Vai mostrar 2 na tela

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}