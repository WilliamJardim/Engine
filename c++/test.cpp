#include <iostream>  // Inclui a biblioteca para entrada e saída
using namespace std;

class Scene{
    public:
        // Declara os atributos que a classe vai usar
        string exemplo1;

    Scene( string valorTeste ) 
        // Incializando atributos da classe
        : exemplo1(valorTeste)
    {
        // Nao tem mais nada aqui
    }

    string getExemplo(){
        return exemplo1;
    }
};

class Main{
    public:
        // Declara os atributos que a classe vai usar
        Scene sceneInstance1;
        Scene sceneInstance2;

    Main() 
       // Incializando atributos da classe
       : sceneInstance1("String qualquer"),
         sceneInstance2("String qualquer")
    {
        // Não tem mais nada aqui
    }

    Scene getScene1(){
        return sceneInstance1;
    }

    Scene getScene2(){
        return sceneInstance2;
    }
};

int main() {
    std::cout << "Hello, World!" << std::endl;  // Exibe a mensagem na tela

    Main mainObj;

    std:cout << mainObj.getScene1().getExemplo();

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}