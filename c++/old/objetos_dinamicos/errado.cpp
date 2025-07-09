#include <iostream>  // Inclui a biblioteca para entrada e saída
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
        Object objetos[];

    Scene() 
       : objetos()
    {
        // Criando objetos por código
        objetos[0] = Object("Teste 1");
        objetos[1] = Object("Teste 2");
    }

    Object[] getObjetos()
    {
        return objetos;
    }
};

int main() {
    std::cout << "Hello, World!" << std::endl;  // Exibe a mensagem na tela

    Scene cena;
    
    // Acessand os atributos dos objetos da cena
    std::cout << "\n";
    std::cout << cena.objetos[0].nome;

    std::cout << "\n";
    std::cout << cena.objetos[1].nome;

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}