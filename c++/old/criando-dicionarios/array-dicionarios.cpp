#include <memory>
#include <iostream>
#include <unordered_map>
#include <vector>

// Com o using std, não precisa ficar colocando std::ALGUMA_COISA toda hora
using namespace std;

int main() {
    // Criando o array de dicionarios
    vector<unordered_map<string, string>> arrayDicionarios;

    // Criando um dicionario para adicionar dados de teste
    unordered_map<string, string> dicionario1;
    dicionario1["Teste"] = "Teste";

    arrayDicionarios.push_back(dicionario1);

    // Criando outro dicionario para adicionar dados de teste
    unordered_map<string, string> dicionario2;
    dicionario2["Teste"] = "OUTRO";
    
    arrayDicionarios.push_back(dicionario2);

    
    // Mostrando
    cout << "\n" + arrayDicionarios[0]["Teste"]; 
    cout << "\n" + arrayDicionarios[1]["Teste"]; 

    return 0; 
}