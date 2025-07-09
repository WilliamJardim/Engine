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

    Main(
         Scene sceneInstance1,
         Scene sceneInstance2
       ) 
       // Incializando atributos da classe
       : sceneInstance1(sceneInstance1),
         sceneInstance2(sceneInstance2)
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

    // Declarando dois objetos do tipo Scene
    Scene scene1("Cena 1");
    Scene scene2("Cena 2");

    // Declarando um objeto mestre, que recebe outros dois objetos como parametro
    Main mainObj(scene1, 
                 scene2);

    // Usando eles
    std:cout << mainObj.getScene1().getExemplo();

    std:cout << mainObj.getScene2().getExemplo();

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}