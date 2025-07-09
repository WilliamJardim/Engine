para criar classes estaticas é muito facil

<code>
class Biblioteca{

    // Atributos
    enum AlgumaCoisa { INT, STRING }
    int numero1;
    std::string texto;

    // Funcao que pode ser chamado MESMO sem instanciar a classe
    static int calularX()
    {
        return 100;
    }

}

int x = Biblioteca::calularX();

</code>

voce pode fazer isso, chamar os métodos estaticos.


## EXEMPLO MAIS ROBUSTO
<code>
#include <iostream>
#include <unordered_map>
#include <vector>
#include <string>
#include <functional>
#include <memory>

class JsonValue {
public:
    enum Type { INT, STRING, FUNCTION, OBJECT, ARRAY, NONE };
    Type type = NONE;

    int int_val;
    std::string str_val;
    std::function<void()> func_val;
    std::unordered_map<std::string, std::shared_ptr<JsonValue>> obj_val;
    std::vector<std::shared_ptr<JsonValue>> array_val;

    static std::shared_ptr<JsonValue> fromInt(int val) {
        auto j = std::make_shared<JsonValue>();
        j->type = INT;
        j->int_val = val;
        return j;
    }

    static std::shared_ptr<JsonValue> fromString(const std::string& val) {
        auto j = std::make_shared<JsonValue>();
        j->type = STRING;
        j->str_val = val;
        return j;
    }

    static std::shared_ptr<JsonValue> fromFunc(std::function<void()> val) {
        auto j = std::make_shared<JsonValue>();
        j->type = FUNCTION;
        j->func_val = val;
        return j;
    }

    void callFunc() const {
        if (type == FUNCTION) func_val();
    }
};

int main() {
    std::unordered_map<std::string, std::shared_ptr<JsonValue>> dict;

    dict["age"] = JsonValue::fromInt(30);
    dict["name"] = JsonValue::fromString("William");
    dict["say_hello"] = JsonValue::fromFunc([](){ std::cout << "Olá, William!\n"; });

    dict["say_hello"]->callFunc(); // Executa a função

    return 0;
}
</code>

Isso cria um objeto JSON usando os recursos nativos do C++