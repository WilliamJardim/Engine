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

    void mudarValor( string novoValor )
    {
        exemplo1 = novoValor;
    }

    string getExemplo()
    {
        return exemplo1;
    }
};

class Main{
    public:
        // Declara os atributos que a classe vai usar AQUI ELES SÂO REFERENCIAS DIRETAS, OU SEJA, NAO SÂO CÒPIAS
        Scene& sceneInstance1;
        Scene& sceneInstance2;

    Main(
         Scene& scene1,
         Scene& scene2
       ) 
       // Incializando atributos da classe
       : sceneInstance1(scene1),
         sceneInstance2(scene2)
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
    std::cout << mainObj.getScene1().getExemplo();
    std::cout << "\n";
    std::cout << mainObj.getScene2().getExemplo();
    std::cout << "\n";

    // TESTANDO ALTERAR O VALOR DOS OBJETOS DIRETAMENTE
    scene1.exemplo1 = "TESTE 1";
    scene2.mudarValor( "TESTE 2" );

    std::cout << "\n";

    // VENDO SE ALTEROU
    std::cout << mainObj.getScene1().getExemplo();
    std::cout << "\n";
    std::cout << mainObj.getScene2().getExemplo();

    // AGORA DEU CERTO!

    return 0;  // Retorna 0 para indicar que o programa foi executado com sucesso
}