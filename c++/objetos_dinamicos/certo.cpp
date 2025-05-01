#include <iostream>  // Inclui a biblioteca para entrada e saída
#include <vector>
using namespace std;

class Object{
    public:
        // Declara os atributos que a classe vai usar
        string nome;

    Object( string nome )
        // Incializando atributos da classe
        : nome(nome)
    {
        // AQUI NAO QUERO FAZER NADA
    }
};

class Scene{
    public:
        // Declara os atributos que a classe vai usar
        std::vector<Object> objetos;

    Scene() 
       : objetos()
    {
        // Criando objetos por código
        objetos.push_back(Object("Teste 1"));
        objetos.push_back(Object("Teste 2"));
    }

    std::vector<Object> getObjetos()
    {
        return objetos;
    }
};

int main() {
    std::cout << "Hello, World!" << std::endl;  // Exibe a mensagem na tela

    Scene cena;
    
    // Acessando os atributos dos objetos da cena
    std::cout << "\n";
    std::cout << cena.objetos[0].nome;

    std::cout << "\n";
    std::cout << cena.objetos[1].nome;

    // Criando um novo objeto
    cena.objetos.push_back(Object("Teste 3"));

    // Acessando os atributos desse novo objeto
    std::cout << "\n";
    std::cout << cena.objetos[2].nome;

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}