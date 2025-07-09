# Duvida:
em c++, é possivel criar dicionarios dinamicos que armazenam funcoes(como ponteiro), ou varios outros atributos, e que eu posso adicionar novos? tipo uma estrutura JSON, tipo um array de dicionarios com atributos obrigatorios e ponteiros que podem ser nulo, ... ou um dicionario de dicionario, com as mesmas especificações, ou um dicionario gigante,.... todos eles dinamicos, suportando adicionar novas entradas a qualquer momento?

# RESPOSTA
Claro que sim!

# CRIAR UM TABELA HASH com CHAVE E VALOR: 
<code>
#include <memory>
#include <iostream>
#include <unordered_map>

std::unordered_map<std::string, TIPO_DE_DADO> dicionario;

dicionario["ChaveString"] = instancia_TIPO_DE_DADO;

</code>

Isso vai criar um dicionario ou tabela hash, que serve para armazenar objetos, ou numeros, textos, etc...
num formato CHAVE:VALOR, similar ao objeto javascript "var objeto = {}"


## Inclusive o TIPO_DE_DADO pode ser uma função
Exemplo:
<code>
std::unordered_map<std::string, std::function<void()> > dicionarioDeFuncoes;

</code>
Nesse exemplo, o "dicionarioDeFuncoes" é um dicionario que só contem funções indexadas pela CHAVE string

### Basta chamar a função pela CHAVE dela:
<code>
dicionarioDeFuncoes["nomeFuncao"]( parametrosDela );
</code>

OBS: Se a função tem parametros, declare eles no dicionario: std::function<void(int, std::string, etc....)>


# CRIAR UM ARRAY DE DICIONARIOS
Equivalente a um Array de JSON simples 

<code>
#include <unordered_map>
#include <vector>

std::vector< std::unordered_map<std::string, TIPO_DE_DADO> > listaDinamica;
</code>

ai isso é um vetor comum.
Eu posso adicionar elementos:

## ADICIONANDO UM NOVO DICIONARIO NESSA LISTA
<code>

std::unordered_map<std::string, TIPO_DE_DADO> novoDict;

listaDinamica.push_back( novoDict );
</code>


## OU O CONTRAIO: DICIONARIO DE ARRAYS
<code>
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

    return 0; 
}
</code>



# DICIONARIOS DE DICIONARIOS
Eu tambem posso ter dicionarios de dicionarios assim:
<code>
#include <memory>
#include <iostream>
#include <unordered_map>

std::unordered_map<std::string, std::unordered_map<std::string, TIPO_DE_DADO> > dicionarioDeDicionarios;
</code>

## DICIONARIOS DE DICIONARIOS (EXTRA)
Em DICIONARIOS DE DICIONARIOS, voce pode definir valores diretamente:
exemplo:
<code>
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

    return 0;  
}
</code>

Aqui eu não precisei criar novos dicionarios ao atribuir. 
**Eu ja tenho a estrutura, então, basta seguir o fluxo, basta atribuir normalmente**


# VALORES QUE PODEM SER NULOS EM DICIONARIOS
Para permitir valores nulo, basta usar ponteiros
<code>
#include <memory>
#include <iostream>
#include <unordered_map>

std::unordered_map<std::string, std::shared_ptr<TIPO_DE_DADO>> dicionarioComAtributosNulos;

dicionarioComAtributosNulos["chave"] = nullptr; // valor nulo
</code>



# OUTRAS COISAS QUE PODEM SER UTEIS
std::variant,
std::optional,
std::any,
Structured Bindings (auto [x, y])

Vale a pena estudar!


## EXEMPLO MAIS ROBUSTO
<code>
#include <iostream>
#include <unordered_map>
#include <functional>
#include <memory>
#include <variant>
#include <string>

using Attribute = std::variant<int, double, std::string, std::function<void()>>;

struct DynamicObject {
    std::unordered_map<std::string, Attribute> fields;
    
    void add(const std::string& key, Attribute value) {
        fields[key] = value;
    }

    void call(const std::string& key) const {
        if (auto it = fields.find(key); it != fields.end()) {
            if (auto func = std::get_if<std::function<void()>>(&it->second)) {
                (*func)();
            } else {
                std::cout << key << " is not a function\n";
            }
        }
    }
};
</code>