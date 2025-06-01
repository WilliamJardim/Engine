#include <memory>
#include <iostream>
#include <unordered_map>
#include <vector>

// Com o using std, não precisa ficar colocando std::ALGUMA_COISA toda hora
using namespace std;

int main() {
    unordered_map<string, unordered_map<string, int> > dicionario;

    dicionario["A"]["A"] = 10;
    dicionario["A"]["B"] = 15;

    cout << "\n" << dicionario["A"]["A"]; // Vai mostrar 10 na tela
    cout << "\n" << dicionario["A"]["B"]; // Vai mostrar 15 na tela

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}