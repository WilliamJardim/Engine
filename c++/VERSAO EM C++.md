Minha ideia de criar uma versão da minha Engine para C++

# Plano
## NAO FUNCIONA
 - Atributos não podem ser nulos em nenhum momento(exceto se forem ponteiros)
 - strings sem aspas duplas

## OKAY
    ### CLASSES
        - Pode usar classes
        - Criar objetos(instancias dessas classes)

    ### REFERENCIAS DE OBJETOS
        - "Scene scene1;" = Cria um objeto        
        - "Scene cenaCopia = scene1;" = Copia um objeto SEM REFERENCIA
        - "Scene& cenaRef = scene1;" = ISSO NAO COPIA NADA, APENAS CRIA UMA REFERENCIA DE ACESSO DIRETO

    ### OBJETOS DINAMICOS
        - Pode criar array de objetos
        - Pode usar o push_back pra adicionar novos objetos dentro do array de objetos

    ### GETTERS:
        - Pode usar getters getIsso(), getAquilo()
        - Pode usar getters de getters: getIsso().getAquilo()

    ### ATRIBUTOS:
        - Pode acessar atributos da classe: classe.isso
        - Pode alterar o valor de atributos da classe diretamente: classe.isso = "TESTE" (SE ELA FOR UMA REFERENCIA E NÂO UMA COPIA)
        - Pode criar setters: setIsso( valor )

    - Dentro da classe não precisa usar this nos métodos

    ### VARIAVEIS NULAS:
        - Pode usar ponteiros para representar objetos que podem ser nulos
    
    ### Arrays flexiveis:
        - Pode usar ponteiros para usar polimorfismo,
          Por exemplo, ter um array de um objeto base, e esse mesmo array armazenar outros objetos que herdam esse objeto base.

    ### retornar arrays criados na hora
        - da pra fazer igual no JavaScript, mais de um jeito diferente usando ponteiros e std::vector

    ### callbacks dentro de objetos, tipos personalizados
        - é possivel criar tipos personalizados, estruturas(equivalentes a interfaces), classes abstratas, classes, 
        - é possivel que os atributos das classes ou tipos sejam ponteiros de funções
        - metodos em classes abstratas podem ser implementados de forma personalizada para cada objeto que herda essa classe,
        
        - tambem é possivel fazer overrides facilmente

    ### LIMPAR UM ARRAY APAGANDO SEUS ELEMENTOS
        - é possivel, usando o método clear(), se for um array do tipo std::vector
        - se for um std:array dá pra usar .fill(nullptr)

        Isso só funciona se o tipo de dado do Array for um ponteiro Ex: "std::vector<ObjectBase*>", cada elemento do array seria um ponteiro de ObjectBase

    ### Adicionar elementos no Array
       - Se for um std::vector, pode usar o push_back que é igual ao push do javascript

    ### Interfaces
        - Como ja mencionado, interfaces em C++ são structs. Existe!

    ### tipos personalizados
        - Pode usar structs ou Typedef

    ## Objetos e ponteiros
        - Objetos criados por valor (ex: Scene s;) sempre existem até o fim do escopo
        - Objetos criados com `new` são ponteiros, precisam de `delete` para liberar memória
        - Smart pointers (`std::unique_ptr`, `std::shared_ptr`) ajudam no gerenciamento automático

    ## Arrays dinâmicos
        - `int arr[10];` tamanho fixo, alocado no stack
        - `std::vector<int> v;` tamanho dinâmico, pode usar `push_back`

    ## Interfaces (Classes abstratas)
        - Definidas com métodos virtuais puros:
        ```cpp
        struct ICallback {
            virtual void execute() = 0;
            virtual ~ICallback() {}
        };