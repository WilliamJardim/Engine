Minha ideia de criar uma versão da minha Engine para C++

# Plano
## NAO FUNCIONA
 - Atributos não podem ser nulos em nenhum momento
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