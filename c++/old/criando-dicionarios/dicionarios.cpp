#include <memory>
#include <iostream>
#include <unordered_map>

int main() {
    std::unordered_map<std::string, std::string> dicionario;

    dicionario["ChaveString"] = "TESTE";
    dicionario["ChaveString2"] = "TESTE 2";
    dicionario["ChaveString3"] = "TESTE 3";

    std::cout << "\nVALOR 1 " << dicionario["ChaveString"];
    std::cout << "\nVALOR 2 " << dicionario["ChaveString2"];
    std::cout << "\nVALOR 3 " << dicionario["ChaveString3"];

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}