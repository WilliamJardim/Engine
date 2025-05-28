<code>
#include <iostream>
#include <vector>
#include <memory>  // para smart pointers

class Animal {
public:
    virtual void fazerSom() const {
        std::cout << "Som genérico de animal\n";
    }
    virtual ~Animal() {}
};

class Cachorro : public Animal {
public:
    void fazerSom() const override {
        std::cout << "Au au!\n";
    }

    void isso() const override {
        std::cout << "aaaa!\n";
    }

    void aquilo() const override {
        std::cout << "aaaa!\n";
    }
};

class Gato : public Animal {
public:
    void fazerSom() const override {
        std::cout << "Miau!\n";
    }
};

int main() {
    std::vector<std::unique_ptr<Animal>> animais;

    animais.push_back(std::unique_ptr<Animal>(new Cachorro()));
    animais.push_back(std::unique_ptr<Animal>(new Gato()));
    animais.push_back(std::unique_ptr<Animal>(new Animal()));

    for (const auto& animal : animais) {
        animal->fazerSom();
    }

    return 0;
}

</code>

# ALTERNATIVA

<code>
std::vector<Animal*> animais;

animais.push_back(new Cachorro());
animais.push_back(new Gato());
animais.push_back(new Animal());

for (auto animal : animais) {
    animal->fazerSom();
}

// Precisa liberar a memória manualmente!
for (auto animal : animais) {
    delete animal;
}

</code>

Pode ser asterisco no lugar do unique_ptr, mais ai eu preciso lembrar de deletar o ponteiro quanto nao for mais usar pra liberar memoria e evitar dados ultrapassando

OBS: ao usar o new, ele ja cria um ponteiro

OBS: ao usar * ele diz que a variavel é um ponteiro

OBS: pra funcionar, a classe precisa ter pelo menos um metodo virtual

OBS: metodos virtuais podem ser implementados em cada classe que herda a classe base que o método é virtual

